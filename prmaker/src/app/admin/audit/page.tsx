import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminAuditPage() {
  await requireAdmin();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
  });

  const actionColors: Record<string, string> = {
    admin_emergency_edit: "bg-red-100 text-red-700",
    PUBLISH_PAGE: "bg-green-100 text-green-700",
    CREATE_ORDER: "bg-blue-100 text-blue-700",
    CONFIRM_PAYMENT: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">감사 로그</h1>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["시각", "행위자", "액션", "대상 유형", "대상 ID"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map(log => (
              <tr key={log.id} className={`hover:bg-gray-50 ${log.action === "admin_emergency_edit" ? "bg-red-50" : ""}`}>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium">{log.actor.name}</p>
                  <p className="text-xs text-gray-400">{log.actorRole}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || "bg-gray-100 text-gray-600"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{log.targetType}</td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.targetId.slice(0, 8)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
