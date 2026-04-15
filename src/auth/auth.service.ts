import { Request } from 'express';
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { MyLogger } from '@src/configs/logger/my-logger';

import { AdminService } from '@src/admin/admin.service';
import { FailedSigninAttemptCache } from './cache/failed-signin-attempt.cache';
import { MyBcrypt } from '@src/common/utils/bcrypt';
import { DiscardedTokenCache } from './cache/discarded-token.cache';
import { AdminRoleType } from '@src/admin/admin.service';
import { createHash } from 'crypto';
import { Admin } from '@src/generated/prisma/client';

export const TOKEN_EXPIRED_ERROR = 'jwt expired';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
type TokenPayload = { adminId: number; email: string; role: AdminRoleType; exp: number; fingerprint: string } & Record<string, any>;
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
    private readonly myBcrypt: MyBcrypt,
    private readonly failedSigninAttemptCache: FailedSigninAttemptCache,
    private readonly discardedTokenCache: DiscardedTokenCache,
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

  getFingerprint(req: Request) {
    const components = [
      req.headers['user-agent'] || '', // 브라우저/OS 정보
      req.headers['sec-ch-ua'] || '', // 브라우저 버전
      req.headers['sec-ch-ua-platform'] || '', // OS
      req.headers['sec-ch-ua-mobile'] || '', // 모바일 여부
      req.headers['accept-language'] || '', // 언어 설정
    ];
    return createHash('sha256').update(components.join(':')).digest('hex');
  }

  private _signToken({ claims, signDate, tokenType = TokenType.ACCESS }: SignTokenParams): Promise<string> {
    const secret = tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_SECRET : this._REFRESH_TOKEN_SECRET;

    const now = signDate.getTime() / 1000;
    const tokeLifeTime = tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_LIFETIME_IN_SECONDS : this._REFRESH_TOKEN_LIFETIME_IN_SECONDS;
    claims.exp = now + tokeLifeTime;

    return this.jwtService.signAsync(claims, { secret });
  }

  async verifyToken({ token, fingerprint, tokenType = TokenType.ACCESS }: VerifyTokenParams): Promise<TokenPayload> {
    const secret = tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_SECRET : this._REFRESH_TOKEN_SECRET;

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret });
      if (payload.fingerprint !== fingerprint) throw Error('invalid-fingerprint');
      return payload;
    } catch (error) {
      this.logger.error(error);
      if (error.message === TOKEN_EXPIRED_ERROR) throw new HttpException('token-expired', 401);
      throw new UnauthorizedException();
    }
  }

  private async _authenticate({ email, password }: AuthenticateParams) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);
    const isPasswordCorrect = await this.myBcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) throw new UnauthorizedException();

    return admin;
  }

  async signin({ email, password, ip, fingerprint, signinDate = new Date() }: SigninParams) {
    const failedSigninCount = await this.failedSigninAttemptCache.get(email);
    if (failedSigninCount >= 5) throw new UnauthorizedException();

    let admin: Admin;
    try {
      admin = await this._authenticate({ email, password });
    } catch (e) {
      this.logger.warn({ message: e.message, email, ip });
      await this.failedSigninAttemptCache.set(email, failedSigninCount + 1);
      throw e;
    }

    const claims = { adminId: admin.id, email: admin.email, role: admin.role, fingerprint };
    const [accessToken, refreshToken] = await Promise.all([
      this._signToken({ claims, signDate: signinDate }), //
      this._signToken({ claims, signDate: signinDate, tokenType: TokenType.REFRESH }),
    ]);
    if (failedSigninCount > 0) await this.failedSigninAttemptCache.clear(email);

    return { admin, accessToken, refreshToken };
  }

  // async banIp(ip: string) {
  //   const bannedIp = new BannedIp();
  //   bannedIp.ip = ip;
  //   return this.bannedIpRepository.save(bannedIp);
  // }

  // async isBannedIp(ip: string) {
  //   const bannedIp = await this.bannedIpRepository.findOne({ where: { ip } });
  //   return !!bannedIp;
  // }

  // async discardToken({ token, exp, currentDate = new Date() }: DiscardTokenParams) {
  //   const remainingTime = Math.max(exp * 1000 - currentDate.getTime(), 0);
  //   if (remainingTime <= 0) return;
  //   await this.discardedTokenCache.set(token, remainingTime);
  // }

  // private _isWithinRefreshTokenRenewalPeriod(tokenExp: number, now: Date) {
  //   const refreshTokenExpiry = new Date(tokenExp * 1000);
  //   const timeDiffInSeconds = (refreshTokenExpiry.getTime() - now.getTime()) / 1000;
  //   return timeDiffInSeconds <= this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS;
  // }

  // async refresh({ refreshToken, ip, fingerprint, refreshDate = new Date() }: RefreshParams) {
  //   const discardedToken = await this.discardedTokenCache.get(refreshToken);
  //   if (discardedToken) {
  //     this.logger.warn({ message: 'refreshtoken has been discarded', ip });
  //     await this.banIp(ip);
  //     throw new Forbidden();
  //   }

  //   let payload: TokenPayload;
  //   try {
  //     payload = await this.verifyToken({ token: refreshToken, fingerprint, tokenType: TokenType.REFRESH });
  //   } catch (e) {
  //     if (e.message !== TOKEN_EXPIRED_ERROR) {
  //       this.logger.warn({ message: e.message, ip });
  //       await this.banIp(ip);
  //     }
  //     throw new Unauthorized();
  //   }

  //   const claims = { adminId: payload.adminId, email: payload.email, role: payload.role, fingerprint };
  //   const accessToken = await this._signToken({ claims, signDate: refreshDate, tokenType: TokenType.ACCESS });
  //   if (this._isWithinRefreshTokenRenewalPeriod(payload.exp, refreshDate)) {
  //     [refreshToken] = await Promise.all([
  //       this._signToken({ claims, signDate: refreshDate, tokenType: TokenType.REFRESH }),
  //       this.discardToken({ token: refreshToken, exp: payload.exp, currentDate: refreshDate }), //
  //     ]);
  //   }

  //   return { accessToken, refreshToken };
  // }
}
