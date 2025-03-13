import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminService } from '@src/admin/admin.service';
import { AdminRoleType } from '@src/admin/entity.ts/admin.entity';
import { Unauthorized } from '@src/common/exception/definition.exception';
import { HashService } from '@src/common/utils/hash';
import { DiscardedToken } from './entity/discardedToken.entity';
import { Repository } from 'typeorm';
import { BannedIp } from './entity/banned-ip.entity';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}
export type JwtPayload = { id: number; role: AdminRoleType; exp: number; fingerprint: string } & Record<string, any>;

@Injectable()
export class AuthService {
  private readonly _JWT_SECRET: string;
  private readonly _JWT_REFRESH_SECRET: string;
  private readonly _REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminService,
    private readonly hashService: HashService,
    @InjectRepository(DiscardedToken)
    private readonly discardedTokenRepository: Repository<DiscardedToken>,
    @InjectRepository(BannedIp)
    private readonly bannedIpRepository: Repository<BannedIp>,
  ) {
    this._JWT_SECRET = this.configService.get('SM_JWT_SECRET');
    this._JWT_REFRESH_SECRET = this.configService.get('SM_JWT_REFRESH_SECRET');
    this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS = this.configService.get('SM_JWT_REFRESH_TOKEN_RENEWAL_PERIOD');
  }

  async verifyJwt(token: string, tokenType: TokenType = TokenType.ACCESS): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
    return payload;
  }

  async signJwt(payload: Record<string, any>, tokenType: TokenType = TokenType.ACCESS): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: tokenType === TokenType.ACCESS ? this._JWT_SECRET : this._JWT_REFRESH_SECRET,
    });
  }

  async authenticate(email: string, password: string) {
    const admin = await this.adminService.getAdminByEmailOrThrow(email);
    const isPasswordCorrect = await this.hashService.compare(password, admin.password);
    if (!isPasswordCorrect) throw new Unauthorized();

    return admin;
  }

  async discardToken(token: string) {
    const discardedToken = DiscardedToken.of({ token, createdAt: new Date() });
    return this.discardedTokenRepository.save(discardedToken);
  }

  async isDiscardedToken(token: string) {
    const discardedToken = await this.discardedTokenRepository.findOne({ where: { token } });
    return !!discardedToken;
  }

  async banIp(ip: string) {
    const bannedIp = new BannedIp();
    bannedIp.ip = ip;
    return this.bannedIpRepository.save(bannedIp);
  }

  async isBanned(ip: string) {
    const bannedIp = await this.bannedIpRepository.findOne({ where: { ip } });
    return !!bannedIp;
  }

  reachRefreshTokenRenewalPeriod(exp: number, now: Date) {
    const refreshTokenExpiry = new Date(exp * 1000);
    const timeDiffInSeconds = (refreshTokenExpiry.getTime() - now.getTime()) / 1000;

    return timeDiffInSeconds <= this._REFRESH_TOKEN_RENEWAL_PERIOD_IN_SECONDS;
  }
}
