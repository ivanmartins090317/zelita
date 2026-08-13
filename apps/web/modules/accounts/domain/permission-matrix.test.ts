import { describe, expect, it } from "vitest";

import { ACCOUNT_ROLES } from "./roles";
import {
  PERMISSION_MATRIX_ROWS,
  permissionCellAriaLabel,
  permissionCellSymbol,
} from "./permission-matrix";

describe("permission-matrix", () => {
  it("expõe onze permissões do PRD", () => {
    expect(PERMISSION_MATRIX_ROWS).toHaveLength(11);
  });

  it("admin tem acesso total", () => {
    for (const row of PERMISSION_MATRIX_ROWS) {
      expect(row.cells[ACCOUNT_ROLES.admin]).toBe("allowed");
    }
  });

  it("marca células condicionais conforme PRD", () => {
    const viewExams = PERMISSION_MATRIX_ROWS.find((row) => row.id === "view_exams");
    expect(viewExams?.cells[ACCOUNT_ROLES.caregiver]).toBe("conditional");
    expect(viewExams?.conditionalNote?.[ACCOUNT_ROLES.caregiver]).toBe(
      "conforme autorização",
    );

    const sos = PERMISSION_MATRIX_ROWS.find((row) => row.id === "receive_sos");
    expect(sos?.cells[ACCOUNT_ROLES.viewer]).toBe("conditional");
    expect(sos?.conditionalNote?.[ACCOUNT_ROLES.viewer]).toBe("opcional");

    const geo = PERMISSION_MATRIX_ROWS.find((row) => row.id === "view_location");
    expect(geo?.cells[ACCOUNT_ROLES.emergency_contact]).toBe("conditional");
    expect(geo?.conditionalNote?.[ACCOUNT_ROLES.emergency_contact]).toBe(
      "só durante um SOS",
    );
  });

  it("símbolos da legenda", () => {
    expect(permissionCellSymbol("allowed")).toBe("●");
    expect(permissionCellSymbol("conditional")).toBe("◐");
    expect(permissionCellSymbol("denied")).toBe("—");
    expect(permissionCellAriaLabel("conditional", "opcional")).toContain(
      "opcional",
    );
  });
});
