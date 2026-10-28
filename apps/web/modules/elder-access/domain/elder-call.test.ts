import { describe, expect, it } from "vitest";

import {
  SAMU_TEL,
  buildElderCallList,
  toMemberTel,
} from "./elder-call";

describe("discagem da família", () => {
  it("monta tel com DDI e deixa sem link quem não tem telefone", () => {
    expect(toMemberTel("(11) 98888-1234")).toBe("tel:+5511988881234");
    expect(toMemberTel("5511988881234")).toBe("tel:+5511988881234");
    expect(toMemberTel(null)).toBeNull();
    expect(toMemberTel("")).toBeNull();
    expect(SAMU_TEL).toBe("tel:192");

    const rows = buildElderCallList([
      {
        id: "cintia",
        displayName: "Cintia",
        relationshipLabel: "filha",
        phone: "(11) 98888-1234",
      },
      {
        id: "ana",
        displayName: "Ana",
        relationshipLabel: null,
        phone: null,
      },
    ]);

    expect(rows[0]).toMatchObject({
      name: "Cintia",
      kinship: "filha",
      tel: "tel:+5511988881234",
    });
    expect(rows[1]).toMatchObject({
      name: "Ana",
      kinship: "família",
      tel: null,
    });
    expect(rows[1]?.name).not.toBe(rows[1]?.tel);
  });
});
