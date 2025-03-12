import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';

import { Unauthorized } from '@src/common/exception/definition.exception';
import { MyLogger } from '@src/configs/logger/my-logger';
import { AuthService, JwtPayload, TokenType } from './auth.service';

import { toInstance } from '@src/common/toInstance';
import { SigninRequestDto } from './dto/auth-request.dto';
import { AdminDto } from '@src/admin/dto/admin-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: MyLogger,
  ) {
    this.logger.setContext('AuthController');
  }

  private _getCookieOptions(maxAge: number): CookieOptions {
    return { httpOnly: true, secure: true, sameSite: 'none', maxAge };
  }

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AdminDto })
  async signin(@Body() body: SigninRequestDto, @Req() _: Request, @Res({ passthrough: true }) res: Response) {
    const admin = await this.authService.authenticate(body.email, body.password);
    const [accessTokenInfo, refreshTokenInfo] = await Promise.all([
      this.authService.signJwt({ id: admin.id, role: admin.role }), //
      this.authService.signJwt({ id: admin.id, role: admin.role }, TokenType.REFRESH),
    ]);

    res.cookie('acc', accessTokenInfo[0], this._getCookieOptions(accessTokenInfo[1]));
    res.cookie('refr', refreshTokenInfo[0], this._getCookieOptions(refreshTokenInfo[1]));
    return toInstance(AdminDto, admin);
  }

  @Post('signout')
  @ApiOperation({ summary: '로그아웃' })
  signout(@Req() _: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('acc', { secure: true, sameSite: 'none' });
    res.clearCookie('refr', { secure: true, sameSite: 'none' });
    return true;
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({ type: Boolean })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refr'];
    if (!refreshToken) throw new Unauthorized();

    let payload: JwtPayload;
    try {
      payload = await this.authService.verifyJwt(refreshToken, TokenType.REFRESH);
    } catch (e) {
      this.logger.warn(e);
      throw new Unauthorized();
    }

    const [accessTokenInfo, refreshTokenInfo] = await Promise.all([
      this.authService.signJwt({ id: payload.id, role: payload.role }), //
      this.authService.reachRefreshTokenRenewalPeriod(payload.exp) //
        ? this.authService.signJwt({ id: payload.id, role: payload.role }, TokenType.REFRESH)
        : null,
    ]);

    res.cookie('acc', accessTokenInfo[0], this._getCookieOptions(accessTokenInfo[1]));
    if (refreshTokenInfo) {
      res.cookie('refr', refreshTokenInfo[0], this._getCookieOptions(refreshTokenInfo[1]));
    }
    return true;
  }
}
