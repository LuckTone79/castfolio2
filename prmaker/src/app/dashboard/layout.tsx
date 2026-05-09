import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentDbUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headerStore = headers();
  const pathname = headerStore.get("x-matched-path") ?? headerStore.get("x-pathname") ?? "";
  const isOnboardingRoute = pathname === "/dashboard/onboarding";
  const user = await getCurrentDbUser();
  if (!user) redirect("/login");
  if (user.status === "SUSPENDED") redirect("/login?error=suspended");
  if (user.role === "MASTER_ADMIN") redirect("/admin");
  if (!user.userType && !isOnboardingRoute) redirect("/dashboard/onboarding");

  return (
    <div className="flex h-screen" style={{ background: "var(--bg-base)" }}>
      <DashboardSidebar user={{ name: user.name, email: user.email, userType: user.userType ?? undefined }} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        {/* pb-16 on mobile to account for bottom nav height */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6" style={{ background: "var(--bg-base)" }}>
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
