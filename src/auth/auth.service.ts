import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '@src/admin/admin.service';
import { Unauthorized } from '@src/common/exception/definition.exception';
import { HashService } from '@src/common/utils/hash';

enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Injectable()
export class AuthService {
  private readonly _JWT_SECRET: string;
  private readonly _JWT_REFRESH_SECRET: string;
  private readonly _ACCESS_TOKEN_EXPIRE_TIME: string = '7d';
  private readonly _REFRESH_TOKEN_EXPIRE_TIME: string = '30d';

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
    private readonly hashService: HashService,
  ) {
    this._JWT_SECRET = this.configService.get('SM_JWT_SECRET');
    this._JWT_REFRESH_SECRET = this.configService.get('SM_JWT_REFRESH_SECRET');
  }

  async verifyJwt(token: string, tokenType: TokenType = TokenType.ACCESS) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
    return payload;
  }

  async signJwt(payload: any, tokenType: TokenType = TokenType.ACCESS) {
    return await this.jwtService.signAsync(payload, {
      expiresIn: tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_EXPIRE_TIME : this._REFRESH_TOKEN_EXPIRE_TIME,
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
  }

  async signin(email: string, password: string) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);
    const isPasswordCorrect = await this.hashService.compare(password, admin.password);
    if (!isPasswordCorrect) throw new Unauthorized('비밀번호가 일치하지 않습니다.');

    const payload = {
      id: admin.id,
      role: admin.role,
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.signJwt(payload, TokenType.ACCESS), //
      this.signJwt(payload, TokenType.REFRESH),
    ]);
    return { accessToken, refreshToken };
  }
}
