import { describe, it, expect } from "vitest";
import { matchesTriggerConfig, type AutomationEvent } from "@/lib/automation/matcher";

const baseStatusEvent: AutomationEvent = {
  trigger: "task_status_changed",
  orgId: "org-1",
  projectId: "project-1",
  taskId: "task-1",
  taskTitle: "Ship it",
  toStatus: "done",
  assigneeId: "user-1",
};

const baseCreatedEvent: AutomationEvent = {
  trigger: "task_created",
  orgId: "org-1",
  projectId: "project-1",
  taskId: "task-1",
  taskTitle: "Ship it",
  priority: "urgent",
  assigneeId: "user-1",
};

describe("matchesTriggerConfig", () => {
  it("fires on every event when no filter is configured", () => {
    expect(matchesTriggerConfig({}, baseStatusEvent)).toBe(true);
    expect(matchesTriggerConfig({}, baseCreatedEvent)).toBe(true);
  });

  it("matches a task_status_changed rule scoped to the same status", () => {
    expect(matchesTriggerConfig({ to_status: "done" }, baseStatusEvent)).toBe(true);
  });

  it("does not match a task_status_changed rule scoped to a different status", () => {
    expect(matchesTriggerConfig({ to_status: "in_review" }, baseStatusEvent)).toBe(false);
  });

  it("matches a task_created rule scoped to the same priority", () => {
    expect(matchesTriggerConfig({ priority: "urgent" }, baseCreatedEvent)).toBe(true);
  });

  it("does not match a task_created rule scoped to a different priority", () => {
    expect(matchesTriggerConfig({ priority: "low" }, baseCreatedEvent)).toBe(false);
  });

  it("ignores a status filter on a task_created event (irrelevant key)", () => {
    expect(matchesTriggerConfig({ to_status: "done" }, baseCreatedEvent)).toBe(true);
  });
});
