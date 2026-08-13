import { describe, expect, it } from "vitest";

import { buildVisibilityLabel } from "./visibility-labels";

describe("buildVisibilityLabel", () => {
  const copy = {
    familyLabel: "Família",
    familyPlusTemplate: "Família + {nome}",
  };

  it("retorna Família quando só admins", () => {
    expect(
      buildVisibilityLabel({
        membersWithAccess: [{ profileId: "1", displayName: "Cintia", isAdmin: true }],
        ...copy,
      }),
    ).toBe("Família");
  });

  it("retorna Família + nome para um membro extra", () => {
    expect(
      buildVisibilityLabel({
        membersWithAccess: [
          { profileId: "1", displayName: "Cintia", isAdmin: true },
          { profileId: "2", displayName: "Ana Souza", isAdmin: false },
        ],
        ...copy,
      }),
    ).toBe("Família + Ana Souza");
  });

  it("lista múltiplos nomes", () => {
    expect(
      buildVisibilityLabel({
        membersWithAccess: [
          { profileId: "1", displayName: "Cintia", isAdmin: true },
          { profileId: "2", displayName: "Ana", isAdmin: false },
          { profileId: "3", displayName: "Paula", isAdmin: false },
        ],
        ...copy,
      }),
    ).toBe("Família + Ana, Paula");
  });
});
