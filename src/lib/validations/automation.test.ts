import { describe, it, expect } from "vitest";
import { createAutomationRuleSchema } from "@/lib/validations/automation";

describe("createAutomationRuleSchema", () => {
  it("accepts a minimal task_status_changed -> send_notification rule", () => {
    const result = createAutomationRuleSchema.safeParse({
      name: "Notify on done",
      triggerType: "task_status_changed",
      toStatus: "done",
      actionType: "send_notification",
      message: "Task completed",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a minimal task_created -> create_task rule", () => {
    const result = createAutomationRuleSchema.safeParse({
      name: "Follow-up on urgent",
      triggerType: "task_created",
      priorityFilter: "urgent",
      actionType: "create_task",
      newTaskTitle: "Review urgent item",
      newTaskPriority: "high",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty rule name", () => {
    const result = createAutomationRuleSchema.safeParse({
      name: "",
      triggerType: "task_created",
      actionType: "send_notification",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown trigger type", () => {
    const result = createAutomationRuleSchema.safeParse({
      name: "Bad rule",
      triggerType: "sprint_completed",
      actionType: "send_notification",
    });
    expect(result.success).toBe(false);
  });
});
