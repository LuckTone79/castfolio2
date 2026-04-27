"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  ShoppingCart,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/talents", label: "탤런트", icon: Users },
  { href: "/dashboard/projects", label: "프로젝트", icon: FolderKanban },
  { href: "/dashboard/quotes", label: "견적서", icon: FileText },
  { href: "/dashboard/orders", label: "주문", icon: ShoppingCart },
  { href: "/dashboard/pricing", label: "상품 관리", icon: Package },
  { href: "/dashboard/settings", label: "설정", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gray-950 border-r border-gray-800 transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-gray-800">
        <Sparkles size={22} className="text-white shrink-0" />
        {!collapsed && <span className="text-lg font-bold text-white tracking-tight">Castfolio</span>}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-gray-800 text-gray-500 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
