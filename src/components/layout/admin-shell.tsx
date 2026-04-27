"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TopBar } from "./top-bar";
import {
  LayoutDashboard, ShoppingCart, Banknote, Users, Bell, FileSearch, Settings, Shield,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "주문 모니터링", icon: ShoppingCart },
  { href: "/admin/settlements", label: "정산", icon: Banknote },
  { href: "/admin/users", label: "사용자", icon: Users },
  { href: "/admin/notifications", label: "알림", icon: Bell },
  { href: "/admin/audit", label: "감사 로그", icon: FileSearch },
  { href: "/admin/system", label: "시스템", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <aside className="w-60 flex flex-col h-screen border-r border-gray-800">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-800">
          <Shield size={20} className="text-red-400" />
          <span className="text-lg font-bold tracking-tight">Admin</span>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                )}
              >
                <item.icon size={18} className="shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar userName="Admin" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
