import { ExceptionDefinition } from './definition.exception';

export class MyHttpException extends Error {
  readonly resultCode: number;
  readonly status: number;
  readonly previousError: Error;
  readonly optionalInfo: Record<string, any>;

  constructor({ resultCode, resultMessage, status, optionalInfo }: ExceptionDefinition, additionalMessage?: string | Error, previousError?: Error) {
    if (typeof additionalMessage !== 'string') {
      previousError = additionalMessage;
      additionalMessage = undefined;
    }
    const message = additionalMessage ? resultMessage + ' - ' + additionalMessage : resultMessage;
    super(message);
    this.resultCode = resultCode;
    this.status = status;
    this.previousError = previousError as Error;
    this.optionalInfo = optionalInfo as Record<string, any>;
  }
}
