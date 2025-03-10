import { ExceptionDefinition } from './definition.exception';

export class MyHttpException extends Error {
  readonly code: number;
  readonly status: number;
  readonly previousError: Error;
  readonly optionalInfo: Record<string, any>;

  constructor({ code, message, status, optionalInfo }: ExceptionDefinition, additionalMessage?: string | Error, previousError?: Error) {
    if (typeof additionalMessage !== 'string') {
      previousError = additionalMessage;
      additionalMessage = undefined;
    }
    message = additionalMessage ? message + ' - ' + additionalMessage : message;
    super(message);
    this.code = code;
    this.status = status;
    this.previousError = previousError as Error;
    this.optionalInfo = optionalInfo as Record<string, any>;
  }
}
