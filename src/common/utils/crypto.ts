import { BinaryToTextEncoding, createHash } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoService {
  createHash({ value, algorithm = 'sha256', encoding = 'hex' }: { value: string; algorithm?: string; encoding?: BinaryToTextEncoding }): string {
    return createHash(algorithm).update(value).digest(encoding);
  }
}
