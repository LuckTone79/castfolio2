import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/login");
  if (user.status === "SUSPENDED") redirect("/login?error=suspended");
  if (user.role === "MASTER_ADMIN") redirect("/admin");
  if (!user.userType) redirect("/dashboard/onboarding");

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar user={{ name: user.name, email: user.email }} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
