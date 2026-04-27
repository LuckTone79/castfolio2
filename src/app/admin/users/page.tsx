import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { talents: true, projects: true, orders: true } } },
  });

  return (
    <>
      <PageHeader title="사용자 관리" description="플랫폼 사용자를 관리합니다" />

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">이메일</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">역할</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">탤런트</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">프로젝트</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">주문</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">가입일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white">{u.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge color={u.role === "MASTER_ADMIN" ? "red" : "blue"}>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge color={u.status === "ACTIVE" ? "green" : u.status === "SUSPENDED" ? "yellow" : "red"}>
                    {u.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{u._count.talents}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{u._count.projects}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{u._count.orders}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="py-12 text-center text-gray-500 text-sm">사용자가 없습니다</p>}
      </div>
    </>
  );
}
