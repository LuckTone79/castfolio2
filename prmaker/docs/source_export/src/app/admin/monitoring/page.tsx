import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminMonitoringPage() {
  await requireAdmin();

  // Fetch all projects with page info
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      talent: { select: { nameKo: true } },
      page: { select: { id: true, status: true, slug: true, previewToken: true, publishedAt: true, createdAt: true } },
      orders: { select: { status: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 100,
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 30일 미확정 경고 (PREVIEW + PAID Order 없음 + 30일 경과)
  const unconfirmed = projects.filter(p => {
    const page = p.page;
    if (!page || page.status !== "PREVIEW") return false;
    const hasPaid = p.orders.some(o => o.status === "PAID" || o.status === "DELIVERED" || o.status === "SETTLED");
    const isOld = page.createdAt < thirtyDaysAgo;
    return !hasPaid && isOld;
  });

  // RiskFlags
  const riskFlags = await prisma.riskFlag.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const pageStatusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PREVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    INACTIVE: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">프로젝트 모니터링</h1>

      {/* 30일 미확정 경고 */}
      {unconfirmed.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-orange-700">⏰ 30일 미확정 경고 ({unconfirmed.length}건)</h2>
          <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-orange-100 border-b border-orange-200">
                <tr>
                  {["담당자", "방송인", "프로젝트명", "Preview 생성일", "액션"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-orange-800">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {unconfirmed.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-700">{p.user.name}</td>
                    <td className="px-4 py-3 text-gray-700">{p.talent.nameKo}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {p.page ? new Date(p.page.createdAt).toLocaleDateString("ko-KR") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/projects/${p.id}`} className="text-blue-600 hover:underline text-xs">
                        확인
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Risk Flags */}
      {riskFlags.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 text-red-700">🚩 위험 플래그 ({riskFlags.length}건)</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["프로젝트", "유형", "심각도", "내용", "발생일"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {riskFlags.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-xs font-mono">{f.targetId.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-600">{f.targetType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.severity === "high" ? "bg-red-100 text-red-700" :
                        f.severity === "medium" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {f.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{f.reason}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(f.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* All projects */}
      <section>
        <h2 className="text-lg font-semibold mb-3">전체 프로젝트</h2>
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["담당자", "방송인", "프로젝트명", "페이지 상태", "주문 상태", "수정일"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map(p => {
                const pageStatus = p.page?.status || "없음";
                const orderStatus = p.orders[0]?.status;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{p.user.name}</td>
                    <td className="px-4 py-3 text-gray-700">{p.talent.nameKo}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pageStatusColors[pageStatus] || "bg-gray-100 text-gray-500"}`}>
                        {pageStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {orderStatus ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {orderStatus}
                        </span>
                      ) : <span className="text-gray-400 text-xs">-</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.updatedAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
