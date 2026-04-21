import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions } from '@nestjs/throttler';
import { AuthenticatedRequest } from '@src/auth/guard/auth.guard';

@Injectable()
export class CustomThrottleGuard extends ThrottlerGuard {
  protected throttlers: Array<ThrottlerOptions> = [
    {
      name: 'short',
      ttl: 1_000,
      limit: 3,
    },
    {
      name: 'medium',
      ttl: 10_000,
      limit: 20,
    },
    {
      name: 'long',
      ttl: 60_000,
      limit: 100,
    },
  ];

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as AuthenticatedRequest;
    return request.adminId ? `admin-${request.adminId}` : request.ip;
  }
}
