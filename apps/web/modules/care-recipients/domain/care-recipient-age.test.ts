import { describe, expect, it } from "vitest";

import {
  computeAgeYears,
  formatCareRecipientBirthDisplay,
} from "./care-recipient-age";

describe("computeAgeYears", () => {
  it("calcula idade em anos completos", () => {
    expect(
      computeAgeYears("1946-03-14", new Date("2026-08-14T12:00:00.000Z")),
    ).toBe(80);
  });

  it("desconta aniversário ainda não ocorrido no ano", () => {
    expect(
      computeAgeYears("1946-03-14", new Date("2026-01-10T12:00:00.000Z")),
    ).toBe(79);
  });

  it("retorna null para data inválida", () => {
    expect(computeAgeYears("invalid")).toBeNull();
  });
});

describe("formatCareRecipientBirthDisplay", () => {
  it("formata data e idade", () => {
    expect(
      formatCareRecipientBirthDisplay({
        birthDate: "1946-03-14",
        now: new Date("2026-08-14T12:00:00.000Z"),
      }),
    ).toEqual({
      birthDateLabel: "14/03/1946",
      ageLabel: "80 anos",
    });
  });

  it("retorna traço sem data", () => {
    expect(formatCareRecipientBirthDisplay({ birthDate: null })).toEqual({
      birthDateLabel: "—",
      ageLabel: null,
    });
  });
});
