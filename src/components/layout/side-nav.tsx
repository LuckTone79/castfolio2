"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string;
}

interface SideNavProps {
  items: NavItem[];
  brandLabel: string;
  brandTone: "agent" | "admin";
}

export function SideNav({ items, brandLabel, brandTone }: SideNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const BrandIcon = brandTone === "admin" ? Shield : Sparkles;

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-gray-800 bg-gray-950 transition-all duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-gray-800 px-4">
        <BrandIcon size={22} className={cn("shrink-0", brandTone === "admin" ? "text-red-400" : "text-white")} />
        {!collapsed && <span className="text-lg font-bold tracking-tight text-white">{brandLabel}</span>}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {items.map((item) => {
          const active = item.href
            ? item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            : false;

          const content = (
            <>
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </>
          );

          const className = cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white",
            collapsed && "justify-center px-0",
            !item.href && "cursor-default opacity-60",
          );

          if (!item.href) {
            return (
              <div key={item.label} className={className} title={collapsed ? item.label : undefined}>
                {content}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className} title={collapsed ? item.label : undefined}>
              {content}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((current) => !current)}
        className="flex h-10 items-center justify-center border-t border-gray-800 text-gray-500 transition-colors hover:text-white"
        aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
