"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Input, Textarea, FormField, Select } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";

interface Project { id: string; name: string; talent: { nameKo: string } }
interface PricingPkg { id: string; name: string; activeVersion?: { basePrice: number } | null }

export default function NewQuotePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [packages, setPackages] = useState<PricingPkg[]>([]);
  const [form, setForm] = useState({ projectId: "", message: "", lineItems: [] as { packageId: string; description: string; amount: number; quantity: number }[] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.json()),
      fetch("/api/pricing").then((r) => r.json()),
    ]).then(([pData, pkData]) => {
      setProjects(pData.projects || pData);
      setPackages(pkData.packages || pkData);
    });
  }, []);

  const total = form.lineItems.reduce((s, li) => s + li.amount * li.quantity, 0);

  const addLine = (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (!pkg) return;
    setForm({
      ...form,
      lineItems: [...form.lineItems, {
        packageId: pkg.id,
        description: pkg.name,
        amount: pkg.activeVersion?.basePrice || 0,
        quantity: 1,
      }],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectId || form.lineItems.length === 0) { setError("프로젝트와 항목을 선택하세요"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, totalAmount: total, send: false }),
    });
    if (!res.ok) { setError("생성 실패"); setLoading(false); return; }
    router.push("/dashboard/quotes");
  };

  return (
    <>
      <PageHeader
        title="견적서 작성"
        breadcrumbs={[{ label: "견적서", href: "/dashboard/quotes" }, { label: "새 견적서" }]}
      />
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="프로젝트" required>
            <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
              <option value="">프로젝트 선택</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.talent.nameKo})</option>)}
            </Select>
          </FormField>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">항목</span>
              <Select className="w-48" value="" onChange={(e) => { if (e.target.value) addLine(e.target.value); }}>
                <option value="">패키지 추가</option>
                {packages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
            {form.lineItems.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-700 rounded-lg">
                패키지를 추가하세요
              </p>
            ) : (
              <div className="space-y-2">
                {form.lineItems.map((li, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="flex-1 text-sm text-white">{li.description}</span>
                    <Input
                      type="number"
                      className="w-28"
                      value={li.amount}
                      onChange={(e) => {
                        const items = [...form.lineItems];
                        items[i] = { ...items[i], amount: Number(e.target.value) };
                        setForm({ ...form, lineItems: items });
                      }}
                    />
                    <span className="text-sm text-gray-500">× {li.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, lineItems: form.lineItems.filter((_, j) => j !== i) })}
                      className="text-gray-500 hover:text-red-400 text-sm"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <div className="flex justify-end px-3 py-2">
                  <span className="text-base font-bold text-white">합계: {formatCurrency(total)}</span>
                </div>
              </div>
            )}
          </div>

          <FormField label="메모 (선택)">
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="견적서에 포함할 메시지" />
          </FormField>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>취소</Button>
            <Button type="submit" loading={loading}>견적서 생성</Button>
          </div>
        </form>
      </div>
    </>
  );
}
