import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends Logger {
  private _context: string;

  setContext(context: string) {
    this._context = context;
  }

  private _makeStringifiedMessage(message: any): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  private _transformLogMessage(message: any, optionalParams: any[]): string {
    if (optionalParams.length === 0) {
      return this._makeStringifiedMessage(message);
    }
    return `${this._makeStringifiedMessage(message)} ${optionalParams.map((param) => this._makeStringifiedMessage(param)).join(' ')}`;
  }

  log(message: any, ...optionalParams: any[]) {
    super.log(this._transformLogMessage(message, optionalParams), this._context);
  }
  warn(message: any, ...optionalParams: any[]) {
    super.warn(this._transformLogMessage(message, optionalParams), this._context);
  }
  debug(message: any, ...optionalParams: any[]) {
    super.debug(this._transformLogMessage(message, optionalParams), this._context);
  }
  error(messageOrError: any, ...optionalParams) {
    if (messageOrError instanceof Error) {
      return super.error(this._makeStringifiedMessage(messageOrError.message), messageOrError.stack, this._context);
    }
    // 인자로 스트링 메세지를 앞쪽에 넣을 거면 마지막에는 스택을 넣어줘야 올바르게 로그가 찍힘
    if (optionalParams.length === 1) {
      return super.error(this._makeStringifiedMessage(messageOrError), optionalParams[0], this._context);
    }
    const stack = optionalParams.splice(optionalParams.length - 1)[0];
    super.error(this._transformLogMessage(messageOrError, optionalParams), stack, this._context);
  }
}
