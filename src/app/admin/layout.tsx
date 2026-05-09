import { AccessDenied } from "@/components/common/access-denied";
import { AuthRequired } from "@/components/common/auth-required";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { NavItem } from "@/components/layout/side-nav";
import { canAccessAdmin, getCurrentUserProfile } from "@/lib/auth";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "관리자 홈", icon: "dashboard", exact: true },
  { href: "/admin/users", label: "파트너 관리", icon: "users" },
  { href: "/admin/pages", label: "전체 페이지", icon: "builder" },
  { href: "/admin/sales", label: "전체 매출", icon: "sales" },
  { href: "/admin/settlements", label: "전체 정산", icon: "settlements" },
  { href: "/admin/audit-logs", label: "감사 로그", icon: "intake" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return <AuthRequired description="관리자 페이지를 이용하려면 로그인해주세요." />;
  }

  if (!canAccessAdmin(profile)) {
    return <AccessDenied description="관리자 전용 페이지입니다." />;
  }

  return (
    <DashboardShell
      userName={profile.displayName}
      userEmail={profile.email}
      roleLabel="Admin"
      navItems={ADMIN_NAV}
      brandLabel="CastFolio Admin"
      brandTone="admin"
    >
      {children}
    </DashboardShell>
  );
}
