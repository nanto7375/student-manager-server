import { SetMetadata } from '@nestjs/common';

export const AUTH_SKIP_KEY = 'auth-skip';
export const AuthSkip = () => SetMetadata(AUTH_SKIP_KEY, true);
