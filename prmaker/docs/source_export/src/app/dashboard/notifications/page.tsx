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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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

  const typeIcon: Record<string, string> = {
    intake_complete: "📥",
    review_requested: "🔍",
    revision_requested: "✏️",
    quote_sent: "📄",
    payment_complete: "💳",
    delivery_complete: "📦",
    settlement_complete: "💰",
    settlement_overdue: "⚠️",
    unconfirmed_30days: "⏰",
    admin_notice: "📢",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">알림</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">읽지 않은 알림 {unreadCount}개</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-blue-600 hover:underline"
          >
            모두 읽음 처리
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500">알림이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border px-5 py-4 flex gap-4 items-start transition-colors ${!n.isRead ? "border-blue-200 bg-blue-50/30" : ""}`}
            >
              <span className="text-2xl shrink-0">{typeIcon[n.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                    {n.title}
                    {!n.isRead && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full align-middle" />}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                <div className="flex items-center gap-3 mt-2">
                  {n.link && (
                    <a href={n.link} className="text-xs text-blue-600 hover:underline">
                      바로가기 →
                    </a>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      읽음 처리
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
