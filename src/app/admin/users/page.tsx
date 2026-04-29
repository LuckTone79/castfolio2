import { PageHeader } from "@/components/layout/page-header";
import { requireAdminProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  await requireAdminProfile();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { talents: true, projects: true, orders: true } } },
  });

  return (
    <>
      <PageHeader
        title="파트너 계정 관리"
        description="계정 상태, 역할, 고객 수, 프로젝트 수를 기준으로 파트너 운영 현황을 확인합니다."
      />

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">이름</th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">이메일</th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">역할</th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">상태</th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">방송인 고객</th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">프로젝트</th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">주문</th>
              <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">가입일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="transition hover:bg-gray-800/40">
                <td className="px-4 py-3 text-sm font-medium text-white">{user.name || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{user.role === "MASTER_ADMIN" ? "admin" : "agent"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{user.status === "ACTIVE" ? "active" : user.status === "SUSPENDED" ? "suspended" : "deleted"}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{user._count.talents}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{user._count.projects}</td>
                <td className="px-4 py-3 text-sm text-gray-400">{user._count.orders}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="py-12 text-center text-sm text-gray-500">등록된 사용자 계정이 없습니다.</p>}
      </div>
    </>
  );
}
