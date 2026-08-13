import { describe, expect, it } from "vitest";

import {
  GEOFENCE_EVENT_TYPE,
  parseGeofenceEventType,
  resolveHistorySituationLabel,
} from "./location-history-labels";

const labels = {
  safeZone: "Zona segura",
  zoneExit: "Saída de zona segura",
  returned: "Retornou",
};

describe("resolveHistorySituationLabel", () => {
  it("entrada em zona", () => {
    expect(
      resolveHistorySituationLabel(GEOFENCE_EVENT_TYPE.zoneEnter, labels),
    ).toEqual({ label: "Zona segura", tone: "safe" });
  });

  it("saída de zona", () => {
    expect(
      resolveHistorySituationLabel(GEOFENCE_EVENT_TYPE.zoneExit, labels),
    ).toEqual({ label: "Saída de zona segura", tone: "warning" });
  });

  it("retorno", () => {
    expect(
      resolveHistorySituationLabel(GEOFENCE_EVENT_TYPE.zoneReturn, labels),
    ).toEqual({ label: "Retornou", tone: "return" });
  });
});

describe("parseGeofenceEventType", () => {
  it("aceita valores válidos", () => {
    expect(parseGeofenceEventType("zone_exit")).toBe(GEOFENCE_EVENT_TYPE.zoneExit);
  });

  it("null para inválido", () => {
    expect(parseGeofenceEventType("invalid")).toBeNull();
  });
});
