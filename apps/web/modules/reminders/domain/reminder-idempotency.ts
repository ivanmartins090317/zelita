const PROCESSED_TYPES = new Set(["reminder_sent", "reminder_skipped"]);

export interface OccurrenceEvent {
  packId: string;
  type: string;
  scheduledAt?: string | null;
}

export function reminderOccurrenceKey(
  packId: string,
  scheduledAtIso: string,
): string {
  return `${packId}:${scheduledAtIso}`;
}

export function hasProcessedOccurrence(
  events: OccurrenceEvent[],
  packId: string,
  scheduledAtIso: string,
): boolean {
  return events.some(
    (event) =>
      event.packId === packId &&
      PROCESSED_TYPES.has(event.type) &&
      event.scheduledAt === scheduledAtIso,
  );
}
