import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '@src/admin/admin.service';
import { AdminRoleType } from '@src/admin/entity.ts/admin.entity';
import { Unauthorized } from '@src/common/exception/definition.exception';
import { HashService } from '@src/common/utils/hash';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
export type JwtPayload = Record<string, any> & { id: number; role: AdminRoleType };

@Injectable()
export class AuthService {
  private readonly _JWT_SECRET: string;
  private readonly _JWT_REFRESH_SECRET: string;
  private readonly _ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS: number = 60 * 60;
  private readonly _REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS: number = 60 * 60 * 24 * 14;
  private readonly _REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS: number = 60 * 60 * 24 * 7;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
    private readonly hashService: HashService,
  ) {
    this._JWT_SECRET = this.configService.get('SM_JWT_SECRET');
    this._JWT_REFRESH_SECRET = this.configService.get('SM_JWT_REFRESH_SECRET');
  }

  async verifyJwt(token: string, tokenType: TokenType = TokenType.ACCESS): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
    return payload;
  }

  async signJwt(payload: Record<string, any>, tokenType: TokenType = TokenType.ACCESS): Promise<[string, number]> {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS : this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS,
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
    const expiresIn = tokenType === TokenType.ACCESS ? this._ACCESS_TOKEN_EXPIRE_TIME_IN_SECONDS : this._REFRESH_TOKEN_EXPIRE_TIME_IN_SECONDS;

    return [token, expiresIn];
  }

  async authenticate(email: string, password: string) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);
    const isPasswordCorrect = await this.hashService.compare(password, admin.password);
    if (!isPasswordCorrect) throw new Unauthorized();

    return admin;
  }

  reachRefreshTokenRenewalPeriod(exp: number) {
    const now = new Date();
    const refreshTokenExpiry = new Date(exp * 1000);
    const timeDiffInSeconds = (refreshTokenExpiry.getTime() - now.getTime()) / 1000;

    return timeDiffInSeconds <= this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS;
  }
}
