import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MyLogger } from '@src/configs/logger/my-logger';
import { Forbidden, Unauthorized } from '@src/common/exception/definition.exception';

import { AdminService } from '@src/admin/admin.service';
import { BannedIp } from './entity/banned-ip.entity';
import { DiscardedToken } from './entity/discardedToken.entity';
import { FailedSigninAttemptsCache } from './failed-signin-attempts-cache';
import { HashService } from '@src/common/utils/hash';
import { Admin, AdminRoleType } from '@src/admin/entity.ts/admin.entity';

enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
type JwtPayload = { id: number; role: AdminRoleType; exp: number; fingerprint: string } & Record<string, any>;
type SigninParams = { email: string; password: string; ip: string; fingerprint: string };
type RefreshParams = { refreshToken: string; ip: string; fingerprint: string; now: Date };

@Injectable()
export class AuthService {
  private readonly _JWT_SECRET: string;
  private readonly _JWT_REFRESH_SECRET: string;
  private readonly _ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS: number;
  private readonly _REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS: number;
  private readonly _REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS: number;

  constructor(
    private readonly logger: MyLogger,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly hashService: HashService,
    private readonly failedSigninAttemptsCache: FailedSigninAttemptsCache,
    @InjectRepository(DiscardedToken)
    private readonly discardedTokenRepository: Repository<DiscardedToken>,
    @InjectRepository(BannedIp)
    private readonly bannedIpRepository: Repository<BannedIp>,
  ) {
    this._JWT_SECRET = this.configService.get('SM_JWT_SECRET');
    this._JWT_REFRESH_SECRET = this.configService.get('SM_JWT_REFRESH_SECRET');
    this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS = this.configService.get('SM_JWT_ACCESS_EXPIRE_TIME');
    this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_EXPIRE_TIME');
    this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_TOKEN_RENEWAL_PERIOD');
  }

  verifyJwt(token: string, tokenType: TokenType = TokenType.ACCESS): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
  }

  private _signJwt(payload: Record<string, any>, tokenType: TokenType = TokenType.ACCESS): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
  }

  private async _authenticate(email: string, password: string) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);
    const isPasswordCorrect = await this.hashService.compare(password, admin.password);
    if (!isPasswordCorrect) throw new Unauthorized();

    return admin;
  }

  async signin({ email, password, ip, fingerprint }: SigninParams) {
    const failedAttempts = await this.failedSigninAttemptsCache.get(email);
    if (failedAttempts >= 5) throw new Forbidden('Too many failed login attempts');

    let admin: Admin;
    try {
      admin = await this._authenticate(email, password);
    } catch (e) {
      this.logger.warn({ message: 'authentication failed', ip });
      await this.failedSigninAttemptsCache.set(email, (failedAttempts || 0) + 1);
      throw e;
    }

    const [accessToken, refreshToken] = await Promise.all([
      this._signJwt({
        id: admin.id,
        role: admin.role,
        exp: this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS,
        fingerprint,
      }),
      this._signJwt(
        {
          id: admin.id,
          role: admin.role,
          exp: this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS,
          fingerprint,
        },
        TokenType.REFRESH,
      ),
    ]);

    if (failedAttempts > 0) await this.failedSigninAttemptsCache.clear(email);
    return {
      admin,
      accessTokenInfo: {
        token: accessToken,
        exp: this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS,
      },
      refreshTokenInfo: {
        token: refreshToken,
        exp: this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS,
      },
    };
  }

  private _reachRefreshTokenRenewalPeriod(exp: number, now: Date) {
    const refreshTokenExpiry = new Date(exp * 1000);
    const timeDiffInSeconds = (refreshTokenExpiry.getTime() - now.getTime()) / 1000;
    return timeDiffInSeconds <= this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS;
  }

  private async _banIp(ip: string) {
    const bannedIp = new BannedIp();
    bannedIp.ip = ip;
    return this.bannedIpRepository.save(bannedIp);
  }

  async isBanned(ip: string) {
    const bannedIp = await this.bannedIpRepository.findOne({ where: { ip } });
    return !!bannedIp;
  }

  async discardToken(token: string) {
    const discardedToken = DiscardedToken.of({ token, createdAt: new Date() });
    return this.discardedTokenRepository.save(discardedToken);
  }

  private async _isDiscardedToken(token: string) {
    const discardedToken = await this.discardedTokenRepository.findOne({ where: { token } });
    return !!discardedToken;
  }

  async refresh({ refreshToken, ip, fingerprint, now }: RefreshParams) {
    if (await this._isDiscardedToken(refreshToken)) {
      this.logger.warn({ message: 'refresh token is discarded', ip });
      await this._banIp(ip);
      throw new Forbidden();
    }

    let payload: JwtPayload;
    try {
      payload = await this.verifyJwt(refreshToken, TokenType.REFRESH);
      if (payload.fingerprint !== fingerprint) throw Error('fingerprint mismatch');
    } catch (e) {
      this.logger.warn({ message: e.message, ip });
      throw new Unauthorized();
    }

    const accessToken = await this._signJwt({
      id: payload.id,
      role: payload.role,
      exp: this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS,
    });

    if (this._reachRefreshTokenRenewalPeriod(payload.exp, now)) {
      refreshToken = await this._signJwt(
        {
          id: payload.id,
          role: payload.role,
          exp: this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS,
          fingerprint,
        },
        TokenType.REFRESH,
      );
      await this.discardToken(refreshToken);
    }

    return {
      accessTokenInfo: {
        token: accessToken,
        exp: this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS,
      },
      refreshTokenInfo: {
        token: refreshToken,
        exp: this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS,
      },
    };
  }
}
