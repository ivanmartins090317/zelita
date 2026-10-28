import { elderContent } from "@/content/elder";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { ElderCallInput } from "@/modules/elder-access/domain/elder-call";
import {
  ELDER_TIME_ZONE,
  remindedTimesFromActivity,
  type ElderAppointmentInput,
  type ElderMedicationInput,
} from "@/modules/elder-access/domain/elder-schedule";
import type { ActiveElderDevice } from "@/modules/elder-access/infrastructure/device-cookie";

export interface BoundElderRoutine {
  displayName: string;
  medications: ElderMedicationInput[];
  appointments: ElderAppointmentInput[];
  members: ElderCallInput[];
  loadWarning: string | null;
}

interface MedRow {
  id: string;
  name: string;
  dosage_label: string;
  medication_packs:
    | { id: string; status: string }
    | Array<{ id: string; status: string }>
    | null;
  medication_schedules:
    | { times: string[] | null }
    | Array<{ times: string[] | null }>
    | null;
}

function elderDayBounds(now: Date): { startIso: string; endIso: string } {
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: ELDER_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return {
    startIso: `${dateKey}T00:00:00.000-03:00`,
    endIso: `${dateKey}T23:59:59.999-03:00`,
  };
}

function clockLabel(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: ELDER_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return `${pick("hour")}:${pick("minute")}`;
}

function firstRow<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapMedications(rows: MedRow[]): Array<ElderMedicationInput & { packId: string | null }> {
  return rows.flatMap((row) => {
    const pack = firstRow(row.medication_packs);
    if (!pack || pack.status !== "active") return [];
    const schedule = firstRow(row.medication_schedules);
    const times = (schedule?.times ?? []).map((time) => time.slice(0, 5));
    return [
      {
        medicationId: row.id,
        medicationName: row.name,
        dosageLabel: row.dosage_label,
        times,
        remindedTimes: [],
        packId: pack.id,
      },
    ];
  });
}

/** Lê a rotina só da pessoa do aparelho já conferido. O id não vem do navegador. */
export async function readBoundElderRoutine(
  device: ActiveElderDevice,
  now: Date,
): Promise<BoundElderRoutine> {
  const supabase = createSupabaseServiceClient();
  const bounds = elderDayBounds(now);
  let loadWarning: string | null = null;

  const recipient = await supabase
    .from("care_recipients")
    .select("display_name, full_name")
    .eq("id", device.careRecipientId)
    .eq("account_id", device.accountId)
    .maybeSingle();

  const displayName =
    recipient.data?.display_name?.trim() ||
    recipient.data?.full_name?.trim() ||
    "";

  const medsQuery = await supabase
    .from("medications")
    .select(
      "id, name, dosage_label, medication_packs(id, status), medication_schedules(times)",
    )
    .eq("care_recipient_id", device.careRecipientId)
    .eq("active", true);

  const eventsQuery = await supabase
    .from("medication_events")
    .select("pack_id")
    .eq("care_recipient_id", device.careRecipientId)
    .eq("type", "reminder_sent")
    .gte("created_at", bounds.startIso)
    .lte("created_at", bounds.endIso);

  const appointmentsQuery = await supabase
    .from("appointments")
    .select("title, starts_at")
    .eq("care_recipient_id", device.careRecipientId)
    .eq("status", "scheduled")
    .gte("starts_at", bounds.startIso)
    .lte("starts_at", bounds.endIso);

  const membersQuery = await supabase
    .from("account_members")
    .select("id, display_name, relationship_label, contact_phone, profiles(full_name, phone_whatsapp)")
    .eq("account_id", device.accountId)
    .eq("status", "active");

  if (medsQuery.error || eventsQuery.error || appointmentsQuery.error) {
    loadWarning = elderContent.schedule.loadError;
  }

  const mapped = medsQuery.error ? [] : mapMedications((medsQuery.data ?? []) as MedRow[]);
  const remindedPacks = new Set(
    (eventsQuery.data ?? [])
      .map((event) => event.pack_id)
      .filter((packId): packId is string => Boolean(packId)),
  );
  const medications: ElderMedicationInput[] = mapped.map((medication) => {
    const sent = medication.packId ? remindedPacks.has(medication.packId) : false;
    const activityTitles = sent
      ? [`lembrete enviado — ${medication.medicationName} ${medication.dosageLabel}`]
      : [];
    return {
      medicationId: medication.medicationId,
      medicationName: medication.medicationName,
      dosageLabel: medication.dosageLabel,
      times: medication.times,
      remindedTimes: remindedTimesFromActivity({
        medicationName: medication.medicationName,
        dosageLabel: medication.dosageLabel,
        times: medication.times,
        activityTitles,
      }),
    };
  });

  const appointments: ElderAppointmentInput[] = appointmentsQuery.error
    ? []
    : (appointmentsQuery.data ?? []).flatMap((row) => {
        if (!row.starts_at || !row.title) return [];
        return [{ timeLabel: clockLabel(row.starts_at), title: row.title }];
      });

  const members: ElderCallInput[] = membersQuery.error
    ? []
    : (membersQuery.data ?? []).map((row) => {
        const profile = firstRow(row.profiles);
        return {
          id: row.id,
          displayName: profile?.full_name?.trim() || row.display_name?.trim() || "Família",
          relationshipLabel: row.relationship_label,
          phone: row.contact_phone || profile?.phone_whatsapp || null,
        };
      });

  if (membersQuery.error && !loadWarning) {
    loadWarning = elderContent.schedule.loadError;
  }

  return { displayName, medications, appointments, members, loadWarning };
}
