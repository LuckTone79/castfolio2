"use client";

import { SideNav } from "./side-nav";
import { TopBar } from "./top-bar";

export interface DashboardShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

export function DashboardShell({ children, userName, userEmail }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <SideNav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
