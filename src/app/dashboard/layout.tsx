import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let userName = "사용자";
  let userEmail = "";
  try {
    const user = await requireUser();
    userName = user.name || user.email?.split("@")[0] || "사용자";
    userEmail = user.email || "";
  } catch {
    // middleware handles redirect
  }

  return (
    <DashboardShell userName={userName} userEmail={userEmail}>
      {children}
    </DashboardShell>
  );
}
