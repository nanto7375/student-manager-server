export class ActivityRecordUpdatedEvent {
  constructor(
    public readonly adminId: number,
    public readonly activityRecordId: number,
    public readonly key: string,
    public readonly value: string,
  ) {}
}
