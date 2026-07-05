import { reportContentSchemas } from "@/lib/ai/report-generation";
import type { AiReportRow } from "@/lib/reports";

const REPORT_TYPE_LABEL: Record<string, string> = {
  weekly_update: "Weekly update",
  health_score: "Health score",
  risk_analysis: "Risk analysis",
  dependency_graph: "Dependency graph",
};

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function ReportCard({ report }: { report: AiReportRow }) {
  const schema = reportContentSchemas[report.reportType];
  const parsed = schema.safeParse(report.content);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-900">{REPORT_TYPE_LABEL[report.reportType] ?? report.reportType}</p>
        <span className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleString()}</span>
      </div>

      {!parsed.success && <p className="mt-2 text-sm text-slate-400">Report content is unavailable.</p>}

      {parsed.success && report.reportType === "weekly_update" && "summary" in parsed.data && (
        <div className="mt-2 space-y-2 text-sm text-slate-600">
          <p className="whitespace-pre-wrap">{parsed.data.summary}</p>
          {parsed.data.highlights.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Highlights</p>
              <ul className="list-inside list-disc">
                {parsed.data.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {parsed.data.blockers.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Blockers</p>
              <ul className="list-inside list-disc">
                {parsed.data.blockers.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {parsed.success && report.reportType === "health_score" && "score" in parsed.data && (
        <div className="mt-2 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-slate-900">{parsed.data.score}</span>
            <span className={`rounded px-1.5 py-0.5 text-xs ${SEVERITY_STYLES[parsed.data.risk_level]}`}>
              {parsed.data.risk_level} risk
            </span>
          </div>
          <p>{parsed.data.rationale}</p>
        </div>
      )}

      {parsed.success && report.reportType === "risk_analysis" && "risks" in parsed.data && (
        <ul className="mt-2 space-y-1.5">
          {parsed.data.risks.length === 0 && <p className="text-sm text-slate-400">No notable risks identified.</p>}
          {parsed.data.risks.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-2 text-sm text-slate-600">
              <span>{r.description}</span>
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${SEVERITY_STYLES[r.severity]}`}>{r.severity}</span>
            </li>
          ))}
        </ul>
      )}

      {parsed.success && report.reportType === "dependency_graph" && "nodes" in parsed.data && (() => {
        const { nodes, edges } = parsed.data;
        return (
          <div className="mt-2 text-sm text-slate-600">
            {nodes.length === 0 ? (
              <p className="text-slate-400">No dependencies inferred.</p>
            ) : (
              <ul className="space-y-1">
                {edges.map((e, i) => {
                  const fromLabel = nodes.find((n) => n.id === e.from)?.label ?? e.from;
                  const toLabel = nodes.find((n) => n.id === e.to)?.label ?? e.to;
                  return (
                    <li key={i}>
                      {fromLabel} → {toLabel}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })()}
    </div>
  );
}
