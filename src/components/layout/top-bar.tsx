"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";

export interface TopBarProps {
  userName?: string;
  userEmail?: string;
  roleLabel?: string;
  statusLabel?: string;
}

export function TopBar({
  userName = "사용자",
  userEmail,
  roleLabel,
  statusLabel,
}: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-800 bg-gray-950/80 px-6 backdrop-blur-sm">
      <div />
      <div className="flex items-center gap-3">
        <button
          className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
          title="알림"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Avatar name={userName} size="sm" />
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-tight text-white">{userName}</p>
              {roleLabel && (
                <span className="rounded-full border border-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-300">
                  {roleLabel}
                </span>
              )}
              {statusLabel && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                  {statusLabel}
                </span>
              )}
            </div>
            {userEmail && <p className="text-xs leading-tight text-gray-500">{userEmail}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"
          title="로그아웃"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
