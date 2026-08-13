import { describe, expect, it } from "vitest";

import { buildVisibilityLabel } from "../domain/visibility-labels";
import { filterExams } from "../domain/exam-filters";

describe("get-exames-page helpers", () => {
  it("monta rótulo de visibilidade Família", () => {
    expect(
      buildVisibilityLabel({
        membersWithAccess: [],
        familyLabel: "Família",
        familyPlusTemplate: "Família + {nome}",
      }),
    ).toBe("Família");
  });

  it("filtra exames por busca", () => {
    const result = filterExams({
      items: [
        {
          id: "1",
          title: "Hemograma",
          providerName: "Lab",
          originalFileName: "h.pdf",
          examDate: "2026-08-02",
          category: null,
        },
      ],
      query: "hemograma",
      categoryFilter: "all",
      formatDate: (d) => d,
    });
    expect(result).toHaveLength(1);
  });
});
