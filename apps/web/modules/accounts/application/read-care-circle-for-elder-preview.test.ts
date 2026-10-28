import { describe, expect, it } from "vitest";

import { selectActiveMembersForElder } from "./read-care-circle-for-elder-preview";

describe("selectActiveMembersForElder", () => {
  it("fica só com membro ativo e descarta convite", () => {
    const selected = selectActiveMembersForElder([
      {
        id: "membro",
        kind: "member",
        situation: "active",
        displayName: "Cintia",
        relationshipLabel: "filha",
        phone: "11988881234",
      },
      {
        id: "convite",
        kind: "invite",
        situation: "pending",
        displayName: "Marcelo",
        relationshipLabel: "filho",
        phone: "11977771234",
      },
      {
        id: "pausado",
        kind: "member",
        situation: "pending",
        displayName: "Lúcia",
        relationshipLabel: "irmã",
        phone: null,
      },
    ]);

    expect(selected).toEqual([
      {
        id: "membro",
        displayName: "Cintia",
        relationshipLabel: "filha",
        phone: "11988881234",
      },
    ]);
  });
});
