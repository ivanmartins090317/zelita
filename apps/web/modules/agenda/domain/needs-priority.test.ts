import { describe, expect, it } from "vitest";

import { TASK_TYPES } from "./task-types";
import { buildNeedsAttentionItems } from "./needs-priority";

describe("needs-priority", () => {
  const copy = {
    assignedToYou: "atribuída a você",
    assignedToTemplate: "atribuída a {nome}",
    untilTemplate: "Até {data}",
    separator: " · ",
    consultasHref: "/familia/consultas",
  };

  it("prioriza refill antes de tarefas", () => {
    const items = buildNeedsAttentionItems({
      todayDateKey: "2026-08-13",
      currentUserId: "u1",
      refillItems: [
        {
          id: "refill-1",
          kind: "refill",
          sortKey: 0,
          title: "Comprar Losartana",
          subtitle: "urgente",
          icon: "💊",
        },
      ],
      tasks: [
        {
          id: "t1",
          title: "Ligar convênio",
          taskType: TASK_TYPES.call,
          dueDate: "2026-08-11",
          assigneeProfileId: "u1",
          assigneeName: "Você",
        },
      ],
      copy,
    });

    expect(items[0]?.kind).toBe("refill");
    expect(items.some((item) => item.title === "Ligar convênio")).toBe(true);
  });

  it("limita a três itens", () => {
    const items = buildNeedsAttentionItems({
      todayDateKey: "2026-08-13",
      currentUserId: "u1",
      refillItems: [],
      tasks: [
        {
          id: "t1",
          title: "T1",
          taskType: TASK_TYPES.other,
          dueDate: "2026-08-10",
          assigneeProfileId: "u1",
          assigneeName: null,
        },
        {
          id: "t2",
          title: "T2",
          taskType: TASK_TYPES.other,
          dueDate: "2026-08-11",
          assigneeProfileId: "u1",
          assigneeName: null,
        },
        {
          id: "t3",
          title: "T3",
          taskType: TASK_TYPES.other,
          dueDate: "2026-08-12",
          assigneeProfileId: "u1",
          assigneeName: null,
        },
        {
          id: "t4",
          title: "T4",
          taskType: TASK_TYPES.other,
          dueDate: "2026-08-13",
          assigneeProfileId: "u1",
          assigneeName: null,
        },
      ],
      copy,
      maxItems: 3,
    });

    expect(items).toHaveLength(3);
  });

  it("inclui tarefa atribuída sem prazo", () => {
    const items = buildNeedsAttentionItems({
      todayDateKey: "2026-08-13",
      currentUserId: "u1",
      refillItems: [],
      tasks: [
        {
          id: "t1",
          title: "Organizar documentos",
          taskType: TASK_TYPES.other,
          dueDate: null,
          assigneeProfileId: "u1",
          assigneeName: null,
        },
      ],
      copy,
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("Organizar documentos");
  });

  it("ignora tarefa futura sem atribuição relevante", () => {
    const items = buildNeedsAttentionItems({
      todayDateKey: "2026-08-13",
      currentUserId: "u1",
      refillItems: [],
      tasks: [
        {
          id: "t1",
          title: "Futura",
          taskType: TASK_TYPES.other,
          dueDate: "2026-08-20",
          assigneeProfileId: "u2",
          assigneeName: "Ana",
        },
      ],
      copy,
    });

    expect(items).toHaveLength(0);
  });
});
