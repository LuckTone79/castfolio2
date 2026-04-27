import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export default async function PricingPage() {
  const user = await requireUser();
  const packages = await prisma.productPackage.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
    include: {
      pricingVersions: { where: { isActive: true }, orderBy: { versionNumber: "desc" }, take: 1 },
      revisionPolicy: true,
    },
  });

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>상품/가격 관리</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>총 {packages.length}개 상품</p>
        </div>
        <Link
          href="/dashboard/pricing/new"
          className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--accent)" }}
        >
          <PlusIcon /> 상품 추가
        </Link>
      </div>

      {packages.length === 0 ? (
        <div
          className="rounded-2xl py-20 text-center fade-in-1"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>등록된 상품이 없습니다</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>견적서에 사용할 상품과 가격을 먼저 등록하세요.</p>
          <Link
            href="/dashboard/pricing/new"
            className="btn-primary inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--accent)" }}
          >
            <PlusIcon /> 첫 상품 추가
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg, i) => {
            const activeVersion = pkg.pricingVersions[0];
            return (
              <Link
                key={pkg.id}
                href={`/dashboard/pricing/${pkg.id}`}
                className={`rounded-2xl p-5 card-hover block fade-in-${Math.min(i + 1, 6)}`}
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{pkg.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${pkg.isActive ? "badge-emerald" : "badge-gray"}`}>
                    {pkg.isActive ? "활성" : "비활성"}
                  </span>
                </div>
                {pkg.description && (
                  <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {pkg.description}
                  </p>
                )}
                {activeVersion && (
                  <div className="mt-auto">
                    <p className="font-bold text-xl text-gradient-amber">
                      {formatCurrency(Number(activeVersion.basePrice))}
                    </p>
                    {activeVersion.promoPrice && (
                      <p className="text-xs mt-1" style={{ color: "#FCD34D" }}>
                        프로모션: {formatCurrency(Number(activeVersion.promoPrice))}
                      </p>
                    )}
                    {pkg.revisionPolicy && (
                      <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                        무료 수정 {pkg.revisionPolicy.freeRevisions}회
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
