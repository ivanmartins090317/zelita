export const GEOFENCE_EVENT_TYPE = {
  zoneEnter: "zone_enter",
  zoneExit: "zone_exit",
  zoneReturn: "zone_return",
} as const;

export type GeofenceEventType =
  (typeof GEOFENCE_EVENT_TYPE)[keyof typeof GEOFENCE_EVENT_TYPE];

export type HistorySituationTone = "safe" | "warning" | "return";

export interface HistorySituationLabel {
  label: string;
  tone: HistorySituationTone;
}

export function resolveHistorySituationLabel(
  eventType: GeofenceEventType,
  labels: {
    safeZone: string;
    zoneExit: string;
    returned: string;
  },
): HistorySituationLabel {
  switch (eventType) {
    case GEOFENCE_EVENT_TYPE.zoneEnter:
      return { label: labels.safeZone, tone: "safe" };
    case GEOFENCE_EVENT_TYPE.zoneExit:
      return { label: labels.zoneExit, tone: "warning" };
    case GEOFENCE_EVENT_TYPE.zoneReturn:
      return { label: labels.returned, tone: "return" };
    default:
      return { label: labels.safeZone, tone: "safe" };
  }
}

export function parseGeofenceEventType(value: string): GeofenceEventType | null {
  if (value === GEOFENCE_EVENT_TYPE.zoneEnter) return GEOFENCE_EVENT_TYPE.zoneEnter;
  if (value === GEOFENCE_EVENT_TYPE.zoneExit) return GEOFENCE_EVENT_TYPE.zoneExit;
  if (value === GEOFENCE_EVENT_TYPE.zoneReturn) return GEOFENCE_EVENT_TYPE.zoneReturn;
  return null;
}
