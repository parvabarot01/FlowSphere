import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrgCalendarData, type CalendarTask } from "@/lib/calendar";

const PRIORITY_DOT: Record<CalendarTask["priority"], string> = {
  low: "bg-slate-400",
  medium: "bg-blue-500",
  high: "bg-amber-500",
  urgent: "bg-red-500",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function CalendarPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { month?: string };
}) {
  const supabase = createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!org) {
    notFound();
  }

  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [yearStr, monthStr] = (searchParams.month ?? defaultMonth).split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  const { tasks, sprints } = await getOrgCalendarData(org.id, monthStart, monthEnd);

  const tasksByDay = new Map<string, CalendarTask[]>();
  for (const task of tasks) {
    tasksByDay.set(task.dueDate, [...(tasksByDay.get(task.dueDate) ?? []), task]);
  }

  const weeks = getMonthGrid(year, month);
  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);
  const prevParam = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextParam = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{monthLabel}</h1>
        <div className="flex gap-2">
          <Link
            href={`/org/${org.slug}/calendar?month=${prevParam}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            ← Prev
          </Link>
          <Link
            href={`/org/${org.slug}/calendar?month=${nextParam}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100"
          >
            Next →
          </Link>
        </div>
      </div>

      {sprints.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {sprints.map((s) => (
            <span key={s.id} className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
              {s.name}: {s.startDate ? new Date(s.startDate).toLocaleDateString() : "?"} →{" "}
              {s.endDate ? new Date(s.endDate).toLocaleDateString() : "?"}
            </span>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase text-slate-500">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {weeks.flatMap((week, wi) =>
            week.map((day, di) => {
              const key = day ? toDateKey(day) : `blank-${wi}-${di}`;
              const dayTasks = day ? tasksByDay.get(toDateKey(day)) ?? [] : [];
              return (
                <div key={key} className="min-h-24 border-b border-r border-slate-100 p-1.5 last:border-r-0">
                  {day && (
                    <>
                      <p className="text-xs text-slate-400">{day.getDate()}</p>
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 3).map((task) => (
                          <p key={task.id} className="flex items-center gap-1 truncate text-xs text-slate-700">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[task.priority]}`} />
                            {task.title}
                          </p>
                        ))}
                        {dayTasks.length > 3 && (
                          <p className="text-xs text-slate-400">+{dayTasks.length - 3} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
