import { describe, expect, it } from "vitest";

import {
  DEVICE_LINK_HOURLY_LIMIT,
  DEVICE_LABELS,
  LINK_ISSUE_BLOCKS,
  REMOTE_SEND_BLOCKS,
  canConfirmDeviceLink,
  canManageElderDevice,
  canViewElderDevices,
  classifyDeviceLabel,
  deviceLinkExpiresAt,
  deviceLinkFirstName,
  deviceLinkHourStart,
  deviceStatusLine,
  elderHelpClaimsFamilyNotified,
  formatPanelDateTime,
  interpretWhatsappSend,
  isDeviceLinkOpen,
  isDeviceLinkTokenShape,
  isHostedWhatsappRuntime,
  linkIssueBlock,
  linkingAllowedWhenPaused,
  maskWhatsapp,
  remoteSendBlock,
  resolveElderDoor,
  showsPreviewBanner,
} from "./device-link";
import {
  createDeviceToken,
  deviceSecretsMatch,
  hashDeviceSecret,
} from "./device-secret";

const NOW = new Date("2026-10-28T21:00:00.000Z");

describe("papel e conta pausada", () => {
  it("só a administradora cria e desvincula", () => {
    expect(canManageElderDevice("admin")).toBe(true);
    expect(canManageElderDevice("caregiver")).toBe(false);
    expect(canManageElderDevice("viewer")).toBe(false);
    expect(canManageElderDevice("emergency_contact")).toBe(false);
    expect(canManageElderDevice(null)).toBe(false);
  });

  it("cuidador lê a lista; os outros papéis sem Ajustes não entram", () => {
    expect(canViewElderDevices("admin")).toBe(true);
    expect(canViewElderDevices("caregiver")).toBe(true);
    expect(canViewElderDevices("viewer")).toBe(false);
    expect(canViewElderDevices("emergency_contact")).toBe(false);
  });

  it("conta pausada não bloqueia o vínculo", () => {
    expect(linkingAllowedWhenPaused()).toBe(true);
  });
});

describe("vida do link", () => {
  it("expira em 15 minutos e morre no uso", () => {
    const expiresAt = deviceLinkExpiresAt(NOW);
    expect(expiresAt.getTime() - NOW.getTime()).toBe(15 * 60 * 1000);
    expect(
      isDeviceLinkOpen({ usedAt: null, expiresAt, now: NOW }),
    ).toBe(true);
    expect(
      isDeviceLinkOpen({
        usedAt: null,
        expiresAt,
        now: new Date(expiresAt.getTime() - 1),
      }),
    ).toBe(true);
    expect(
      isDeviceLinkOpen({ usedAt: null, expiresAt, now: expiresAt }),
    ).toBe(false);
    expect(
      isDeviceLinkOpen({ usedAt: NOW, expiresAt, now: NOW }),
    ).toBe(false);
  });

  it("bloqueia o sexto link da hora e o segundo aparelho ativo", () => {
    expect(
      linkIssueBlock({ hasActiveDevice: false, linksInLastHour: 4 }),
    ).toBeNull();
    expect(
      linkIssueBlock({
        hasActiveDevice: false,
        linksInLastHour: DEVICE_LINK_HOURLY_LIMIT,
      }),
    ).toBe(LINK_ISSUE_BLOCKS.hourlyLimit);
    expect(
      linkIssueBlock({ hasActiveDevice: true, linksInLastHour: 0 }),
    ).toBe(LINK_ISSUE_BLOCKS.activeDevice);
    expect(deviceLinkHourStart(NOW).getTime()).toBe(
      NOW.getTime() - 60 * 60 * 1000,
    );
  });

  it("confirma só o link aberto, sem outro aparelho ativo", () => {
    expect(
      canConfirmDeviceLink({ linkOpen: true, hasActiveDevice: false }),
    ).toBe(true);
    expect(
      canConfirmDeviceLink({ linkOpen: false, hasActiveDevice: false }),
    ).toBe(false);
    expect(
      canConfirmDeviceLink({ linkOpen: true, hasActiveDevice: true }),
    ).toBe(false);
  });
});

describe("caminho remoto", () => {
  it("exige WhatsApp e opt-in, nessa ordem", () => {
    expect(remoteSendBlock({ whatsapp: "", optedIn: false })).toBe(
      REMOTE_SEND_BLOCKS.missingWhatsapp,
    );
    expect(remoteSendBlock({ whatsapp: "11999990000", optedIn: false })).toBe(
      REMOTE_SEND_BLOCKS.missingOptIn,
    );
    expect(
      remoteSendBlock({ whatsapp: "+55 11 99999-0000", optedIn: true }),
    ).toBeNull();
  });

  it("no Vercel o dry-run não conta como enviado", () => {
    expect(isHostedWhatsappRuntime("1")).toBe(true);
    expect(isHostedWhatsappRuntime(undefined)).toBe(false);
    expect(
      interpretWhatsappSend({ hosted: false, providerOk: true, dryRun: true }),
    ).toBe("dry_run");
    expect(
      interpretWhatsappSend({ hosted: true, providerOk: true, dryRun: true }),
    ).toBe("failed");
    expect(
      interpretWhatsappSend({ hosted: true, providerOk: false, dryRun: false }),
    ).toBe("failed");
    expect(
      interpretWhatsappSend({ hosted: true, providerOk: true, dryRun: false }),
    ).toBe("sent");
  });
});

describe("segredo e rótulo", () => {
  it("guarda só o hash e compara em tamanho fixo", () => {
    const token = createDeviceToken();
    expect(isDeviceLinkTokenShape(token)).toBe(true);
    expect(isDeviceLinkTokenShape("curto")).toBe(false);
    const hash = hashDeviceSecret(token);
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(token);
    expect(deviceSecretsMatch(hash, hashDeviceSecret(token))).toBe(true);
    expect(deviceSecretsMatch(hash, hashDeviceSecret("outro"))).toBe(false);
    expect(deviceSecretsMatch("abc", hash)).toBe(false);
    expect(hashDeviceSecret("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("recorta o aparelho em iPhone, Android ou computador", () => {
    expect(classifyDeviceLabel("Mozilla iPhone")).toBe(DEVICE_LABELS.iphone);
    expect(classifyDeviceLabel("Mozilla Android 14")).toBe(DEVICE_LABELS.android);
    expect(classifyDeviceLabel("Mozilla Macintosh")).toBe(DEVICE_LABELS.computer);
    expect(classifyDeviceLabel("iPad")).toBe(DEVICE_LABELS.computer);
    expect(classifyDeviceLabel(null)).toBe(DEVICE_LABELS.computer);
  });

  it("mascara o WhatsApp e usa o primeiro nome", () => {
    expect(maskWhatsapp("+55 (13) 97401-0646")).toBe("•••• 0646");
    expect(maskWhatsapp("12")).toBe("");
    expect(deviceLinkFirstName("João da Silva")).toBe("João");
    expect(deviceLinkFirstName("  ")).toBe("você");
  });
});

describe("porta do idoso", () => {
  it("aparelho válido abre sem faixa; a prévia conserva a faixa", () => {
    expect(
      resolveElderDoor({ hasActiveDevice: true, hasFamilyPreview: true }),
    ).toBe("device");
    expect(
      resolveElderDoor({ hasActiveDevice: false, hasFamilyPreview: true }),
    ).toBe("preview");
    expect(
      resolveElderDoor({ hasActiveDevice: false, hasFamilyPreview: false }),
    ).toBe("closed");
    expect(showsPreviewBanner("preview")).toBe(true);
    expect(showsPreviewBanner("device")).toBe(false);
    expect(elderHelpClaimsFamilyNotified("device")).toBe(true);
    expect(elderHelpClaimsFamilyNotified("preview")).toBe(false);
    expect(elderHelpClaimsFamilyNotified("closed")).toBe(false);
  });

  it("mostra data e rótulo no fuso de São Paulo", () => {
    expect(formatPanelDateTime(NOW)).toBe("28/10/2026 18:00");
    expect(
      deviceStatusLine({ label: "iphone", linkedAt: NOW }),
    ).toBe("iPhone · ligado em 28/10/2026 18:00");
  });
});
