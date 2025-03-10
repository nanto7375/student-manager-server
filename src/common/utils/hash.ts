import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly _SALT: number;

  constructor(configService: ConfigService) {
    this._SALT = configService.get('SM_BYCRYPT_SALT');
  }

  hash(password: string): Promise<string> {
    return bcrypt.hash(password, this._SALT);
  }

  compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
