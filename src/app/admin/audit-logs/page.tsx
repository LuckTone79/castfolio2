import { PageHeader } from "@/components/layout/page-header";
import { requireAdminProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminAuditLogsPage() {
  await requireAdminProfile();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { actor: true },
  });

  return (
    <>
      <PageHeader
        title="감사 로그"
        description="주요 수정, 삭제, 판매 확정, 정산 처리 기록을 확인하는 공간입니다."
      />

      <div className="rounded-2xl border border-gray-800 bg-gray-900">
        {logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">기록된 감사 로그가 없습니다.</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-5">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {log.action} · {log.targetType}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {log.actor.name} ({log.actorRole}) · target {log.targetId}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                </div>
                {log.reason && <p className="mt-3 text-sm leading-7 text-gray-400">{log.reason}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
