import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import { LOCATION_TIMING } from "../constants";
import {
  LOCATION_REQUEST_CARD_PHASE,
  LOCATION_REQUEST_CLOSE_REASON,
  LOCATION_REQUEST_STATUS,
  canAdminRequestLocation,
  isLocationRequestExpired,
  isPresenceFresh,
  isWithinRequestCooldown,
  rejectsCachedGeolocation,
  requestedPointSkipsHomeAndZoneEffects,
  resolveExpiredCloseReason,
  resolveLocationRequestCardPhase,
  shouldAttemptGpsForOpenRequest,
  type LocationRequestSnapshot,
} from "./location-request";

const BASE_NOW = new Date("2026-11-11T15:00:00.000Z");

function openRequest(
  overrides: Partial<LocationRequestSnapshot> = {},
): LocationRequestSnapshot {
  return {
    status: LOCATION_REQUEST_STATUS.open,
    requestedAt: BASE_NOW.toISOString(),
    expiresAt: new Date(
      BASE_NOW.getTime() + LOCATION_TIMING.requestExpiryMs,
    ).toISOString(),
    completedAt: null,
    closeReason: null,
    hadFreshPresence: false,
    readAttempted: false,
    ...overrides,
  };
}

const READY_REQUEST = {
  role: ACCOUNT_ROLES.admin,
  accountPaused: false,
  consentActive: true,
  hasAdvancedLocation: true,
  hasActiveDevice: true,
  openRequest: null as LocationRequestSnapshot | null,
  lastRequestedAt: null as string | null,
  now: BASE_NOW,
};

describe("canAdminRequestLocation", () => {
  it("só administradora com pré-condições completas pode pedir", () => {
    expect(canAdminRequestLocation(READY_REQUEST)).toEqual({ ok: true });
  });

  it("cuidadora e outros papéis não podem pedir", () => {
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        role: ACCOUNT_ROLES.caregiver,
      }),
    ).toEqual({ ok: false, reason: "not_admin" });
  });

  it("conta pausada, sem consentimento, sem plano avançado ou sem aparelho bloqueiam", () => {
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        accountPaused: true,
      }),
    ).toEqual({ ok: false, reason: "blocked", block: "account_paused" });
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        consentActive: false,
      }),
    ).toEqual({ ok: false, reason: "blocked", block: "no_consent" });
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        hasAdvancedLocation: false,
      }),
    ).toEqual({ ok: false, reason: "blocked", block: "no_advanced" });
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        hasActiveDevice: false,
      }),
    ).toEqual({ ok: false, reason: "blocked", block: "no_device" });
  });

  it("pedido aberto ou intervalo de 2 minutos recusam outro pedido", () => {
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        openRequest: openRequest(),
      }),
    ).toEqual({ ok: false, reason: "open_request" });

    const oneMinuteAgo = new Date(
      BASE_NOW.getTime() - 60_000,
    ).toISOString();
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        lastRequestedAt: oneMinuteAgo,
      }),
    ).toEqual({ ok: false, reason: "cooldown" });

    const twoMinutesAgo = new Date(
      BASE_NOW.getTime() - LOCATION_TIMING.requestCooldownMs,
    ).toISOString();
    expect(
      canAdminRequestLocation({
        ...READY_REQUEST,
        lastRequestedAt: twoMinutesAgo,
      }),
    ).toEqual({ ok: true });
  });
});

describe("isPresenceFresh", () => {
  it("presença com mais de 90 segundos é velha", () => {
    const seen = new Date(
      BASE_NOW.getTime() - LOCATION_TIMING.presenceFreshMs - 1,
    ).toISOString();
    expect(isPresenceFresh(seen, BASE_NOW)).toBe(false);
  });

  it("presença renovada há 90 segundos ou menos é fresca", () => {
    const seen = new Date(
      BASE_NOW.getTime() - LOCATION_TIMING.presenceFreshMs,
    ).toISOString();
    expect(isPresenceFresh(seen, BASE_NOW)).toBe(true);
  });
});

describe("resolveLocationRequestCardPhase", () => {
  it("pedido aberto com presença fresca mostra pedindo", () => {
    const seen = new Date(BASE_NOW.getTime() - 10_000).toISOString();
    expect(
      resolveLocationRequestCardPhase({
        request: openRequest(),
        lastSeenAt: seen,
        now: BASE_NOW,
        canRequest: { ok: false, reason: "open_request" },
      }),
    ).toBe(LOCATION_REQUEST_CARD_PHASE.requesting);
  });

  it("pedido aberto com presença velha mostra aplicativo fechado", () => {
    const seen = new Date(
      BASE_NOW.getTime() - LOCATION_TIMING.presenceFreshMs - 5_000,
    ).toISOString();
    expect(
      resolveLocationRequestCardPhase({
        request: openRequest(),
        lastSeenAt: seen,
        now: BASE_NOW,
        canRequest: { ok: false, reason: "open_request" },
      }),
    ).toBe(LOCATION_REQUEST_CARD_PHASE.appNotOpen);
  });

  it("falha na primeira leitura encerra como GPS não enviou", () => {
    expect(
      resolveLocationRequestCardPhase({
        request: openRequest({ readAttempted: true }),
        lastSeenAt: BASE_NOW.toISOString(),
        now: BASE_NOW,
        canRequest: { ok: false, reason: "cooldown" },
      }),
    ).toBe(LOCATION_REQUEST_CARD_PHASE.gpsFailed);
  });

  it("5 minutos sem ponto e com presença fresca em algum momento", () => {
    const expired = new Date(
      BASE_NOW.getTime() + LOCATION_TIMING.requestExpiryMs + 1,
    );
    expect(
      resolveLocationRequestCardPhase({
        request: openRequest({ hadFreshPresence: true }),
        lastSeenAt: null,
        now: expired,
        canRequest: { ok: true },
      }),
    ).toBe(LOCATION_REQUEST_CARD_PHASE.appClosedOrOffline);
  });

  it("5 minutos sem presença fresca mantém aplicativo não aberto", () => {
    const expired = new Date(
      BASE_NOW.getTime() + LOCATION_TIMING.requestExpiryMs + 1,
    );
    expect(
      resolveLocationRequestCardPhase({
        request: openRequest({ hadFreshPresence: false }),
        lastSeenAt: null,
        now: expired,
        canRequest: { ok: true },
      }),
    ).toBe(LOCATION_REQUEST_CARD_PHASE.appNotOpen);
  });

  it("intervalo de 2 minutos mostra espera", () => {
    expect(
      resolveLocationRequestCardPhase({
        request: null,
        lastSeenAt: null,
        now: BASE_NOW,
        canRequest: { ok: false, reason: "cooldown" },
      }),
    ).toBe(LOCATION_REQUEST_CARD_PHASE.waitCooldown);
  });
});

describe("isWithinRequestCooldown", () => {
  it("cooldown conta da hora do pedido, não do término", () => {
    const requestedAt = new Date(BASE_NOW.getTime() - 90_000).toISOString();
    expect(
      isWithinRequestCooldown(
        requestedAt,
        BASE_NOW,
        LOCATION_TIMING.requestCooldownMs,
      ),
    ).toBe(true);
  });
});

describe("resolveExpiredCloseReason", () => {
  it("escolhe motivo conforme houve presença fresca", () => {
    expect(resolveExpiredCloseReason(true)).toBe(
      LOCATION_REQUEST_CLOSE_REASON.appClosedOrOffline,
    );
    expect(resolveExpiredCloseReason(false)).toBe(
      LOCATION_REQUEST_CLOSE_REASON.appNotOpen,
    );
  });
});

describe("rejectsCachedGeolocation", () => {
  it("posição antiga do aparelho não vale", () => {
    expect(rejectsCachedGeolocation(0)).toBe(false);
    expect(rejectsCachedGeolocation(60_000)).toBe(true);
  });
});

describe("requestedPointSkipsHomeAndZoneEffects", () => {
  it("posição pedida não confirma Casa nem dispara saída de zona", () => {
    expect(requestedPointSkipsHomeAndZoneEffects()).toBe(true);
  });
});

describe("shouldAttemptGpsForOpenRequest", () => {
  it("não repete leitura após primeira tentativa", () => {
    expect(
      shouldAttemptGpsForOpenRequest({
        request: openRequest(),
        readAlreadyAttempted: true,
        now: BASE_NOW,
        consentActive: true,
        accountPaused: false,
      }),
    ).toBe(false);
  });

  it("não lê com consentimento revogado ou conta pausada", () => {
    expect(
      shouldAttemptGpsForOpenRequest({
        request: openRequest(),
        readAlreadyAttempted: false,
        now: BASE_NOW,
        consentActive: false,
        accountPaused: false,
      }),
    ).toBe(false);
    expect(
      shouldAttemptGpsForOpenRequest({
        request: openRequest(),
        readAlreadyAttempted: false,
        now: BASE_NOW,
        consentActive: true,
        accountPaused: true,
      }),
    ).toBe(false);
  });

  it("não lê depois do prazo de 5 minutos", () => {
    const past = new Date(
      BASE_NOW.getTime() + LOCATION_TIMING.requestExpiryMs + 1,
    );
    expect(
      shouldAttemptGpsForOpenRequest({
        request: openRequest(),
        readAlreadyAttempted: false,
        now: past,
        consentActive: true,
        accountPaused: false,
      }),
    ).toBe(false);
    expect(isLocationRequestExpired(openRequest(), past)).toBe(true);
  });
});
