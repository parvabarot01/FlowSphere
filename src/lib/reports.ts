import { createClient } from "@/lib/supabase/server";
import type { AiReportType, Json } from "@/lib/supabase/types";

export type AiReportRow = {
  id: string;
  reportType: AiReportType;
  content: Json;
  createdAt: string;
};

export async function getProjectReports(projectId: string): Promise<AiReportRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("ai_reports")
    .select("id, report_type, content, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((r) => ({
    id: r.id,
    reportType: r.report_type,
    content: r.content,
    createdAt: r.created_at,
  }));
}
