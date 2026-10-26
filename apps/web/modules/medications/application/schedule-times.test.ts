import { describe, expect, it } from "vitest";

import { parseScheduleTimes } from "./schedule-times";

describe("parseScheduleTimes", () => {
  it("aceita horário fora dos pré-definidos e ordena", () => {
    expect(parseScheduleTimes("18:00, 9:30", 2)).toEqual(["09:30", "18:00"]);
  });

  it("recusa horário inválido, quantidade diferente ou repetido", () => {
    expect(parseScheduleTimes("25:00", 1)).toBeNull();
    expect(parseScheduleTimes("08:00", 2)).toBeNull();
    expect(parseScheduleTimes("08:00,08:00", 2)).toBeNull();
  });
});
