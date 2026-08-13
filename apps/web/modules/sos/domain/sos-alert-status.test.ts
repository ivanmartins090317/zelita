import { describe, expect, it } from "vitest";

import {
  isOpenSosAlert,
  isTerminalSosAlert,
  parseSosAlertStatus,
  SOS_ALERT_STATUS,
  SOS_ALERT_STATUS_LABELS,
} from "./sos-alert-status";

describe("sos-alert-status", () => {
  it("rotula status conhecidos", () => {
    expect(SOS_ALERT_STATUS_LABELS.open).toBe("Aberto");
    expect(SOS_ALERT_STATUS_LABELS.resolved).toBe("Resolvido");
  });

  it("identifica aberto vs terminal", () => {
    expect(isOpenSosAlert(SOS_ALERT_STATUS.open)).toBe(true);
    expect(isTerminalSosAlert(SOS_ALERT_STATUS.resolved)).toBe(true);
    expect(isTerminalSosAlert(SOS_ALERT_STATUS.cancelled)).toBe(true);
    expect(isTerminalSosAlert(SOS_ALERT_STATUS.open)).toBe(false);
  });

  it("parseia status válidos", () => {
    expect(parseSosAlertStatus("open")).toBe("open");
    expect(parseSosAlertStatus("invalid")).toBeNull();
  });
});
