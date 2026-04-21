import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthenticatedRequest } from '@src/auth/guard/auth.guard';
import { AuthService } from '@src/auth/auth.service';

export const throttleNames = {
  short: 'short',
  medium: 'medium',
  long: 'long',
};

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

  protected throttlers: Array<ThrottlerOptions> = [
    {
      name: throttleNames.short,
      ttl: 1_000,
      limit: 3,
    },
    {
      name: throttleNames.medium,
      ttl: 10_000,
      limit: 20,
    },
    {
      name: throttleNames.long,
      ttl: 60_000,
      limit: 100,
    },
  ];

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as AuthenticatedRequest;
    if (request.adminId) {
      return `admin-${request.adminId}`;
    }
    const fingerprint = this.authService.getFingerprint(request as Request);
    return `${request.ip}-${fingerprint}`;
  }
}
