import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthenticationFailed, Forbidden, TokenExpired, Unauthorized } from '@src/common/exception/definition.exception';

import { AdminService } from '@src/admin/admin.service';
import { BannedIp } from './entity/banned-ip.entity';
import { FailedSigninAttemptCache } from './cache/failed-signin-attempt.cache';
import { HashService } from '@src/common/utils/hash';
import { DiscardedTokenCache } from './cache/discarded-token.cache';
import { Admin, AdminRoleType } from '@src/admin/entity/admin.entity';

export const TOKEN_EXPIRED_ERROR = 'jwt expired';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
type TokenPayload = { email: string; role: AdminRoleType; exp: number; fingerprint: string } & Record<string, any>;
type SignTokenParams = { claims: Record<string, any>; signDate: Date; tokenType?: TokenType };
type VerifyTokenParams = { token: string; fingerprint: string; tokenType?: TokenType };
type AuthenticateParams = { email: string; password: string };
type SigninParams = { email: string; password: string; ip: string; fingerprint: string; signinDate?: Date };
type DiscardTokenParams = { token: string; exp: number; currentDate?: Date };
type RefreshParams = { refreshToken: string; ip: string; fingerprint: string; refreshDate?: Date };

@Injectable()
export class AuthService {
  private readonly _ACCESS_TOKEN_SECRET: string;
  private readonly _REFRESH_TOKEN_SECRET: string;
  private readonly _ACCESS_TOKEN_LIFETIME_IN_SECONDS: number;
  private readonly _REFRESH_TOKEN_LIFETIME_IN_SECONDS: number;
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
    this._ACCESS_TOKEN_SECRET = this.configService.get('SM_JWT_SECRET');
    this._REFRESH_TOKEN_SECRET = this.configService.get('SM_JWT_REFRESH_SECRET');
    this._ACCESS_TOKEN_LIFETIME_IN_SECONDS = this.configService.get('SM_JWT_ACCESS_LIFETIME');
    this._REFRESH_TOKEN_LIFETIME_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_LIFETIME');
    this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_TOKEN_RENEWAL_PERIOD');
  }

  get accessTokenLifetimeInSeconds() {
    return this._ACCESS_TOKEN_LIFETIME_IN_SECONDS;
  }

  get refreshTokenLifetimeInSeconds() {
    return this._REFRESH_TOKEN_LIFETIME_IN_SECONDS;
  }

  private _signToken({ claims, signDate, tokenType = TokenType.ACCESS }: SignTokenParams): Promise<string> {
    claims.exp = signDate.getTime() / 1000 + (tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_LIFETIME_IN_SECONDS : this._REFRESH_TOKEN_LIFETIME_IN_SECONDS);

    return this.jwtService.signAsync(claims, {
      secret: tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_SECRET : this._REFRESH_TOKEN_SECRET,
    });
  }

  async verifyToken({ token, fingerprint, tokenType = TokenType.ACCESS }: VerifyTokenParams): Promise<TokenPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_SECRET : this._REFRESH_TOKEN_SECRET,
    });
    if (payload.fingerprint !== fingerprint) throw Error('fingerprint mismatch');
    return payload;
  }

  private async _authenticate({ email, password }: AuthenticateParams) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);
    const isPasswordCorrect = await this.hashService.compare(password, admin.password);
    if (!isPasswordCorrect) throw new AuthenticationFailed();

    return admin;
  }

  async signin({ email, password, ip, fingerprint, signinDate = new Date() }: SigninParams) {
    const failedSigninCount = await this.failedSigninAttemptCache.get(email);
    if (failedSigninCount >= 5) throw new Forbidden('too many failed');

    let admin: Admin;
    try {
      admin = await this._authenticate({ email, password });
    } catch (e) {
      this.logger.warn({ message: e.message, ip });
      await this.failedSigninAttemptCache.set(email, failedSigninCount + 1);
      throw e;
    }

    const [accessToken, refreshToken] = await Promise.all([
      this._signToken({ claims: { email: admin.email, role: admin.role, fingerprint }, signDate: signinDate }), //
      this._signToken({ claims: { email: admin.email, role: admin.role, fingerprint }, signDate: signinDate, tokenType: TokenType.REFRESH }),
    ]);
    if (failedSigninCount > 0) await this.failedSigninAttemptCache.clear(email);

    return { admin, accessToken, refreshToken };
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

  async discardToken({ token, exp, currentDate = new Date() }: DiscardTokenParams) {
    const remainingTime = Math.max(exp * 1000 - currentDate.getTime(), 0);
    if (remainingTime <= 0) return;
    await this.discardedTokenCache.set(token, remainingTime);
  }

  private async _isDiscardedToken(token: string) {
    return !!(await this.discardedTokenCache.get(token));
  }

  async refresh({ refreshToken, ip, fingerprint, refreshDate = new Date() }: RefreshParams) {
    if (await this._isDiscardedToken(refreshToken)) {
      this.logger.warn({ message: 'refresh token is discarded', ip });
      await this.banIp(ip);
      throw new Forbidden();
    }

    let payload: TokenPayload;
    try {
      payload = await this.verifyToken({ token: refreshToken, fingerprint, tokenType: TokenType.REFRESH });
    } catch (e) {
      this.logger.warn({ message: e.message, ip });
      if (e.message === TOKEN_EXPIRED_ERROR) throw new TokenExpired();
      await this.banIp(ip);
      throw new Unauthorized();
    }

    const claims = { email: payload.email, role: payload.role, fingerprint };
    const accessToken = await this._signToken({ claims, signDate: refreshDate, tokenType: TokenType.ACCESS });
    if (this._isWithinRefreshTokenRenewalPeriod(payload.exp, refreshDate)) {
      [refreshToken] = await Promise.all([
        this._signToken({ claims, signDate: refreshDate, tokenType: TokenType.REFRESH }),
        this.discardToken({ token: refreshToken, exp: payload.exp, currentDate: refreshDate }), //
      ]);
    }

    return { accessToken, refreshToken };
  }
}
