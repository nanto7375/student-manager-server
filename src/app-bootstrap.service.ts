import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const APP_EVENT_BOOTSTRAP_COMPLETED = 'app.bootstrap.completed';

@Injectable()
export class AppBootstrapService implements OnApplicationBootstrap {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  onApplicationBootstrap(): void {
    this.eventEmitter.emit(APP_EVENT_BOOTSTRAP_COMPLETED);
  }
}
