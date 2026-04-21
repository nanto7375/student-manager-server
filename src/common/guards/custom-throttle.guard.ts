import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from '@src/auth/auth.service';

export const throttleNames = {
  short: 'short',
  medium: 'medium',
  long: 'long',
};

export const intializeStandardThrottlers = (): Array<ThrottlerOptions> => [
  {
    name: throttleNames.short,
    ttl: 3_000,
    limit: 20,
  },
  {
    name: throttleNames.medium,
    ttl: 10_000,
    limit: 50,
  },
  {
    name: throttleNames.long,
    ttl: 60_000,
    limit: 180,
  },
];

@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly authService: AuthService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request;
    const fingerprint = this.authService.getFingerprint(request);
    const tracker = `${request.ip}-${fingerprint}`;
    return tracker;
  }

  // TODO: ban 로직 추가할지는 고민
}
