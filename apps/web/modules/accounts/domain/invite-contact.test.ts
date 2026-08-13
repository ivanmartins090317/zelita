import { describe, expect, it } from "vitest";

import {
  contactsMatch,
  isEmergencyPhoneOnlyInvite,
  parseInviteContact,
} from "./invite-contact";

describe("invite-contact", () => {
  it("normaliza e-mail em minúsculas", () => {
    const parsed = parseInviteContact("Ana@Email.COM");
    expect(parsed).toEqual({
      type: "email",
      normalized: "ana@email.com",
      display: "ana@email.com",
    });
  });

  it("rejeita contato vazio ou malformado", () => {
    expect(parseInviteContact("")).toBeNull();
    expect(parseInviteContact("   ")).toBeNull();
    expect(parseInviteContact("invalido")).toBeNull();
    expect(parseInviteContact("a@b")).toBeNull();
  });

  it("normaliza telefone BR com DDD", () => {
    const parsed = parseInviteContact("(11) 98888-1234");
    expect(parsed?.type).toBe("phone");
    expect(parsed?.normalized).toBe("5511988881234");
    expect(parsed?.display).toBe("(11) 98888-1234");
  });

  it("identifica emergência só telefone", () => {
    const contact = parseInviteContact("(11) 95555-9090");
    expect(contact).not.toBeNull();
    expect(
      isEmergencyPhoneOnlyInvite({
        role: "emergency_contact",
        contact: contact!,
      }),
    ).toBe(true);
    expect(
      isEmergencyPhoneOnlyInvite({
        role: "caregiver",
        contact: contact!,
      }),
    ).toBe(false);
  });

  it("deduplica contatos normalizados", () => {
    const emailA = parseInviteContact("a@b.com");
    const emailB = parseInviteContact("A@B.COM");
    expect(emailA && emailB && contactsMatch(emailA, emailB)).toBe(true);
  });
});
