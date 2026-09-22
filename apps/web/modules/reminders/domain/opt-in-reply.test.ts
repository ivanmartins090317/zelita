import { describe, expect, it } from "vitest";

import {
  isOptInAffirmation,
  nationalPhoneDigits,
  phonesMatch,
} from "./opt-in-reply";

describe("isOptInAffirmation", () => {
  it("aceita SIM normalizado", () => {
    expect(isOptInAffirmation("SIM")).toBe(true);
    expect(isOptInAffirmation("sim.")).toBe(true);
    expect(isOptInAffirmation("  Sím!  ")).toBe(true);
  });

  it("recusa outras respostas", () => {
    expect(isOptInAffirmation("nao")).toBe(false);
    expect(isOptInAffirmation("sim por favor")).toBe(false);
    expect(isOptInAffirmation("")).toBe(false);
  });
});

describe("phonesMatch", () => {
  it("casa 10–11 dígitos nacionais com +55 da Cloud API", () => {
    expect(phonesMatch("(11) 97777-4321", "5511977774321")).toBe(true);
    expect(phonesMatch("11977774321", "11977774321")).toBe(true);
  });

  it("não casa por 8 dígitos soltos", () => {
    expect(phonesMatch("11977774321", "5511988884321")).toBe(false);
    expect(phonesMatch("12", "12")).toBe(false);
  });
});

describe("nationalPhoneDigits", () => {
  it("remove o 55 internacional", () => {
    expect(nationalPhoneDigits("+55 11 97777-4321")).toBe("11977774321");
  });
});
