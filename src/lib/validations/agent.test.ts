import { describe, it, expect } from "vitest";
import { agentDraftRequestSchema } from "@/lib/validations/agent";

describe("agentDraftRequestSchema", () => {
  it("accepts a minimal valid request", () => {
    const result = agentDraftRequestSchema.safeParse({ department: "product", draftType: "sprint_plan" });
    expect(result.success).toBe(true);
  });

  it("accepts an optional goal", () => {
    const result = agentDraftRequestSchema.safeParse({
      department: "engineering",
      draftType: "backlog",
      goal: "Focus on the checkout flow",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown department", () => {
    const result = agentDraftRequestSchema.safeParse({ department: "sales", draftType: "sprint_plan" });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown draft type", () => {
    const result = agentDraftRequestSchema.safeParse({ department: "product", draftType: "roadmap" });
    expect(result.success).toBe(false);
  });
});
