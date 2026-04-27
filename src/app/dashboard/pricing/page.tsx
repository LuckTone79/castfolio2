"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, EmptyState, Badge } from "@/components/ui";
import { Package, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PricingPackage {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  activeVersion?: { basePrice: number; promoPrice: number | null } | null;
}

export default function PricingPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PricingPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pricing")
      .then((r) => r.json())
      .then((d) => setPackages(d.packages || d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="상품 관리"
        description="PR 페이지 제작 패키지를 관리합니다"
        actions={<Button onClick={() => router.push("/dashboard/pricing/new")}><Plus size={16} /> 패키지 생성</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl bg-gray-800 animate-pulse" />)}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState
          icon={Package}
          title="상품 패키지가 없습니다"
          description="견적서를 발송하려면 먼저 패키지를 만들어야 합니다"
          actionLabel="패키지 생성"
          onAction={() => router.push("/dashboard/pricing/new")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const price = pkg.activeVersion?.promoPrice ?? pkg.activeVersion?.basePrice;
            const hasPromo = pkg.activeVersion?.promoPrice != null && pkg.activeVersion.promoPrice < (pkg.activeVersion.basePrice ?? 0);
            return (
              <div
                key={pkg.id}
                onClick={() => router.push(`/dashboard/pricing/${pkg.id}`)}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-gray-700 cursor-pointer transition-colors"
              >
                <h3 className="text-lg font-semibold text-white">{pkg.name}</h3>
                {pkg.description && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{pkg.description}</p>}
                <div className="mt-4">
                  {price != null ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{formatCurrency(price)}</span>
                      {hasPromo && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(pkg.activeVersion!.basePrice)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">가격 미설정</span>
                  )}
                </div>
                {hasPromo && <Badge color="red" className="mt-2">프로모션</Badge>}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
