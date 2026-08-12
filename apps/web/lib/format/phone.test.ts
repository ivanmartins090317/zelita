import { describe, expect, it } from "vitest";

import { formatPhoneBR, onlyDigits } from "./phone";

describe("onlyDigits", () => {
  it("descarta tudo que não é dígito", () => {
    expect(onlyDigits("(11) 97777-4321")).toBe("11977774321");
    expect(onlyDigits("abc")).toBe("");
  });

  it("devolve vazio para nulo, indefinido e string vazia", () => {
    expect(onlyDigits(null)).toBe("");
    expect(onlyDigits(undefined)).toBe("");
    expect(onlyDigits("")).toBe("");
  });
});

describe("formatPhoneBR", () => {
  it("formata celular com DDD e o dígito nove", () => {
    expect(formatPhoneBR("11977774321")).toBe("(11) 97777-4321");
  });

  it("aceita número que já vem pontuado", () => {
    expect(formatPhoneBR("(11) 97777-4321")).toBe("(11) 97777-4321");
    expect(formatPhoneBR("11 97777 4321")).toBe("(11) 97777-4321");
  });

  it("formata telefone fixo com bloco de quatro", () => {
    expect(formatPhoneBR("1133334444")).toBe("(11) 3333-4444");
  });

  it("formata parcialmente durante a digitação, sem inventar dígito", () => {
    expect(formatPhoneBR("1")).toBe("(1");
    expect(formatPhoneBR("11")).toBe("(11");
    expect(formatPhoneBR("119")).toBe("(11) 9");
    expect(formatPhoneBR("119777")).toBe("(11) 9777");
    expect(formatPhoneBR("1197777")).toBe("(11) 9777-7");
  });

  it("descarta dígito além do tamanho de um celular brasileiro", () => {
    expect(formatPhoneBR("119777743219999")).toBe("(11) 97777-4321");
  });

  it("não quebra com letras, vazio ou nulo", () => {
    expect(formatPhoneBR("telefone")).toBe("");
    expect(formatPhoneBR("")).toBe("");
    expect(formatPhoneBR(null)).toBe("");
    expect(formatPhoneBR(undefined)).toBe("");
  });
});
