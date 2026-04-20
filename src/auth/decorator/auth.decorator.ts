import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';

/**
 * JWT 인증을 확인하는 데코레이터
 * 로그인한 사용자만 접근 가능하도록 설정
 *
 * @example
 * @Auth()
 * async getMe() {}
 */
export const Auth = () => applyDecorators(ApiBearerAuth('accessJWT'), UseGuards(AuthGuard));
