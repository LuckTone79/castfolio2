import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { projects: true, orders: true } },
    },
  });

  const userRevenues = await prisma.order.groupBy({
    by: ["userId"],
    where: { status: { in: ["PAID", "DELIVERED", "SETTLED"] } },
    _sum: { totalAmount: true },
  });

  const revenueMap = Object.fromEntries(userRevenues.map(r => [r.userId, Number(r._sum.totalAmount || 0)]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <Link href="/admin/users/new" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          + 사용자 생성
        </Link>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["이름/이메일", "유형", "프로젝트", "총 매출", "수수료율", "상태", "가입일", "액션"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-gray-400 text-xs">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.userType || "-"}</td>
                <td className="px-4 py-3">{u._count.projects}</td>
                <td className="px-4 py-3">{formatCurrency(revenueMap[u.id] || 0)}</td>
                <td className="px-4 py-3">{(Number(u.commissionRate) * 100).toFixed(0)}%</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString("ko-KR")}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="text-blue-600 hover:underline text-xs">상세</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
