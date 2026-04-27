"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/* SVG icon components */
const IconHome = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);
const IconMic = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0014 0M12 19v3M8 22h8"/>
  </svg>
);
const IconFolder = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
  </svg>
);
const IconInbox = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
  </svg>
);
const IconTag = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const IconReceipt = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16l2.5-1.5L9 20l2.5-1.5L14 20l2.5-1.5L19 20V8z"/>
    <path d="M14 2v6h5M16 13H8M16 17H8M10 9H8"/>
  </svg>
);
const IconWallet = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
    <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const IconHelp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9 9a3 3 0 115.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

const MENU_ITEMS = [
  { href: "/dashboard",             label: "홈",       Icon: IconHome,    exact: true },
  { href: "/dashboard/talents",     label: "방송인",   Icon: IconMic },
  { href: "/dashboard/projects",    label: "프로젝트", Icon: IconFolder },
  { href: "/dashboard/intake",      label: "자료 요청", Icon: IconInbox },
  { href: "/dashboard/pricing",     label: "상품/가격", Icon: IconTag },
  { href: "/dashboard/quotes",      label: "견적/주문", Icon: IconReceipt },
  { href: "/dashboard/settlements", label: "정산",     Icon: IconWallet },
  { href: "/dashboard/help",        label: "도움말",   Icon: IconHelp },
  { href: "/dashboard/settings",    label: "설정",     Icon: IconSettings },
];

interface DashboardSidebarProps {
  user: { name: string; email: string };
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <aside
      className="hidden md:flex flex-col h-full flex-shrink-0"
      style={{
        width: 220,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border-default)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5"
        style={{ height: 56, borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="rounded-lg flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
          style={{
            width: 26,
            height: 26,
            background: "linear-gradient(135deg, #7C5CFC 0%, #5A3FD8 100%)",
            boxShadow: "0 2px 10px rgba(124,92,252,0.4)",
          }}
        >
          C
        </div>
        <Link href="/dashboard" className="font-semibold text-sm tracking-tight" style={{ color: "var(--text-primary)" }}>
          Castfolio
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {MENU_ITEMS.map(({ href, label, Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative"
              style={{
                color: isActive ? "#C4B5FD" : "var(--text-secondary)",
                background: isActive ? "rgba(124,92,252,0.1)" : "transparent",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{ width: 3, height: 16, background: "#7C5CFC" }}
                />
              )}
              <span
                className="flex-shrink-0 transition-opacity"
                style={{ opacity: isActive ? 1 : 0.55 }}
              >
                <Icon />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-2.5 py-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1"
          style={{ background: "var(--bg-elevated)" }}
        >
          <div
            className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg, #4A36B8 0%, #7C5CFC 100%)",
              color: "#EEF2FF",
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {user.name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)", fontSize: "0.68rem" }}>
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#FCA5A5";
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <IconLogout />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};
