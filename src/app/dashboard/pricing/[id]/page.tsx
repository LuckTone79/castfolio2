import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui";

export default async function PricingDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const pkg = await prisma.productPackage.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      pricingVersions: { orderBy: { versionNumber: "desc" } },
      revisionPolicy: true,
    },
  });

  if (!pkg) notFound();

  const active = pkg.pricingVersions.find((v: { isActive: boolean }) => v.isActive);

  return (
    <>
      <PageHeader
        title={pkg.name}
        description={pkg.description || undefined}
        breadcrumbs={[
          { label: "상품 관리", href: "/dashboard/pricing" },
          { label: pkg.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Pricing */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">현재 가격</h3>
          {active ? (
            <dl className="space-y-3">
              <Row label="기본 가격">{formatCurrency(active.basePrice.toString())}</Row>
              {active.promoPrice != null && <Row label="프로모션 가격">{formatCurrency(active.promoPrice.toString())}</Row>}
              <Row label="버전">v{active.versionNumber}</Row>
              <Row label="적용일">{formatDate(active.createdAt)}</Row>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">가격 미설정</p>
          )}
        </div>

        {/* Revision Policy */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">수정 정책</h3>
          {pkg.revisionPolicy ? (
            <dl className="space-y-3">
              <Row label="무료 수정 횟수">{pkg.revisionPolicy.freeRevisions}회</Row>
              <Row label="추가 수정 비용">
                {pkg.revisionPolicy.extraRevisionFee
                  ? formatCurrency(pkg.revisionPolicy.extraRevisionFee.toString())
                  : "별도 협의"}
              </Row>
            </dl>
          ) : (
            <p className="text-sm text-gray-500">수정 정책 미설정</p>
          )}
        </div>

        {/* Version History */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-base font-semibold text-white">버전 히스토리</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {pkg.pricingVersions.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">v{v.versionNumber}</span>
                  {v.isActive && <Badge color="green">활성</Badge>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{formatCurrency(v.basePrice.toString())}</p>
                  <p className="text-xs text-gray-500">{formatDate(v.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-white">{children}</dd>
    </div>
  );
}
