import { FileInput, LayoutDashboard, ReceiptText, SquarePen, Users, Wallet } from "lucide-react";
import { AccessDenied } from "@/components/common/access-denied";
import { AuthRequired } from "@/components/common/auth-required";
import { SuspendedAccount } from "@/components/common/suspended-account";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { canAccessAgentApp, canWrite, getCurrentUserProfile } from "@/lib/auth";

const buildAgentNav = (writeEnabled: boolean) => [
  { href: "/app", label: "대시보드", icon: LayoutDashboard, exact: true },
  { href: "/app/talents", label: "방송인 고객", icon: Users },
  { href: "/app/intake", label: "자료 수집", icon: FileInput, badge: writeEnabled ? undefined : "read-only" },
  { href: "/app/sales", label: "판매 관리", icon: ReceiptText, badge: writeEnabled ? undefined : "read-only" },
  { href: "/app/settlements", label: "정산 내역", icon: Wallet },
  { href: undefined, label: "PR 빌더는 고객 상세에서 진입", icon: SquarePen, badge: "info" },
];

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
