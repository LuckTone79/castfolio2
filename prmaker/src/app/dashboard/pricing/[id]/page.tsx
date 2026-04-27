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
    <div className="max-w-2xl space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/pricing"
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          상품 목록
        </Link>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>{pkg.name}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pkg.isActive ? "badge-emerald" : "badge-gray"}`}>
          {pkg.isActive ? "활성" : "비활성"}
        </span>
      </div>

      {/* Current pricing */}
      <div
        className="rounded-2xl p-5 fade-in-1"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>현재 가격</p>
        {activeVersion ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>기본가</span>
              <span className="font-bold text-2xl text-gradient-amber">
                {formatCurrency(Number(activeVersion.basePrice))}
              </span>
            </div>
            {activeVersion.promoPrice && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "#FCD34D" }}>프로모션가</span>
                <span className="font-bold text-lg" style={{ color: "#FCD34D" }}>
                  {formatCurrency(Number(activeVersion.promoPrice))}
                </span>
              </div>
            )}
            {activeVersion.promoStartAt && activeVersion.promoEndAt && (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                프로모션 기간: {new Date(activeVersion.promoStartAt).toLocaleDateString("ko-KR")} ~ {new Date(activeVersion.promoEndAt).toLocaleDateString("ko-KR")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>가격 정보 없음</p>
        )}
      </div>

      {/* Revision policy */}
      {pkg.revisionPolicy && (
        <div
          className="rounded-2xl p-5 fade-in-2"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>수정 정책</p>
          <div className="space-y-2">
            {[
              { label: "무료 수정 횟수", value: `${pkg.revisionPolicy.freeRevisions}회` },
              { label: "추가 수정 단가", value: formatCurrency(Number(pkg.revisionPolicy.extraRevisionFee)) },
              { label: "수정 가능 기간", value: `납품 후 ${pkg.revisionPolicy.revisionWindowDays}일` },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>{row.label}</span>
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Version history */}
      <div
        className="rounded-2xl overflow-hidden fade-in-3"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>버전 이력</h2>
        </div>
        {pkg.pricingVersions.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>버전 이력 없음</p>
          </div>
        ) : (
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["버전", "기본가", "프로모션가", "상태"].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {pkg.pricingVersions.map(v => (
                <tr key={v.id}>
                  <td style={{ color: "var(--text-muted)" }}>v{v.versionNumber}</td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{formatCurrency(Number(v.basePrice))}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{v.promoPrice ? formatCurrency(Number(v.promoPrice)) : "—"}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.isActive ? "badge-emerald" : "badge-gray"}`}>
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
        <div
          className="rounded-2xl overflow-hidden fade-in-4"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>변경 이력</h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {pkg.pricingLogs.map(log => (
              <div key={log.id} className="flex justify-between px-5 py-3 text-xs">
                <span style={{ color: "var(--text-secondary)" }}>{log.field}: {log.oldValue} → {log.newValue}</span>
                <span style={{ color: "var(--text-muted)" }}>{new Date(log.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
