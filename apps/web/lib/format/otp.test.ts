import { describe, expect, it } from "vitest";

import {
  ACCESS_CODE_LENGTH,
  formatAccessCode,
  isValidAccessCodeLength,
  normalizeAccessCodeInput,
  resolveAccessCodeBoxLength,
  toAccessCodeDigits,
} from "./otp";

describe("formatAccessCode", () => {
  it("agrupa o código de seis dígitos em dois blocos", () => {
    expect(formatAccessCode("835104")).toBe("835 104");
  });

  it("ignora pontuação e espaço já digitados", () => {
    expect(formatAccessCode("835-104")).toBe("835 104");
  });

  it("não quebra com menos ou mais dígitos que o esperado", () => {
    expect(formatAccessCode("8351")).toBe("835 1");
    expect(formatAccessCode("83510412")).toBe("835 104 12");
  });

  it("devolve vazio para entrada sem dígito, nula ou indefinida", () => {
    expect(formatAccessCode("abc")).toBe("");
    expect(formatAccessCode("")).toBe("");
    expect(formatAccessCode(null)).toBe("");
    expect(formatAccessCode(undefined)).toBe("");
  });
});

describe("resolveAccessCodeBoxLength", () => {
  it("sempre reserva oito casas na UI de auth", () => {
    expect(resolveAccessCodeBoxLength()).toBe(8);
  });
});

describe("isValidAccessCodeLength", () => {
  it("aceita códigos de seis a oito dígitos", () => {
    expect(isValidAccessCodeLength(5)).toBe(false);
    expect(isValidAccessCodeLength(6)).toBe(true);
    expect(isValidAccessCodeLength(8)).toBe(true);
    expect(isValidAccessCodeLength(9)).toBe(false);
  });
});

describe("normalizeAccessCodeInput", () => {
  it("mantém até oito dígitos numéricos", () => {
    expect(normalizeAccessCodeInput("04145851")).toBe("04145851");
    expect(normalizeAccessCodeInput("0414585199")).toBe("04145851");
  });
});

describe("toAccessCodeDigits", () => {
  it("preenche as seis casas por padrão", () => {
    expect(toAccessCodeDigits("835104")).toEqual([
      "8",
      "3",
      "5",
      "1",
      "0",
      "4",
    ]);
    expect(ACCESS_CODE_LENGTH).toBe(6);
  });

  it("deixa vazia a casa ainda não digitada", () => {
    expect(toAccessCodeDigits("835")).toEqual(["8", "3", "5", "", "", ""]);
  });

  it("descarta dígito além do tamanho da caixa", () => {
    expect(toAccessCodeDigits("8351049", 6)).toEqual([
      "8",
      "3",
      "5",
      "1",
      "0",
      "4",
    ]);
  });

  it("aceita tamanho customizado e tamanho degenerado", () => {
    expect(toAccessCodeDigits("8351", 4)).toEqual(["8", "3", "5", "1"]);
    expect(toAccessCodeDigits("8351", -1)).toEqual([]);
  });

  it("não quebra com entrada nula ou indefinida", () => {
    expect(toAccessCodeDigits(null)).toEqual(["", "", "", "", "", ""]);
    expect(toAccessCodeDigits(undefined)).toEqual(["", "", "", "", "", ""]);
  });
});
