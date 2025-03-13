import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';

import { Forbidden, Unauthorized } from '@src/common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService, JwtPayload, TokenType } from './auth.service';

import { toInstance } from '@src/common/toInstance';
import { SigninRequestDto } from './dto/auth-request.dto';
import { AdminDto } from '@src/admin/dto/admin-response.dto';
import { Admin } from '@src/admin/entity.ts/admin.entity';
import { ConfigService } from '@nestjs/config';
import { FailedSigninAttemptsCache } from './failed-signin-attempts-cache';
import { getFingerprint } from '@src/common/utils/etc';

// TODO: auth용 throttler 따로 설정하기
@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly _ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS: number;
  private readonly _REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS: number;

  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
    private readonly configService: ConfigService,
    private readonly failedSigninAttemptsCache: FailedSigninAttemptsCache,
  ) {
    this.logger.setContext('AuthController');
    this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS = this.configService.get('SM_JWT_ACCESS_EXPIRE_TIME');
    this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_EXPIRE_TIME');
  }

  private _getTokenCookieOptions(tokenType: TokenType): CookieOptions {
    const maxAgeInSeconds =
      tokenType === TokenType.ACCESS //
        ? this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS
        : this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS;

    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // domain 설정되면 'strict'로 변경
      maxAge: maxAgeInSeconds * 1000,
      path: '/',
      // TODO: domain 설정
    };
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AdminDto })
  async signin(@Body() body: SigninRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const failedAttempts = await this.failedSigninAttemptsCache.get(body.email);
    if (failedAttempts >= 5) throw new Forbidden('Too many failed login attempts');

    let admin: Admin;
    try {
      admin = await this.authService.authenticate(body.email, body.password);
    } catch (e) {
      this.logger.warn({ message: 'authentication failed', ip: req.ip });
      await this.failedSigninAttemptsCache.set(body.email, (failedAttempts || 0) + 1);
      throw e;
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.authService.signJwt({
        id: admin.id,
        role: admin.role,
        exp: this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS,
        fingerprint: getFingerprint(req),
      }), //
      this.authService.signJwt(
        {
          id: admin.id,
          role: admin.role,
          exp: this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS,
          fingerprint: getFingerprint(req),
        },
        TokenType.REFRESH,
      ),
    ]);

    if (failedAttempts > 0) await this.failedSigninAttemptsCache.clear(body.email);
    // TODO: 쿠키 이름을 __Host- prefix를 사용하여 변경하는 것을 고려하세요 (예: __Host-acc, __Host-refr).
    res.cookie('acc', accessToken, this._getTokenCookieOptions(TokenType.ACCESS));
    res.cookie('refr', refreshToken, this._getTokenCookieOptions(TokenType.REFRESH));
    return toInstance(AdminDto, admin);
  }

  @Post('signout')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: '로그아웃' })
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refr'];
    if (refreshToken) await this.authService.discardToken(refreshToken);

    res.clearCookie('acc', { secure: true, sameSite: 'none' });
    res.clearCookie('refr', { secure: true, sameSite: 'none' });
    return true;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({ type: Boolean })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refr'];
    if (!refreshToken) {
      this.logger.warn({ message: 'refresh token not found', ip: req.ip });
      throw new Unauthorized();
    }

    if (await this.authService.isDiscardedToken(refreshToken)) {
      this.logger.warn({ message: 'refresh token is discarded', ip: req.ip });
      await this.authService.banIp(req.ip as string);
      throw new Forbidden();
    }

    let payload: JwtPayload;
    try {
      payload = await this.authService.verifyJwt(refreshToken, TokenType.REFRESH);
      if (payload.fingerprint !== getFingerprint(req)) throw Error('fingerprint mismatch');
    } catch (e) {
      this.logger.warn({ message: e.message, ip: req.ip });
      throw new Unauthorized();
    }

    const accessToken = await this.authService.signJwt({ id: payload.id, role: payload.role, exp: this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS });
    res.cookie('acc', accessToken, this._getTokenCookieOptions(TokenType.ACCESS));

    const needRefreshTokenRenewal = this.authService.reachRefreshTokenRenewalPeriod(payload.exp, new Date());
    if (needRefreshTokenRenewal) {
      const renewalRefreshToken = await this.authService.signJwt({ id: payload.id, role: payload.role, exp: this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS }, TokenType.REFRESH);
      await this.authService.discardToken(refreshToken);
      res.cookie('refr', renewalRefreshToken, this._getTokenCookieOptions(TokenType.REFRESH));
    }

    return true;
  }
}
