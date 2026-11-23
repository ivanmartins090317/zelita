import { describe, expect, it } from "vitest";

import {
  formatSignupAddress,
  initialSignupAddress,
  validateSignupAddress,
} from "@/modules/care-recipients/presentation/signup-address";

const fullAddress = {
  street: "Rua 9 de Julho",
  number: "73",
  complement: "apto 91",
  district: "Embaré",
  city: "Santos",
  state: "sp",
};

describe("formatSignupAddress", () => {
  it("monta uma linha legível com todos os campos", () => {
    expect(formatSignupAddress(fullAddress)).toBe(
      "Rua 9 de Julho, 73 - apto 91 - Embaré - Santos - SP",
    );
  });

  it("omite o complemento quando vazio", () => {
    expect(formatSignupAddress({ ...fullAddress, complement: "  " })).toBe(
      "Rua 9 de Julho, 73 - Embaré - Santos - SP",
    );
  });
});

describe("validateSignupAddress", () => {
  it("aceita endereço completo sem complemento", () => {
    expect(validateSignupAddress({ ...fullAddress, complement: "" })).toEqual({});
  });

  it("aponta cada campo obrigatório vazio", () => {
    const errors = validateSignupAddress(initialSignupAddress);
    expect(Object.keys(errors).sort()).toEqual(
      ["city", "district", "number", "state", "street"].sort(),
    );
  });

  it("recusa UF inexistente", () => {
    expect(validateSignupAddress({ ...fullAddress, state: "XX" }).state).toBeDefined();
  });
});
