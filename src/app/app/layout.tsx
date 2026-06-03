import { AccessDenied } from "@/components/common/access-denied";
import { AuthRequired } from "@/components/common/auth-required";
import { SuspendedAccount } from "@/components/common/suspended-account";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import type { NavItem } from "@/components/layout/side-nav";
import { canAccessAgentApp, canWrite, getCurrentUserProfile } from "@/lib/auth";

const buildAgentNav = (writeEnabled: boolean): NavItem[] => {
  const ro = writeEnabled ? undefined : "read-only";
  return [
    { href: "/app", label: "대시보드", icon: "dashboard", exact: true },

    { label: "제작 흐름", section: true },
    { href: "/app/talents", label: "방송인 고객", icon: "users" },
    { href: "/app/intake", label: "자료 수집", icon: "intake", badge: ro },
    { href: "/app/build", label: "PR 홈페이지 제작", icon: "builder", badge: ro },
    { href: "/app/projects", label: "프로젝트", icon: "projects" },

    { label: "판매·정산", section: true },
    { href: "/app/quotes", label: "견적서", icon: "quotes", badge: ro },
    { href: "/app/orders", label: "주문 내역", icon: "orders" },
    { href: "/app/sales", label: "판매 확정", icon: "sales", badge: ro },
    { href: "/app/settlements", label: "정산 내역", icon: "settlements" },

    { label: "설정", section: true },
    { href: "/app/pricing", label: "상품·가격", icon: "pricing" },
    { href: "/app/settings", label: "내 계정", icon: "settings" },
  ];
};

export default async function AgentAppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return <AuthRequired />;
  }

  if (!canAccessAgentApp(profile)) {
    return <AccessDenied description="파트너 대시보드는 관리자 또는 파트너 계정만 접근할 수 있습니다." />;
  }

  const writeEnabled = canWrite(profile);

  return (
    <DashboardShell
      userName={profile.displayName}
      userEmail={profile.email}
      roleLabel={profile.role === "admin" ? "Admin" : "Partner"}
      statusLabel={writeEnabled ? undefined : "Suspended"}
      navItems={buildAgentNav(writeEnabled)}
      brandLabel="CastFolio Partner"
      brandTone="agent"
    >
      {!writeEnabled && <SuspendedAccount compact />}
      {children}
    </DashboardShell>
  );
}
