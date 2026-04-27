import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface Props { params: { id: string } }

export default async function PricingDetailPage({ params }: Props) {
  const user = await requireUser();

  const pkg = await prisma.productPackage.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      pricingVersions: { orderBy: { versionNumber: "desc" } },
      revisionPolicy: true,
      pricingLogs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!pkg) notFound();

  const activeVersion = pkg.pricingVersions.find(v => v.isActive);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/pricing" className="text-gray-400 hover:text-gray-600 text-sm">← 상품 목록</Link>
        <h1 className="text-2xl font-bold">{pkg.name}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {pkg.isActive ? "활성" : "비활성"}
        </span>
      </div>

      {/* Current pricing */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-4">현재 가격</h2>
        {activeVersion ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">기본가</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(Number(activeVersion.basePrice))}</span>
            </div>
            {activeVersion.promoPrice && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-orange-500">프로모션가</span>
                <span className="text-xl font-bold text-orange-500">{formatCurrency(Number(activeVersion.promoPrice))}</span>
              </div>
            )}
            {activeVersion.promoStartAt && activeVersion.promoEndAt && (
              <p className="text-xs text-gray-400">
                프로모션 기간: {new Date(activeVersion.promoStartAt).toLocaleDateString("ko-KR")} ~ {new Date(activeVersion.promoEndAt).toLocaleDateString("ko-KR")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">가격 정보 없음</p>
        )}
      </div>

      {/* Revision policy */}
      {pkg.revisionPolicy && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-3">수정 정책</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">무료 수정 횟수</span>
              <span>{pkg.revisionPolicy.freeRevisions}회</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">추가 수정 단가</span>
              <span>{formatCurrency(Number(pkg.revisionPolicy.extraRevisionFee))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">수정 가능 기간</span>
              <span>납품 후 {pkg.revisionPolicy.revisionWindowDays}일</span>
            </div>
          </div>
        </div>
      )}

      {/* Version history */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="text-sm font-medium text-gray-700 mb-3">버전 이력</h2>
        {pkg.pricingVersions.length === 0 ? (
          <p className="text-sm text-gray-400">버전 이력 없음</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">버전</th>
                <th className="pb-2">기본가</th>
                <th className="pb-2">프로모션가</th>
                <th className="pb-2">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pkg.pricingVersions.map(v => (
                <tr key={v.id}>
                  <td className="py-2">v{v.versionNumber}</td>
                  <td className="py-2">{formatCurrency(Number(v.basePrice))}</td>
                  <td className="py-2">{v.promoPrice ? formatCurrency(Number(v.promoPrice)) : "-"}</td>
                  <td className="py-2">
                    <span className={`${v.isActive ? "text-green-600 font-medium" : "text-gray-400"}`}>
                      {v.isActive ? "활성" : "비활성"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Change log */}
      {pkg.pricingLogs.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-3">변경 이력</h2>
          <div className="space-y-2">
            {pkg.pricingLogs.map(log => (
              <div key={log.id} className="flex justify-between text-xs text-gray-600 py-1 border-b last:border-0">
                <span>{log.field}: {log.oldValue} → {log.newValue}</span>
                <span className="text-gray-400">{new Date(log.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
