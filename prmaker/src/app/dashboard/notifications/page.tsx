"use client";
import { useState, useEffect, useCallback } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const typeIconMap: Record<string, JSX.Element> = {
  intake_complete: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
    </svg>
  ),
  payment_complete: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  settlement_complete: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
    </svg>
  ),
};

const defaultIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const typeColor: Record<string, string> = {
  intake_complete: "#6EE7B7",
  review_requested: "#A78BFA",
  payment_complete: "#FCD34D",
  settlement_complete: "#6EE7B7",
  settlement_overdue: "#FCA5A5",
  admin_notice: "#93C5FD",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="rounded-full border-2"
          style={{ width: 24, height: 24, borderColor: "var(--accent)", borderTopColor: "transparent", animation: "spin-slow 0.8s linear infinite" }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>알림</h1>
          {unreadCount > 0 && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              읽지 않은 알림 {unreadCount}개
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs transition-colors"
            style={{ color: "#A78BFA" }}
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          className="rounded-2xl py-20 text-center fade-in-1"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>알림이 없습니다</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>새로운 활동이 있으면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const color = typeColor[n.type] || "#8B9CC8";
            const icon = typeIconMap[n.type] || defaultIcon;
            return (
              <div
                key={n.id}
                className={`rounded-2xl px-5 py-4 flex gap-4 items-start transition-all fade-in-${Math.min(i + 1, 6)}`}
                style={{
                  background: n.isRead ? "var(--bg-surface)" : "var(--bg-elevated)",
                  border: `1px solid ${n.isRead ? "var(--border-default)" : "var(--border-strong)"}`,
                }}
              >
                {/* Icon */}
                <div
                  className="rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ width: 32, height: 32, background: `${color}18`, color }}
                >
                  {icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: "#7C5CFC" }} />
                      )}
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {new Date(n.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{n.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {n.link && (
                      <a
                        href={n.link}
                        className="text-xs font-medium transition-colors"
                        style={{ color: "#A78BFA" }}
                      >
                        바로가기 →
                      </a>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="text-xs transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        읽음 처리
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
