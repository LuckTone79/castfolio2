"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const MENU = [
  { href: "/admin", label: "대시보드", icon: "🏠", exact: true },
  { href: "/admin/users", label: "사용자 관리", icon: "👥" },
  { href: "/admin/monitoring", label: "프로젝트 모니터링", icon: "👁️" },
  { href: "/admin/orders", label: "주문/정산", icon: "💳" },
  { href: "/admin/refunds", label: "환불 관리", icon: "↩️" },
  { href: "/admin/audit", label: "감사 로그", icon: "📋" },
  { href: "/admin/notifications", label: "공지/알림", icon: "🔔" },
  { href: "/admin/system", label: "시스템 설정", icon: "⚙️" },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-60 bg-gray-900 text-white h-full">
      <div className="px-4 py-5 border-b border-gray-700">
        <p className="text-lg font-bold">Castfolio Admin</p>
        <p className="text-xs text-gray-400 mt-1">Master Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {MENU.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700">
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 w-full rounded-lg transition-colors">
          <span>🚪</span><span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
};
