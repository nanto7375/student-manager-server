import { ConflictException } from '@nestjs/common';

export const DUPLICATE_ACTIVITY_RECORD_ERROR = 'duplicate-activity-record';

export class DuplicateActivityRecordException extends ConflictException {
  constructor() {
    super(DUPLICATE_ACTIVITY_RECORD_ERROR);
  }
}
