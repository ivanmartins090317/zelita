import { describe, expect, it } from "vitest";

import {
  buildReminderPreview,
  mapDndToPersistence,
  validateDndWindow,
} from "./message-preview";

describe("buildReminderPreview", () => {
  const base = {
    careDisplayName: "Seu João",
    managerName: "Cintia Rodrigues",
  };

  it("gera tom carinhoso com emoji leve", () => {
    const text = buildReminderPreview({ ...base, tone: "carinhoso" });
    expect(text).toContain("Seu João");
    expect(text).toContain("Cintia");
    expect(text).toContain("😊");
    expect(text).toContain("remédio");
    expect(text.toLowerCase()).not.toContain("tomou");
  });

  it("gera tom direto curto", () => {
    const text = buildReminderPreview({ ...base, tone: "direto" });
    expect(text).toContain("hora do remédio");
    expect(text.length).toBeLessThan(
      buildReminderPreview({ ...base, tone: "carinhoso" }).length,
    );
  });

  it("gera tom formal respeitoso", () => {
    const text = buildReminderPreview({ ...base, tone: "formal" });
    expect(text).toContain("Prezado(a)");
    expect(text).toContain("medicação");
  });

  it("usa fallback quando nomes vazios", () => {
    expect(
      buildReminderPreview({
        tone: "direto",
        careDisplayName: "",
        managerName: "",
      }),
    ).toContain("você");
  });
});

describe("validateDndWindow", () => {
  it("aceita janela padrão do protótipo", () => {
    expect(
      validateDndWindow({
        dontBotherBefore: "07:00",
        dontBotherAfter: "22:00",
      }),
    ).toEqual({ ok: true });
  });

  it("rejeita formato inválido", () => {
    expect(
      validateDndWindow({
        dontBotherBefore: "7h",
        dontBotherAfter: "22:00",
      }).ok,
    ).toBe(false);
  });

  it("rejeita horários iguais", () => {
    expect(
      validateDndWindow({
        dontBotherBefore: "08:00",
        dontBotherAfter: "08:00",
      }).ok,
    ).toBe(false);
  });
});

describe("mapDndToPersistence", () => {
  it("mapeia rótulos do wizard para colunas do banco", () => {
    expect(
      mapDndToPersistence({
        dontBotherBefore: "07:00",
        dontBotherAfter: "22:00",
      }),
    ).toEqual({ dndStart: "22:00", dndEnd: "07:00" });
  });
});
