import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

const ACTION_COLOR: Record<string, "blue" | "green" | "yellow" | "red"> = {
  CREATE: "green", UPDATE: "blue", DELETE: "red",
};

export default async function AuditPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <PageHeader title="감사 로그" description="시스템의 모든 변경 이력을 추적합니다" />

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">시간</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">액션</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">대상</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">수행자</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{formatDate(log.createdAt)}</td>
                <td className="px-4 py-3"><Badge color={ACTION_COLOR[log.action] || "gray"}>{log.action}</Badge></td>
                <td className="px-4 py-3 text-sm text-gray-300">{log.targetType} / {log.targetId?.slice(0, 8)}...</td>
                <td className="px-4 py-3 text-sm text-gray-400">{log.actorId?.slice(0, 8) || "system"}</td>
                <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                  {log.reason || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="py-12 text-center text-gray-500 text-sm">로그가 없습니다</p>}
      </div>
    </>
  );
}
