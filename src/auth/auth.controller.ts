import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { SigninRequestDto } from './dto/auth-request.dto';
import { AuthService, TokenType } from './auth.service';
import { AdminDto } from '@src/admin/dto/admin-response.dto';
import { toInstance } from '@src/common/toInstance';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: AdminDto })
  async signin(@Body() body: SigninRequestDto, @Req() _: Request, @Res({ passthrough: true }) res: Response) {
    const admin = await this.authService.signin(body.email, body.password);
    const [accessToken, refreshToken] = await Promise.all([
      this.authService.signJwt({ id: admin.id, role: admin.role }), //
      this.authService.signJwt({ id: admin.id, role: admin.role }, TokenType.REFRESH),
    ]);

    res.cookie('acc', accessToken[0], { httpOnly: true, secure: true, sameSite: 'none', maxAge: accessToken[1] });
    res.cookie('refr', refreshToken[0], { httpOnly: true, secure: true, sameSite: 'none', maxAge: refreshToken[1] });
    return toInstance(AdminDto, admin);
  }

  @Post('signout')
  @ApiOperation({ summary: '로그아웃' })
  signout(@Req() _: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('acc', { secure: true, sameSite: 'none' });
    res.clearCookie('refr', { secure: true, sameSite: 'none' });
    return true;
  }
}
