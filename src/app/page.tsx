import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerList, StaggerItem } from "@/components/motion/stagger-list";

const FEATURES: { title: string; description: string; accent: string; emoji: string }[] = [
  {
    title: "AI department agents",
    description: "Every team gets an agent that drafts sprint plans and backlog suggestions on demand.",
    accent: "bg-indigo-100 text-indigo-600",
    emoji: "🤖",
  },
  {
    title: "Sprint boards & planning",
    description: "Kanban task boards, sprint planning, and assignments — no ceremony required.",
    accent: "bg-sky-100 text-sky-600",
    emoji: "📋",
  },
  {
    title: "Knowledge base",
    description: "A searchable wiki for decisions, docs, and context that used to live in someone's head.",
    accent: "bg-emerald-100 text-emerald-600",
    emoji: "📚",
  },
  {
    title: "Workflow automation",
    description: "Trigger-and-action rules that notify, assign, and follow up so nothing falls through.",
    accent: "bg-amber-100 text-amber-600",
    emoji: "⚡",
  },
  {
    title: "Approvals",
    description: "Multi-step approval chains for the decisions that need a paper trail.",
    accent: "bg-rose-100 text-rose-600",
    emoji: "✅",
  },
  {
    title: "Executive rollups",
    description: "AI-generated health scores and weekly reports instead of a status meeting.",
    accent: "bg-violet-100 text-violet-600",
    emoji: "📈",
  },
];

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute -right-32 -top-20 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl" />
      </div>

      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 pt-8">
        <span className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
            ✦
          </span>
          FlowSphere
        </span>
        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-indigo-600">
          Log in
        </Link>
      </header>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-20 px-6 pb-24 pt-16 text-center">
        <FadeIn className="flex flex-col items-center gap-6">
          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-indigo-600 shadow-sm ring-1 ring-indigo-100">
            AI-native workplace operating system
          </span>
          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-900">
            One workspace, <span className="text-indigo-600">not a stack of five</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-500">
            FlowSphere replaces the Slack + Jira + Notion + Confluence sprawl with one collaborative
            workspace — sprint planning, tasks, docs, and cross-team chat, with an AI agent for every
            department.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-600/30"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Log in
            </Link>
          </div>
        </FadeIn>

        <StaggerList as="div" className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <StaggerItem
              key={feature.title}
              as="div"
              className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg ${feature.accent}`}>
                {feature.emoji}
              </span>
              <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.description}</p>
            </StaggerItem>
          ))}
        </StaggerList>

        <p className="text-xs text-slate-400">Free to start — every service runs on a genuine free tier.</p>
      </div>
    </div>
  );
}
