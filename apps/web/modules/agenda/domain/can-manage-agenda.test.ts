import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "@/modules/accounts/domain/roles";

import { canCompleteTask, canManageAgenda } from "./can-manage-agenda";

describe("can-manage-agenda", () => {
  it("admin e cuidador gerenciam agenda", () => {
    expect(canManageAgenda(ACCOUNT_ROLES.admin)).toBe(true);
    expect(canManageAgenda(ACCOUNT_ROLES.caregiver)).toBe(true);
    expect(canManageAgenda(ACCOUNT_ROLES.viewer)).toBe(false);
  });

  it("atribuído pode concluir tarefa", () => {
    expect(
      canCompleteTask({
        role: ACCOUNT_ROLES.viewer,
        userId: "user-1",
        assigneeProfileId: "user-1",
      }),
    ).toBe(true);
    expect(
      canCompleteTask({
        role: ACCOUNT_ROLES.viewer,
        userId: "user-2",
        assigneeProfileId: "user-1",
      }),
    ).toBe(false);
  });
});
