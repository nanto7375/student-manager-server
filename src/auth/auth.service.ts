import { Request } from 'express';
import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { MyLogger } from '@src/configs/logger/my-logger';
import { AdminService } from '@src/admin/admin.service';
import { BcryptService } from '@src/common/utils/bcrypt';
import { CryptoService } from '@src/common/utils/crypto';
import { FailedSigninAttemptCache } from './cache/failed-signin-attempt.cache';
import { DiscardedTokenCache } from './cache/discarded-token.cache';

import { AdminRoleType } from '@src/admin/admin.service';
import { Admin } from '@src/generated/prisma/client';

const ERROR_MESSAGES = {
  tokenExpired: 'jwt expired',
  wrongPassword: 'wrong-password',
};

enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

type TokenPayload = { adminId: number; role: AdminRoleType; exp: number; fingerprint: string } & Record<string, any>;
type SignTokenParams = { claims: Record<string, any>; signDate: Date; tokenType?: TokenType };
type VerifyTokenParams = { token: string; fingerprint: string; tokenType?: TokenType };
type AuthenticateParams = { email: string; password: string };
type SigninParams = { email: string; password: string; ip: string; fingerprint: string; signinDate?: Date };
type DiscardTokenParams = { token: string; exp: number; currentDate?: Date };
type RefreshParams = { refreshToken: string; fingerprint: string; refreshDate?: Date; ip?: string };

@Injectable()
export class AuthService {
  private readonly _ACCESS_TOKEN_SECRET: string;
  private readonly _REFRESH_TOKEN_SECRET: string;
  private readonly _ACCESS_TOKEN_LIFETIME_IN_SECONDS: number;
  private readonly _REFRESH_TOKEN_LIFETIME_IN_SECONDS: number;
  private readonly _REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS: number;
  private readonly _ALLOWED_FAILED_SIGNIN_ATTEMPTS = 20;

  constructor(
    private readonly logger: MyLogger,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly bcryptService: BcryptService,
    private readonly cryptoService: CryptoService,
    private readonly failedSigninAttemptCache: FailedSigninAttemptCache,
    private readonly discardedTokenCache: DiscardedTokenCache,
  ) {
    this._ACCESS_TOKEN_SECRET = this.configService.get('SM_JWT_SECRET');
    this._REFRESH_TOKEN_SECRET = this.configService.get('SM_JWT_REFRESH_SECRET');
    this._ACCESS_TOKEN_LIFETIME_IN_SECONDS = this.configService.get('SM_JWT_ACCESS_LIFETIME');
    this._REFRESH_TOKEN_LIFETIME_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_LIFETIME');
    this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_TOKEN_RENEWAL_PERIOD');
  }

  get refreshTokenLifetime() {
    return this._REFRESH_TOKEN_LIFETIME_IN_SECONDS * 1000;
  }

  getFingerprint(req: Request) {
    const components = [
      req.headers['user-agent'] || '', // 브라우저/OS 정보
      req.headers['sec-ch-ua'] || '', // 브라우저 버전
      req.headers['sec-ch-ua-platform'] || '', // OS
      req.headers['sec-ch-ua-mobile'] || '', // 모바일 여부
      req.headers['accept-language'] || '', // 언어 설정
    ];
    return this.cryptoService.createHash({ value: components.join(':') });
  }

  private _getSecret(tokenType: TokenType) {
    return tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_SECRET : this._REFRESH_TOKEN_SECRET;
  }

  private _signToken({ claims, signDate, tokenType = TokenType.ACCESS }: SignTokenParams): Promise<string> {
    const now = signDate.getTime() / 1000;
    const tokenLifeTime =
      tokenType === TokenType.ACCESS //
        ? this._ACCESS_TOKEN_LIFETIME_IN_SECONDS
        : this._REFRESH_TOKEN_LIFETIME_IN_SECONDS;
    claims.exp = now + tokenLifeTime;

    return this.jwtService.signAsync(claims, { secret: this._getSecret(tokenType) });
  }

  async verifyToken({ token, fingerprint, tokenType = TokenType.ACCESS }: VerifyTokenParams): Promise<TokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: this._getSecret(tokenType) });
      if (payload.fingerprint !== fingerprint) throw new Error('invalid-fingerprint');
      return payload;
    } catch (e) {
      if (e.message === ERROR_MESSAGES.tokenExpired) throw new HttpException('token-expired', 401);
      this.logger.warn({ message: 'token verification failed', error: e.message, stack: e.stack });
      throw new UnauthorizedException();
    }
  }

  decodeToken(token: string): TokenPayload {
    return this.jwtService.decode(token);
  }

  private async _authenticate({ email, password }: AuthenticateParams) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);

    // TODO: 어드민 생성 페이지 만들면 그때 활성화
    // const isPasswordCorrect = await this.bcryptService.compare(password, admin.password);
    const isPasswordCorrect = password === admin.password;
    if (!isPasswordCorrect) throw new UnauthorizedException(ERROR_MESSAGES.wrongPassword);

    return admin;
  }

  async signin({ email, password, ip, fingerprint, signinDate = new Date() }: SigninParams) {
    const failedSigninCount = await this.failedSigninAttemptCache.get(email);
    if (failedSigninCount >= this._ALLOWED_FAILED_SIGNIN_ATTEMPTS) {
      this.logger.warn({ message: 'too many failed signin attempts', email, ip });
      throw new UnauthorizedException();
    }

    let admin: Admin;
    try {
      admin = await this._authenticate({ email, password });
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        await this.failedSigninAttemptCache.set(email, failedSigninCount + 1);
      }
      throw e;
    }

    const claims = { adminId: admin.id, role: admin.role, fingerprint };
    const [accessToken, refreshToken] = await Promise.all([
      this._signToken({ claims, signDate: signinDate }), //
      this._signToken({ claims, signDate: signinDate, tokenType: TokenType.REFRESH }),
    ]);
    if (failedSigninCount > 0) await this.failedSigninAttemptCache.clear(email);

    return { admin, accessToken, refreshToken };
  }

  async discardToken({ token, exp, currentDate = new Date() }: DiscardTokenParams) {
    const remainingTime = Math.max(exp * 1000 - currentDate.getTime(), 0);
    if (remainingTime <= 0) return;
    await this.discardedTokenCache.set(token, remainingTime);
  }

  private _isWithinRefreshTokenRenewalPeriod(tokenExp: number, now: Date) {
    const refreshTokenExpiry = new Date(tokenExp * 1000);
    const timeDiffInSeconds = (refreshTokenExpiry.getTime() - now.getTime()) / 1000;
    return timeDiffInSeconds <= this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS;
  }

  async refresh({ refreshToken, fingerprint, refreshDate = new Date(), ip }: RefreshParams) {
    const discardedToken = await this.discardedTokenCache.get(refreshToken);
    if (discardedToken) {
      this.logger.warn({ message: 'refreshtoken has been discarded', ip });
      throw new UnauthorizedException();
    }

    const payload = await this.verifyToken({ token: refreshToken, fingerprint, tokenType: TokenType.REFRESH });
    const claims = { adminId: payload.adminId, role: payload.role, fingerprint };
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
