import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEFAULT_REFILL_ALERT_DAYS,
  shouldWarnRefill,
} from "@/modules/medications/domain/pack-end";
import { getZonedParts } from "@/modules/medications/domain/hoje-timeline";
import { GEOFENCE_EVENT_TYPE } from "@/modules/location/domain/location-history-labels";
import {
  SOS_ALERT_STATUS,
  parseSosAlertStatus,
} from "@/modules/sos/domain/sos-alert-status";

import { FEED_RETENTION_DAYS } from "../domain/alert-feed-types";

const TIME_ZONE = "America/Sao_Paulo";

export interface RefillSourceSnapshot {
  medicationId: string;
  medicationName: string;
  dosageLabel: string;
  endDateEstimated: string;
  daysRemaining: number;
  refillAlertDays: number;
}

export interface MedicationEventSourceSnapshot {
  id: string;
  type: string;
  medicationId: string | null;
  medicationName: string | null;
  createdAt: string;
}

export interface SosSourceSnapshot {
  id: string;
  status: string;
  triggeredAt: string;
  resolvedAt: string | null;
  resolvedByName: string | null;
}

export interface ZoneEventSourceSnapshot {
  id: string;
  eventType: string;
  placeName: string;
  recordedAt: string;
}

export interface InviteSourceSnapshot {
  id: string;
  displayName: string;
  createdAt: string;
  status: string;
}

export interface ExamSourceSnapshot {
  id: string;
  title: string;
  examDate: string;
  category: string | null;
}

export interface AlertFeedSourcesSnapshot {
  refills: RefillSourceSnapshot[];
  medicationEvents: MedicationEventSourceSnapshot[];
  sosAlerts: SosSourceSnapshot[];
  zoneEvents: ZoneEventSourceSnapshot[];
  pendingInvites: InviteSourceSnapshot[];
  uncategorizedExams: ExamSourceSnapshot[];
}

interface PackRow {
  id: string;
  end_date_estimated: string;
  status: string;
  refill_alert_days: number | null;
}

interface MedicationRow {
  id: string;
  name: string;
  dosage_label: string;
  medication_packs: PackRow | PackRow[] | null;
}

function normalizePack(value: MedicationRow["medication_packs"]): PackRow | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function computeDaysRemaining(endDateIso: string, now: Date): number {
  const endParts = endDateIso.split("-").map(Number);
  const endUtc = Date.UTC(endParts[0], (endParts[1] ?? 1) - 1, endParts[2] ?? 1);
  const today = getZonedParts(now, TIME_ZONE);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  return Math.round((endUtc - todayUtc) / (24 * 60 * 60 * 1000));
}

export async function fetchAlertFeedSources(
  supabase: SupabaseClient,
  input: {
    careRecipientId: string;
    accountId: string;
    now: Date;
  },
): Promise<AlertFeedSourcesSnapshot> {
  const since = new Date(input.now);
  since.setUTCDate(since.getUTCDate() - FEED_RETENTION_DAYS);

  const { data: medRows, error: medError } = await supabase
    .from("medications")
    .select(
      "id, name, dosage_label, medication_packs(id, end_date_estimated, status, refill_alert_days)",
    )
    .eq("care_recipient_id", input.careRecipientId)
    .eq("active", true);

  if (medError) throw new Error(medError.message);

  const refills: RefillSourceSnapshot[] = [];
  const packToMedication = new Map<string, { id: string; name: string }>();

  for (const row of medRows ?? []) {
    const med = row as MedicationRow;
    const pack = normalizePack(med.medication_packs);
    if (!pack || pack.status !== "active") continue;

    packToMedication.set(pack.id, { id: med.id, name: med.name });
    const daysRemaining = computeDaysRemaining(
      pack.end_date_estimated,
      input.now,
    );
    const refillAlertDays = pack.refill_alert_days ?? DEFAULT_REFILL_ALERT_DAYS;

    if (shouldWarnRefill(daysRemaining, refillAlertDays)) {
      refills.push({
        medicationId: med.id,
        medicationName: med.name,
        dosageLabel: med.dosage_label,
        endDateEstimated: pack.end_date_estimated,
        daysRemaining,
        refillAlertDays,
      });
    }
  }

  const { data: eventRows, error: eventError } = await supabase
    .from("medication_events")
    .select("id, type, pack_id, created_at")
    .eq("care_recipient_id", input.careRecipientId)
    .gte("created_at", since.toISOString())
    .in("type", ["pack_refill_warning", "pack_last_day", "voice_fallback"])
    .order("created_at", { ascending: false });

  if (eventError) throw new Error(eventError.message);

  const medicationEvents: MedicationEventSourceSnapshot[] =
    (eventRows ?? []).map((event) => {
      const packId = event.pack_id as string | null;
      const med = packId ? packToMedication.get(packId) : null;
      return {
        id: event.id as string,
        type: event.type as string,
        medicationId: med?.id ?? null,
        medicationName: med?.name ?? null,
        createdAt: event.created_at as string,
      };
    });

  const { data: sosRows, error: sosError } = await supabase
    .from("sos_alerts")
    .select("id, status, triggered_at, resolved_at, resolved_by")
    .eq("care_recipient_id", input.careRecipientId)
    .gte("triggered_at", since.toISOString())
    .order("triggered_at", { ascending: false })
    .limit(100);

  if (sosError) throw new Error(sosError.message);

  const resolverIds = (sosRows ?? [])
    .map((row) => row.resolved_by as string | null)
    .filter((id): id is string => Boolean(id));

  const resolverNames = new Map<string, string>();
  if (resolverIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", resolverIds);
    for (const profile of profiles ?? []) {
      resolverNames.set(
        profile.id as string,
        (profile.full_name as string | null) ?? "Alguém",
      );
    }
  }

  const sosAlerts: SosSourceSnapshot[] = (sosRows ?? []).map((row) => {
    const status = parseSosAlertStatus(row.status as string);
    return {
      id: row.id as string,
      status: status ?? SOS_ALERT_STATUS.resolved,
      triggeredAt: row.triggered_at as string,
      resolvedAt: (row.resolved_at as string | null) ?? null,
      resolvedByName: row.resolved_by
        ? (resolverNames.get(row.resolved_by as string) ?? "Alguém")
        : null,
    };
  });

  const { data: zoneRows, error: zoneError } = await supabase
    .from("geofence_events")
    .select("id, event_type, place_name, recorded_at")
    .eq("care_recipient_id", input.careRecipientId)
    .gte("recorded_at", since.toISOString())
    .in("event_type", [
      GEOFENCE_EVENT_TYPE.zoneExit,
      GEOFENCE_EVENT_TYPE.zoneReturn,
    ])
    .order("recorded_at", { ascending: false })
    .limit(100);

  if (zoneError) throw new Error(zoneError.message);

  const zoneEvents: ZoneEventSourceSnapshot[] = (zoneRows ?? []).map((row) => ({
    id: row.id as string,
    eventType: row.event_type as string,
    placeName: row.place_name as string,
    recordedAt: row.recorded_at as string,
  }));

  const inviteCutoff = new Date(input.now);
  inviteCutoff.setUTCDate(inviteCutoff.getUTCDate() - 1);

  const { data: inviteRows, error: inviteError } = await supabase
    .from("invites")
    .select("id, display_name, created_at, status")
    .eq("account_id", input.accountId)
    .eq("status", "pending")
    .lte("created_at", inviteCutoff.toISOString());

  if (inviteError) throw new Error(inviteError.message);

  const pendingInvites: InviteSourceSnapshot[] = (inviteRows ?? []).map(
    (row) => ({
      id: row.id as string,
      displayName: row.display_name as string,
      createdAt: row.created_at as string,
      status: row.status as string,
    }),
  );

  const { data: examRows, error: examError } = await supabase
    .from("exams")
    .select("id, title, exam_date, category")
    .eq("care_recipient_id", input.careRecipientId)
    .is("category", null);

  if (examError) throw new Error(examError.message);

  const uncategorizedExams: ExamSourceSnapshot[] = (examRows ?? []).map(
    (row) => ({
      id: row.id as string,
      title: row.title as string,
      examDate: row.exam_date as string,
      category: (row.category as string | null) ?? null,
    }),
  );

  return {
    refills,
    medicationEvents,
    sosAlerts,
    zoneEvents,
    pendingInvites,
    uncategorizedExams,
  };
}

export async function countOpenAlertsForBadge(
  supabase: SupabaseClient,
  input: {
    careRecipientId: string;
    accountId: string;
    now: Date;
  },
): Promise<number> {
  const sources = await fetchAlertFeedSources(supabase, input);
  let count = sources.refills.length;
  count += sources.pendingInvites.length;
  count += sources.uncategorizedExams.length;
  count += sources.sosAlerts.filter((alert) => alert.status === "open").length;

  const openZones = buildOpenZoneCount(sources.zoneEvents);
  count += openZones;

  return count;
}

function buildOpenZoneCount(events: ZoneEventSourceSnapshot[]): number {
  const exits = events
    .filter((event) => event.eventType === GEOFENCE_EVENT_TYPE.zoneExit)
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    );

  let openCount = 0;
  for (const exitEvent of exits) {
    const returnEvent = events.find(
      (event) =>
        event.eventType === GEOFENCE_EVENT_TYPE.zoneReturn &&
        event.placeName === exitEvent.placeName &&
        new Date(event.recordedAt).getTime() >
          new Date(exitEvent.recordedAt).getTime(),
    );
    if (!returnEvent) openCount += 1;
  }
  return openCount;
}
