"use client";

import { SideNav, type NavItem } from "./side-nav";
import { TopBar } from "./top-bar";

export interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  roleLabel?: string;
  statusLabel?: string;
  navItems: NavItem[];
  brandLabel: string;
  brandTone: "agent" | "admin";
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  roleLabel,
  statusLabel,
  navItems,
  brandLabel,
  brandTone,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950 text-white">
      <SideNav items={navItems} brandLabel={brandLabel} brandTone={brandTone} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar userName={userName} userEmail={userEmail} roleLabel={roleLabel} statusLabel={statusLabel} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
