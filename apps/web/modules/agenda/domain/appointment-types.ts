export const APPOINTMENT_TYPES = {
  medical: "medical",
  physio: "physio",
  exam: "exam",
  other: "other",
} as const;

export type AppointmentType =
  (typeof APPOINTMENT_TYPES)[keyof typeof APPOINTMENT_TYPES];

export const APPOINTMENT_STATUSES = {
  scheduled: "scheduled",
  cancelled: "cancelled",
} as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUSES)[keyof typeof APPOINTMENT_STATUSES];

export interface AppointmentTypeVisual {
  icon: string;
  bgClass: string;
}

export const APPOINTMENT_TYPE_VISUALS: Record<
  AppointmentType,
  AppointmentTypeVisual
> = {
  medical: { icon: "🩺", bgClass: "bg-sky-100" },
  physio: { icon: "🧘", bgClass: "bg-amber-100" },
  exam: { icon: "🔬", bgClass: "bg-sky-100" },
  other: { icon: "📅", bgClass: "bg-gray-100" },
};

export function isAppointmentType(value: string): value is AppointmentType {
  return Object.values(APPOINTMENT_TYPES).includes(value as AppointmentType);
}

export function formatAppointmentTitle(
  title: string,
  specialty: string | null,
): string {
  if (specialty?.trim()) {
    return `${title} · ${specialty.trim()}`;
  }
  return title;
}
