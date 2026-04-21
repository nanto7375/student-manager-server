import { CookieOptions, Request, Response } from 'express';
import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService } from './auth.service';

import { toInstance } from '@src/common/utils/toInstance';
import { AuthSkip } from './decorator/auth-skip.decorator';

import { SigninRequestDto } from './dto/auth-request.dto';
import { AdminDto } from '@src/admin/dto/admin-response.dto';
import { SigninResponseDto } from './dto/auth-response.dto';
import { Throttle } from '@nestjs/throttler';
import { throttleNames } from '@src/common/guards';

@Controller('auth')
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

  // // TODO: 배포할 때 업데이트 필요
  private _getTokenCookieOptions(): CookieOptions {
    return {
      ...(this.isDevelopment ? {} : { domain: '' }),
      httpOnly: true,
      secure: !this.isDevelopment,
      sameSite: this.isDevelopment ? 'lax' : 'none', //
      path: '/',
      maxAge: this.authService.refreshTokenLifetime,
    };
  }

  @Post('signin')
  @AuthSkip()
  @Throttle({
    [throttleNames.short]: { ttl: 1_000, limit: 1 },
    [throttleNames.medium]: { ttl: 10_000, limit: 5 },
    [throttleNames.long]: { ttl: 60_000, limit: 20 },
  })
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
  @ApiOperation({ summary: '로그아웃' })
  async signout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refr'];
    if (refreshToken) {
      try {
        const payload = this.authService.decodeToken(refreshToken);
        await this.authService.discardToken({ token: refreshToken, exp: payload.exp });
      } catch (e) {
        this.logger.error({ message: 'Failed to discard token on signout', error: e.message, stack: e.stack });
      }
    }

    res.clearCookie('refr', this._getTokenCookieOptions());
    return true;
  }

  @Post('refresh')
  @AuthSkip()
  @Throttle({ [throttleNames.long]: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({ type: String })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refr'];
    if (!refreshToken) throw new UnauthorizedException();

    const { accessToken, refreshToken: _refreshToken } = await this.authService.refresh({
      refreshToken,
      fingerprint: this.authService.getFingerprint(req),
      ip: req.ip,
    });

    if (refreshToken !== _refreshToken) res.cookie('refr', _refreshToken, this._getTokenCookieOptions());
    return accessToken;
  }
}
