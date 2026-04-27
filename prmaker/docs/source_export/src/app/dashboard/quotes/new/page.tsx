"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  talent: { nameKo: string };
}

interface Package {
  id: string;
  name: string;
  pricingVersions: Array<{ basePrice: number; promoPrice: number | null; isActive: boolean }>;
}

interface LineItem {
  packageId?: string;
  description: string;
  amount: number;
  quantity: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", amount: 0, quantity: 1 }]);
  const [validDays, setValidDays] = useState(7);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/pricing").then(r => r.json()),
    ]).then(([projData, pkgData]) => {
      setProjects(projData.projects || []);
      setPackages(pkgData.packages || []);
    });
  }, []);

  const totalAmount = lineItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);

  const addPackageItem = (pkg: Package) => {
    const active = pkg.pricingVersions.find(v => v.isActive);
    if (!active) return;
    const price = active.promoPrice ?? active.basePrice;
    setLineItems(prev => [...prev, { packageId: pkg.id, description: pkg.name, amount: Number(price), quantity: 1 }]);
  };

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    setLineItems(prev => {
      const items = [...prev];
      items[i] = { ...items[i], [field]: value };
      return items;
    });
  };

  const removeItem = (i: number) => {
    setLineItems(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (send: boolean) => {
    if (!selectedProject) { setError("프로젝트를 선택하세요."); return; }
    if (lineItems.length === 0 || totalAmount === 0) { setError("라인 아이템을 입력하세요."); return; }
    setSubmitting(true);
    setError("");

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProject,
        lineItems,
        totalAmount,
        validUntil: validUntil.toISOString(),
        message: message || undefined,
        send,
        pricingSnapshot: { lineItems, totalAmount },
      }),
    });

    if (res.ok) {
      router.push("/dashboard/quotes");
    } else {
      const data = await res.json();
      setError(data.error || "오류가 발생했습니다.");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← 뒤로</button>
        <h1 className="text-2xl font-bold">견적서 생성</h1>
      </div>

      {/* Project selection */}
      <div className="bg-white border rounded-xl p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 선택 *</label>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="">프로젝트를 선택하세요</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.talent.nameKo})</option>
          ))}
        </select>
      </div>

      {/* Package shortcuts */}
      {packages.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm font-medium text-gray-700 mb-3">상품 빠른 추가</p>
          <div className="flex flex-wrap gap-2">
            {packages.filter(p => p.pricingVersions.some(v => v.isActive)).map(pkg => {
              const active = pkg.pricingVersions.find(v => v.isActive);
              const price = active ? (active.promoPrice ?? active.basePrice) : 0;
              return (
                <button
                  key={pkg.id}
                  onClick={() => addPackageItem(pkg)}
                  className="px-3 py-1.5 border rounded-lg text-xs hover:bg-gray-50 text-gray-700"
                >
                  {pkg.name} ({formatCurrency(Number(price))})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="bg-white border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">항목</p>
          <button
            onClick={() => setLineItems(prev => [...prev, { description: "", amount: 0, quantity: 1 }])}
            className="text-xs text-blue-600 hover:underline"
          >
            + 항목 추가
          </button>
        </div>
        <div className="space-y-2">
          {lineItems.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                value={item.description}
                onChange={e => updateItem(i, "description", e.target.value)}
                placeholder="항목명"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                value={item.amount || ""}
                onChange={e => updateItem(i, "amount", Number(e.target.value))}
                placeholder="금액"
                className="w-28 px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={e => updateItem(i, "quantity", Number(e.target.value))}
                min={1}
                className="w-14 px-3 py-2 border rounded-lg text-sm text-center"
              />
              <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-2 text-sm">✕</button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 pt-3 border-t">
          <div className="text-right">
            <p className="text-xs text-gray-500">합계</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">유효기간</label>
          <div className="flex gap-2">
            {[3, 7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setValidDays(d)}
                className={`flex-1 py-2 border rounded-lg text-sm ${validDays === d ? "bg-blue-50 border-blue-400 text-blue-700" : "hover:bg-gray-50"}`}
              >
                {d}일
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메시지 (선택)</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="방송인에게 전할 메시지를 입력하세요"
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm resize-y"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="flex-1 py-3 border rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          초안 저장
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={submitting}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "처리 중..." : "견적서 발송"}
        </button>
      </div>
    </div>
  );
}
