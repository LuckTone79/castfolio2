"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export const DashboardHeader: React.FC = () => {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications?unread=true&count=true")
      .then(r => r.json())
      .then(d => setUnreadCount(d.count || 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-sm text-gray-600 font-medium">
        {pathname === "/dashboard" ? "대시보드 홈" : pathname.split("/").slice(-1)[0] || "대시보드"}
      </div>

      <div className="flex items-center gap-3">
        <a href="/dashboard/notifications" className="relative p-2 rounded-full hover:bg-gray-100">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </a>
      </div>
    </header>
  );
};
