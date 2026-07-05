import { describe, it, expect } from "vitest";
import { createTaskSchema, updateTaskStatusSchema } from "@/lib/validations/task";

describe("createTaskSchema", () => {
  it("accepts a minimal task (title only)", () => {
    const result = createTaskSchema.safeParse({ title: "Ship the release" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("medium");
    }
  });

  it("rejects an empty title", () => {
    expect(createTaskSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    expect(createTaskSchema.safeParse({ title: "Task", priority: "critical" }).success).toBe(false);
  });
});

describe("updateTaskStatusSchema", () => {
  it("accepts each valid status", () => {
    for (const status of ["todo", "in_progress", "in_review", "done"]) {
      expect(updateTaskStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an unknown status", () => {
    expect(updateTaskStatusSchema.safeParse({ status: "archived" }).success).toBe(false);
  });
});
