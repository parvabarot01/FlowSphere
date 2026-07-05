import { describe, it, expect } from "vitest";
import { createSprintSchema, updateSprintStatusSchema } from "@/lib/validations/sprint";

describe("createSprintSchema", () => {
  it("accepts a minimal sprint (name only)", () => {
    expect(createSprintSchema.safeParse({ name: "Sprint 1" }).success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    expect(createSprintSchema.safeParse({ name: "S" }).success).toBe(false);
  });
});

describe("updateSprintStatusSchema", () => {
  it("accepts each valid status", () => {
    for (const status of ["planned", "active", "completed"]) {
      expect(updateSprintStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    expect(updateSprintStatusSchema.safeParse({ status: "archived" }).success).toBe(false);
  });
});
