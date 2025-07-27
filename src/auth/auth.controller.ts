import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';

import { Unauthorized } from '@src/common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService, TOKEN_EXPIRED_ERROR, TokenType } from './auth.service';

import { toInstance } from '@src/common/utils/toInstance';
import { SigninRequestDto } from './dto/auth-request.dto';
import { AdminDto } from '@src/admin/dto/admin-response.dto';
import { AuthSkip } from './decorator/auth-skip.decorator';
import { ConfigService } from '@nestjs/config';
import { SigninResponseDto } from './dto/auth-response.dto';

// TODO: auth용 throttler 따로 설정하기
// TODO: ip ban 처리 미들웨어로 따로 뺄까?
@Controller('auth')
@UseGuards(ThrottlerGuard)
@ApiTags('auth')
export class AuthController {
  private readonly isDevelopment: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
    private readonly configService: ConfigService,
  ) {
    this.isDevelopment = this.configService.get('NODE_ENV') !== 'production';
    this.logger.setContext('AuthController');
  }

  private _getTokenCookieOptions(): CookieOptions {
    return {
      ...(this.isDevelopment ? {} : { domain: '' }),
      httpOnly: true,
      secure: !this.isDevelopment,
      sameSite: this.isDevelopment ? 'lax' : 'none', //
      path: '/',
      maxAge: this.authService.refreshTokenLifetimeInSeconds * 1000,
    };
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @AuthSkip()
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AdminDto })
  async signin(@Body() body: SigninRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { admin, accessToken, refreshToken } = await this.authService.signin({
      email: body.email,
      password: body.password,
      ip: req.ip,
      fingerprint: this.authService.getFingerprint(req),
    });

    // TODO: 쿠키명에 __Host- prefix 사용 고려
    res.cookie('refr', refreshToken, this._getTokenCookieOptions());
    return toInstance(SigninResponseDto, { admin, accessToken });
  }

  @Post('signout')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: '로그아웃' })
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refr'];
    try {
      if (refreshToken) {
        const payload = await this.authService.verifyToken({
          token: refreshToken,
          fingerprint: this.authService.getFingerprint(req),
          tokenType: TokenType.REFRESH,
        });
        await this.authService.discardToken({ token: refreshToken, exp: payload.exp });
      }
    } catch (e) {
      this.logger.warn({ message: e.message, ip: req.ip });
      if (e.message !== TOKEN_EXPIRED_ERROR) {
        await this.authService.banIp(req.ip);
        throw new Unauthorized();
      }
    }

    res.clearCookie('refr', { secure: true, sameSite: 'none' });
    return true;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @AuthSkip()
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({ type: Boolean })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refr'];
    if (!refreshToken) {
      this.logger.warn({ message: 'refresh token not found', ip: req.ip });
      throw new Unauthorized();
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh({
      refreshToken,
      ip: req.ip,
      fingerprint: this.authService.getFingerprint(req),
    });

    if (refreshToken !== newRefreshToken) res.cookie('refr', newRefreshToken, this._getTokenCookieOptions());
    return accessToken;
  }
}
