import { getHealthStatus } from "@/lib/health";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  ok: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
  configured: "bg-blue-100 text-blue-700",
  not_configured: "bg-slate-100 text-slate-500",
};

const STATUS_LABEL: Record<string, string> = {
  ok: "OK",
  error: "Error",
  configured: "Configured",
  not_configured: "Not configured",
};

export default async function HealthPage() {
  const services = await getHealthStatus();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">API Health</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live connection checks for Supabase, Upstash Redis, and Groq; configuration-only status for the rest
          (no free way to verify them without a live call that has side effects).
        </p>
      </div>

      <ul className="space-y-2">
        {services.map((service) => (
          <li
            key={service.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="font-medium text-slate-900">{service.name}</p>
              {service.detail && <p className="mt-0.5 text-xs text-slate-400">{service.detail}</p>}
            </div>
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${STATUS_STYLES[service.status]}`}>
              {STATUS_LABEL[service.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
