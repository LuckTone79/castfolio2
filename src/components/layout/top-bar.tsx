"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";

export interface TopBarProps {
  userName?: string;
  userEmail?: string;
}

export function TopBar({ userName = "사용자", userEmail }: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div /> {/* Left slot for breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          title="알림"
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <Avatar name={userName} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{userName}</p>
            {userEmail && <p className="text-xs text-gray-500 leading-tight">{userEmail}</p>}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-800"
          title="로그아웃"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
