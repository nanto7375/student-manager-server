import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';

import { Unauthorized } from '@src/common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService, TOKEN_EXPIRED_ERROR, TokenType } from './auth.service';

import { toInstance } from '@src/common/toInstance';
import { SigninRequestDto } from './dto/auth-request.dto';
import { AdminDto } from '@src/admin/dto/admin-response.dto';
import { getFingerprint } from '@src/common/utils/etc';

// TODO: auth용 throttler 따로 설정하기
// TODO: ip ban 처리 미들웨어로 따로 뺄까?
@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('AuthController');
  }

  private _getTokenCookieOptions(tokenType: TokenType): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'none', // domain 설정되면 'strict'로 변경
      // TODO: domain 설정
      maxAge:
        (tokenType === TokenType.ACCESS //
          ? this.authService.accessTokenLifetimeInSeconds
          : this.authService.refreshTokenLifetimeInSeconds) * 1000,
    };
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AdminDto })
  async signin(@Body() body: SigninRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { admin, accessToken, refreshToken } = await this.authService.signin({
      email: body.email,
      password: body.password,
      ip: req.ip as string,
      fingerprint: getFingerprint(req),
    });

    // TODO: 쿠키명에 __Host- prefix 사용 고려
    res.cookie('acc', accessToken, this._getTokenCookieOptions(TokenType.ACCESS));
    res.cookie('refr', refreshToken, this._getTokenCookieOptions(TokenType.REFRESH));
    return toInstance(AdminDto, admin);
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
          fingerprint: getFingerprint(req),
          tokenType: TokenType.REFRESH,
        });
        await this.authService.discardToken({ token: refreshToken, exp: payload.exp });
      }
    } catch (e) {
      this.logger.warn({ message: e.message, ip: req.ip });
      if (e.message !== TOKEN_EXPIRED_ERROR) {
        await this.authService.banIp(req.ip as string);
        throw new Unauthorized();
      }
    }

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

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh({
      refreshToken,
      ip: req.ip as string,
      fingerprint: getFingerprint(req),
    });

    res.cookie('acc', accessToken, this._getTokenCookieOptions(TokenType.ACCESS));
    if (refreshToken !== newRefreshToken) {
      res.cookie('refr', newRefreshToken, this._getTokenCookieOptions(TokenType.REFRESH));
    }
    return true;
  }
}
