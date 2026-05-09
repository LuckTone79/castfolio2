"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "파트너 대시보드",
  "/dashboard/talents": "방송인 관리",
  "/dashboard/projects": "제작 프로젝트",
  "/dashboard/intake": "자료 수집 관리",
  "/dashboard/pricing": "판매 메뉴",
  "/dashboard/quotes": "판매 메뉴",
  "/dashboard/settlements": "매출 및 정산",
  "/dashboard/help": "파트너 운영 가이드",
  "/dashboard/settings": "결제 설정",
  "/dashboard/notifications": "알림",
};

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export const DashboardHeader: React.FC = () => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications?unread=true&count=true")
      .then((response) => response.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => {});
  }, [pathname]);

  const label =
    PAGE_LABELS[pathname] ??
    Object.entries(PAGE_LABELS).find(([key]) => pathname.startsWith(key) && key !== "/dashboard")?.[1] ??
    "파트너 대시보드";

  return (
    <header
      className="flex items-center justify-between px-6 flex-shrink-0"
      style={{ height: 56, background: "var(--bg-surface)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/notifications"
          className="relative flex items-center justify-center rounded-lg transition-all"
          style={{ width: 34, height: 34, color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white font-bold"
              style={{ minWidth: 16, height: 16, fontSize: "0.6rem", background: "var(--accent-red)", padding: "0 3px" }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
