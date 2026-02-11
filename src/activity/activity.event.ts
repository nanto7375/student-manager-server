import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ACTIVITY_RECORD_UPDATED } from '@src/common/constant/event.const';

export class ActivityRecordUpdatedEvent {
  constructor(
    public readonly adminId: number,
    public readonly activityRecordId: number,
    public readonly key: string,
    public readonly value: string,
  ) {}
}

@Injectable()
export class ActivityEvent {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  activityRecordUpdated({ adminId, activityRecordId, key, value }: { adminId: number; activityRecordId: number; key: string; value: string }) {
    const event = new ActivityRecordUpdatedEvent(adminId, activityRecordId, key, value);
    return { emit: () => this.eventEmitter.emit(ACTIVITY_RECORD_UPDATED, event) };
  }
}
