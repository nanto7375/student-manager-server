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
  badRequest: defineException(400, 104000, 'bad request'),
  tooMany: defineException(400, 104001, 'too many requests'),
  oldVersion: defineException(400, 104002, 'old version'),
  unauthorized: defineException(401, 104010, 'unauthorized'),
  forbidden: defineException(403, 104030, 'forbidden'),
  notFound: defineException(404, 104040, 'not found'),
  serverError: defineException(500, 105000, 'server error'),
  externalServerError: defineException(500, 105001, 'external server error'),
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
