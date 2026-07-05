"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead } from "@/app/(app)/notification-actions";
import type { NotificationRow } from "@/lib/notifications";

export function NotificationsBell({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications: NotificationRow[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as {
            id: string;
            type: string;
            title: string;
            body: string | null;
            link: string | null;
            read_at: string | null;
            created_at: string;
          };
          setNotifications((prev) => [
            {
              id: row.id,
              type: row.type,
              title: row.title,
              body: row.body,
              link: row.link,
              readAt: row.read_at,
              createdAt: row.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  function handleClick(notification: NotificationRow) {
    if (!notification.readAt) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      markNotificationRead(notification.id);
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
      >
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <a
                    href={n.link ?? "#"}
                    onClick={() => handleClick(n)}
                    className={`block px-4 py-3 text-sm hover:bg-slate-50 ${
                      n.readAt ? "text-slate-500" : "font-medium text-slate-900"
                    }`}
                  >
                    <p>{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
