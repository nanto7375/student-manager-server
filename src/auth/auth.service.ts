import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MyLogger } from '@src/configs/logger/my-logger';
import { Forbidden, Unauthorized } from '@src/common/exception/definition.exception';

import { AdminService } from '@src/admin/admin.service';
import { BannedIp } from './entity/banned-ip.entity';
import { FailedSigninAttemptCache } from './cache/failed-signin-attempt.cache';
import { HashService } from '@src/common/utils/hash';
import { Admin, AdminRoleType } from '@src/admin/entity.ts/admin.entity';
import { DiscardedTokenCache } from './cache/discarded-token.cache';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
type JwtPayload = { id: number; role: AdminRoleType; exp: number; fingerprint: string } & Record<string, any>;
type SigninParams = { email: string; password: string; ip: string; fingerprint: string };
type RefreshParams = { refreshToken: string; ip: string; fingerprint: string; now: Date };

export const JWT_EXPIRED_ERROR = 'jwt expired';

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
    private readonly failedSigninAttemptCache: FailedSigninAttemptCache,
    private readonly discardedTokenCache: DiscardedTokenCache,
    @InjectRepository(BannedIp)
    private readonly bannedIpRepository: Repository<BannedIp>,
  ) {
    this._JWT_SECRET = this.configService.get('SM_JWT_SECRET');
    this._JWT_REFRESH_SECRET = this.configService.get('SM_JWT_REFRESH_SECRET');
    this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS = this.configService.get('SM_JWT_ACCESS_EXPIRE_TIME');
    this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_EXPIRE_TIME');
    this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_TOKEN_RENEWAL_PERIOD');
  }

  private _signJwt(payload: Record<string, any>, tokenType: TokenType = TokenType.ACCESS): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
  }

  async verifyJwt({ token, fingerprint, tokenType = TokenType.ACCESS }: VerifyJwtParams): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
    if (payload.fingerprint !== fingerprint) throw Error('fingerprint mismatch');
    return payload;
  }

  private async _authenticate(email: string, password: string) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);
    const isPasswordCorrect = await this.hashService.compare(password, admin.password);
    if (!isPasswordCorrect) throw new Unauthorized('wrong password');

    return admin;
  }

  async signin({ email, password, ip, fingerprint }: SigninParams) {
    const failedSigninCount = await this.failedSigninAttemptCache.get(email);
    if (failedSigninCount >= 5) throw new Forbidden('too many failed');

    let admin: Admin;
    try {
      admin = await this._authenticate(email, password);
    } catch (e) {
      this.logger.warn({ message: e.message, ip });
      await this.failedSigninAttemptCache.set(email, failedSigninCount + 1);
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
    if (failedSigninCount > 0) await this.failedSigninAttemptCache.clear(email);

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

  private _isWithinRefreshTokenRenewalPeriod(exp: number, now: Date) {
    const refreshTokenExpiry = new Date(exp * 1000);
    const timeDiffInSeconds = (refreshTokenExpiry.getTime() - now.getTime()) / 1000;
    return timeDiffInSeconds <= this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS;
  }

  async banIp(ip: string) {
    const bannedIp = new BannedIp();
    bannedIp.ip = ip;
    return this.bannedIpRepository.save(bannedIp);
  }

  async isBannedIp(ip: string) {
    const bannedIp = await this.bannedIpRepository.findOne({ where: { ip } });
    return !!bannedIp;
  }

  async discardToken({ token, exp, now = new Date() }: DiscardTokenParams) {
    const remainingTime = exp * 1000 - now.getTime();
    await this.discardedTokenCache.set(token, remainingTime);
    return true;
  }

  private async _isDiscardedToken(token: string) {
    return !!(await this.discardedTokenCache.get(token));
  }

  async refresh({ refreshToken, ip, fingerprint, now }: RefreshParams) {
    if (await this._isDiscardedToken(refreshToken)) {
      this.logger.warn({ message: 'refresh token is discarded', ip });
      await this.banIp(ip);
      throw new Forbidden();
    }

    let payload: JwtPayload;
    try {
      payload = await this.verifyJwt({ token: refreshToken, fingerprint, tokenType: TokenType.REFRESH });
    } catch (e) {
      this.logger.warn({ message: e.message, ip });
      await this.banIp(ip);
      throw new Unauthorized();
    }

    const accessToken = await this._signJwt({
      id: payload.id,
      role: payload.role,
      exp: this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS,
      fingerprint,
    });

    if (this._isWithinRefreshTokenRenewalPeriod(payload.exp, now)) {
      const result = await Promise.all([
        this.discardToken({ token: refreshToken, exp: payload.exp, now }),
        this._signJwt(
          {
            id: payload.id,
            role: payload.role,
            exp: this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS,
            fingerprint,
          },
          TokenType.REFRESH,
        ),
      ]);
      refreshToken = result[1];
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

type VerifyJwtParams = { token: string; fingerprint: string; tokenType?: TokenType };
type DiscardTokenParams = { token: string; exp: number; now?: Date };
