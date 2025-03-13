import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';

import { Unauthorized } from '@src/common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService } from './auth.service';

import { toInstance } from '@src/common/toInstance';
import { SigninRequestDto } from './dto/auth-request.dto';
import { AdminDto } from '@src/admin/dto/admin-response.dto';
import { getFingerprint } from '@src/common/utils/etc';

// TODO: auth용 throttler 따로 설정하기
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

  private _getTokenCookieOptions(exp: number): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none', // domain 설정되면 'strict'로 변경
      maxAge: exp * 1000,
      path: '/',
      // TODO: domain 설정
    };
  }

  @Post('signin')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AdminDto })
  async signin(@Body() body: SigninRequestDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { admin, accessTokenInfo, refreshTokenInfo } = await this.authService.signin({ email: body.email, password: body.password, ip: req.ip, fingerprint: getFingerprint(req) });

    // TODO: 쿠키 이름을 __Host- prefix를 사용하여 변경하는 것을 고려하세요 (예: __Host-acc, __Host-refr).
    res.cookie('acc', accessTokenInfo.token, this._getTokenCookieOptions(accessTokenInfo.exp));
    res.cookie('refr', refreshTokenInfo.token, this._getTokenCookieOptions(refreshTokenInfo.exp));
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

    const { accessTokenInfo, refreshTokenInfo } = await this.authService.refresh({ refreshToken, ip: req.ip, fingerprint: getFingerprint(req) });

    res.cookie('acc', accessTokenInfo.token, this._getTokenCookieOptions(accessTokenInfo.exp));
    if (refreshToken !== refreshTokenInfo.token) {
      res.cookie('refr', refreshTokenInfo.token, this._getTokenCookieOptions(refreshTokenInfo.exp));
    }
    return true;
  }
}
