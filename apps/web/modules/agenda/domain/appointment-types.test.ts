import { describe, expect, it } from "vitest";

import {
  APPOINTMENT_TYPES,
  formatAppointmentTitle,
  isAppointmentType,
} from "./appointment-types";

describe("appointment-types", () => {
  it("valida tipo conhecido", () => {
    expect(isAppointmentType("medical")).toBe(true);
    expect(isAppointmentType("invalid")).toBe(false);
  });

  it("formata título com especialidade", () => {
    expect(formatAppointmentTitle("Dr. Aurélio", "cardiologia")).toBe(
      "Dr. Aurélio · cardiologia",
    );
    expect(formatAppointmentTitle("Fisioterapia", null)).toBe("Fisioterapia");
  });

  it("expõe quatro tipos", () => {
    expect(Object.keys(APPOINTMENT_TYPES)).toHaveLength(4);
  });
});
