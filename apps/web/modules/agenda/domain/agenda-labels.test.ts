import { describe, expect, it } from "vitest";

import {
  formatAppointmentDateTime,
  formatAssigneeLine,
  formatCompanionTag,
  formatTaskDueLine,
  formatWeekTitle,
  isDateOnOrBefore,
} from "./agenda-labels";

describe("agenda-labels", () => {
  const now = new Date("2026-08-13T10:00:00.000-03:00");
  const tz = "America/Sao_Paulo";

  it("formata Hoje para consulta do dia", () => {
    const label = formatAppointmentDateTime({
      startsAt: "2026-08-13T15:00:00.000-03:00",
      now,
      timeZone: tz,
      todayLabel: "Hoje",
    });
    expect(label).toMatch(/^Hoje 15:00$/);
  });

  it("formata data futura com dia da semana", () => {
    const label = formatAppointmentDateTime({
      startsAt: "2026-08-20T07:30:00.000-03:00",
      now,
      timeZone: tz,
      todayLabel: "Hoje",
    });
    expect(label).toContain("20/08/2026");
    expect(label).toContain("07:30");
  });

  it("formata tag de acompanhante", () => {
    expect(formatCompanionTag("Ana Souza", "{nome} acompanha")).toBe(
      "Ana acompanha",
    );
    expect(formatCompanionTag(null, "{nome} acompanha")).toBeNull();
  });

  it("formata atribuição de tarefa", () => {
    expect(
      formatAssigneeLine({
        assigneeName: "Marcelo",
        currentUserId: "u1",
        assigneeProfileId: "u2",
        assignedToYou: "atribuída a você",
        assignedToTemplate: "atribuída a {nome}",
        anyoneLabel: "qualquer um",
      }),
    ).toBe("atribuída a Marcelo");

    expect(
      formatAssigneeLine({
        assigneeName: null,
        currentUserId: "u1",
        assigneeProfileId: "u1",
        assignedToYou: "atribuída a você",
        assignedToTemplate: "atribuída a {nome}",
        anyoneLabel: "qualquer um",
      }),
    ).toBe("atribuída a você");
  });

  it("monta linha secundária de tarefa", () => {
    expect(
      formatTaskDueLine({
        dueDate: "2026-08-25",
        assigneeLine: "atribuída a Marcelo",
        untilTemplate: "Até {data}",
        separator: " · ",
      }),
    ).toBe("Até 25/08/2026 · atribuída a Marcelo");
  });

  it("formata título da semana", () => {
    expect(
      formatWeekTitle({
        startDay: 9,
        endDay: 15,
        monthLabel: "agosto",
        template: "Semana de {inicio} a {fim} de {mes}",
      }),
    ).toBe("Semana de 9 a 15 de agosto");
  });

  it("compara datas", () => {
    expect(isDateOnOrBefore("2026-08-11", "2026-08-13")).toBe(true);
    expect(isDateOnOrBefore("2026-08-14", "2026-08-13")).toBe(false);
  });
});
