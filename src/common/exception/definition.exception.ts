import { MyHttpException } from './my-http.exception';

export interface ExceptionDefinition {
  readonly status: number;
  readonly code: number;
  readonly message: string;
  optionalInfo?: Record<string, any>;
}

const defineException = (status: number, code: number, message: string, optionalInfo?: Record<string, any>): ExceptionDefinition => ({
  status,
  code,
  message,
  optionalInfo,
});

export const definedException = {
  badRequest: defineException(400, 4000, 'bad request'),
  tooMany: defineException(400, 4001, 'too many requests'),
  oldVersion: defineException(400, 4002, 'old version'),
  unauthorized: defineException(401, 4010, 'unauthorized'),
  tokenExpired: defineException(401, 4011, 'token expired'),
  authenticationFailed: defineException(401, 4012, 'authentication failed'),
  tokenNotProvided: defineException(401, 4013, 'token not provided'),
  forbidden: defineException(403, 4030, 'forbidden'),
  notFound: defineException(404, 4040, 'not found'),
  serverError: defineException(500, 5000, 'server error'),
  externalServerError: defineException(500, 5001, 'external server error'),
};

export class BadRequest extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.badRequest, optionalInfo }, message);
    } else {
      super({ ...definedException.badRequest, optionalInfo: message });
    }
  }
}

export class Unauthorized extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.unauthorized, optionalInfo }, message);
    } else {
      super({ ...definedException.unauthorized, optionalInfo: message });
    }
  }
}

export class Forbidden extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.forbidden, optionalInfo }, message);
    } else {
      super({ ...definedException.forbidden, optionalInfo: message });
    }
  }
}

export class TokenExpired extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.tokenExpired, optionalInfo }, message);
    } else {
      super({ ...definedException.tokenExpired, optionalInfo: message });
    }
  }
}

export class AuthenticationFailed extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.authenticationFailed, optionalInfo }, message);
    } else {
      super({ ...definedException.authenticationFailed, optionalInfo: message });
    }
  }
}

export class NotFound extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.notFound, optionalInfo }, message);
    } else {
      super({ ...definedException.notFound, optionalInfo: message });
    }
  }
}

export class ServerError extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.serverError, optionalInfo }, message);
    } else {
      super({ ...definedException.serverError, optionalInfo: message });
    }
  }
}

export class ExternalServerError extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.externalServerError, optionalInfo }, message);
    } else {
      super({ ...definedException.externalServerError, optionalInfo: message });
    }
  }
}

export class TokenNotProvided extends MyHttpException {
  constructor(message?: string | Error | Record<string, any>, optionalInfo?: Record<string, any>) {
    if (typeof message === 'string' || message instanceof Error) {
      super({ ...definedException.tokenNotProvided, optionalInfo }, message);
    } else {
      super({ ...definedException.tokenNotProvided, optionalInfo: message });
    }
  }
}
