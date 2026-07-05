"use client";

import { motion } from "framer-motion";
import { toggleAutomationRule, deleteAutomationRule } from "@/app/(app)/org/[slug]/automation/actions";
import type { AutomationRuleSummary } from "@/lib/automation-rules";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

const TRIGGER_LABEL: Record<string, string> = {
  task_status_changed: "Task status changes",
  task_created: "Task created",
};

const ACTION_LABEL: Record<string, string> = {
  send_notification: "Notify assignee",
  create_task: "Create follow-up task",
};

export function RuleList({
  orgId,
  orgSlug,
  rules,
  canManage,
}: {
  orgId: string;
  orgSlug: string;
  rules: AutomationRuleSummary[];
  canManage: boolean;
}) {
  return (
    <StaggerList className="space-y-2">
      {rules.map((rule) => (
        <StaggerItem key={rule.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{rule.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {TRIGGER_LABEL[rule.triggerType] ?? rule.triggerType} → {ACTION_LABEL[rule.actionType] ?? rule.actionType}
                {rule.projectName ? ` · ${rule.projectName}` : " · All projects"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <motion.span
                key={rule.isActive ? "active" : "paused"}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`rounded px-1.5 py-0.5 text-xs ${
                  rule.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {rule.isActive ? "Active" : "Paused"}
              </motion.span>
              <form action={toggleAutomationRule.bind(null, orgId, orgSlug, rule.id, rule.isActive)}>
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.95 }}
                  className="text-xs text-slate-500 transition-colors hover:text-slate-900"
                >
                  {rule.isActive ? "Pause" : "Resume"}
                </motion.button>
              </form>
              {canManage && (
                <form action={deleteAutomationRule.bind(null, orgId, orgSlug, rule.id)}>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    className="text-xs text-slate-400 transition-colors hover:text-red-600"
                  >
                    Delete
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
