"use client";

import { useFormState } from "react-dom";
import { requestReport } from "@/app/(app)/org/[slug]/projects/[projectId]/reports/actions";
import { SubmitButton } from "@/components/submit-button";

export function RequestReportForm({
  orgId,
  orgSlug,
  projectId,
  projectName,
}: {
  orgId: string;
  orgSlug: string;
  projectId: string;
  projectName: string;
}) {
  const requestWithIds = requestReport.bind(null, orgId, orgSlug, projectId, projectName);
  const [state, formAction] = useFormState(requestWithIds, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <select
        name="reportType"
        defaultValue="weekly_update"
        className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
      >
        <option value="weekly_update">Weekly update</option>
        <option value="health_score">Health score</option>
        <option value="risk_analysis">Risk analysis</option>
        <option value="dependency_graph">Dependency graph</option>
      </select>
      <SubmitButton label="Generate report" pendingLabel="Requesting..." />
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
