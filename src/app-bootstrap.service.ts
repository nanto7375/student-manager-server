import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { APP_BOOTSTRAP_COMPLETED } from './common/constant/event.const';

@Injectable()
export class AppBootstrapService implements OnApplicationBootstrap {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  onApplicationBootstrap(): void {
    this.eventEmitter.emit(APP_BOOTSTRAP_COMPLETED);
  }
}
