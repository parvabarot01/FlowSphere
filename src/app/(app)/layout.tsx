import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";
import { getUserNotifications } from "@/lib/notifications";
import { NotificationsBell } from "@/app/(app)/notifications-bell";
import { PageTransition } from "@/components/motion/page-transition";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const notifications = await getUserNotifications();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
          FlowSphere
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/health" className="text-sm text-slate-500 hover:text-slate-900">
            Health
          </Link>
          <NotificationsBell userId={user.id} initialNotifications={notifications} />
          <form action={logout} className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{user.email}</span>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
