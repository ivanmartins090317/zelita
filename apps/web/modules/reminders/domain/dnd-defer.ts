import {
  CARE_TIMEZONE,
  dateKeyInZone,
  zonedDateFromHm,
} from "./zoned-time";
import { isInsideDnd, type DndWindow } from "./eligibility";

export const DND_ACTIONS = {
  sendNow: "send_now",
  defer: "defer",
  skip: "skip",
} as const;

export type DndAction = (typeof DND_ACTIONS)[keyof typeof DND_ACTIONS];

export type DndResolution =
  | { action: typeof DND_ACTIONS.sendNow }
  | { action: typeof DND_ACTIONS.defer; sendAt: Date }
  | { action: typeof DND_ACTIONS.skip; reason: string };

export interface ResolveDndInput {
  scheduledAt: Date;
  dnd: DndWindow;
  nextSlotAt?: Date | null;
  timeZone?: string;
}

function addCalendarDay(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Adia para o fim do DND no mesmo dia; atravessar meia-noite ou colidir
 * com o próximo horário vira skip (não envia de madrugada).
 */
export function resolveDndAction(input: ResolveDndInput): DndResolution {
  const timeZone = input.timeZone ?? CARE_TIMEZONE;
  if (!isInsideDnd(input.scheduledAt, input.dnd, timeZone)) {
    return { action: DND_ACTIONS.sendNow };
  }
  if (!input.dnd.end) {
    return { action: DND_ACTIONS.skip, reason: "dnd_incomplete" };
  }

  const dateKey = dateKeyInZone(input.scheduledAt, timeZone);
  const start = input.dnd.start;
  const end = input.dnd.end;
  const crossesMidnight = Boolean(start && start > end);

  if (crossesMidnight) {
    const sendAtSameDay = zonedDateFromHm(dateKey, end);
    if (sendAtSameDay.getTime() > input.scheduledAt.getTime()) {
      return resolveCollision(sendAtSameDay, input.nextSlotAt);
    }
    return { action: DND_ACTIONS.skip, reason: "dnd_crosses_midnight" };
  }

  const sendAt = zonedDateFromHm(dateKey, end);
  if (sendAt.getTime() <= input.scheduledAt.getTime()) {
    return {
      action: DND_ACTIONS.skip,
      reason: "dnd_end_already_passed",
    };
  }
  return resolveCollision(sendAt, input.nextSlotAt);
}

function resolveCollision(
  sendAt: Date,
  nextSlotAt?: Date | null,
): DndResolution {
  if (nextSlotAt && sendAt.getTime() >= nextSlotAt.getTime()) {
    return { action: DND_ACTIONS.skip, reason: "dnd_collides_next_slot" };
  }
  return { action: DND_ACTIONS.defer, sendAt };
}

export function nextCalendarDateKey(dateKey: string): string {
  return addCalendarDay(dateKey);
}
