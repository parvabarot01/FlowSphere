import { describe, it, expect } from "vitest";
import { isDepartment, DEPARTMENT_SYSTEM_PROMPTS, DEPARTMENTS } from "@/lib/ai/departments";

describe("isDepartment", () => {
  it("accepts every known department", () => {
    for (const d of DEPARTMENTS) {
      expect(isDepartment(d.value)).toBe(true);
    }
  });

  it("rejects an unknown department", () => {
    expect(isDepartment("marketing")).toBe(false);
  });
});

describe("DEPARTMENT_SYSTEM_PROMPTS", () => {
  it("has a non-empty prompt for every department", () => {
    for (const d of DEPARTMENTS) {
      expect(DEPARTMENT_SYSTEM_PROMPTS[d.value].length).toBeGreaterThan(0);
    }
  });
});
