import { describe, expect, it } from "vitest";

import { isTaskType, TASK_TYPES } from "./task-types";

describe("task-types", () => {
  it("valida tipo conhecido", () => {
    expect(isTaskType("shopping")).toBe(true);
    expect(isTaskType("unknown")).toBe(false);
  });

  it("expõe quatro tipos", () => {
    expect(Object.keys(TASK_TYPES)).toHaveLength(4);
  });
});
