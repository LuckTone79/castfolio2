"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface Project { id: string; name: string; talent: { nameKo: string } }
interface Package { id: string; name: string; pricingVersions: Array<{ basePrice: number; promoPrice: number | null; isActive: boolean }> }
interface LineItem { packageId?: string; description: string; amount: number; quantity: number }

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
    setLineItems(prev => { const items = [...prev]; items[i] = { ...items[i], [field]: value }; return items; });
  };

  const removeItem = (i: number) => setLineItems(prev => prev.filter((_, idx) => idx !== i));

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
      body: JSON.stringify({ projectId: selectedProject, lineItems, totalAmount, validUntil: validUntil.toISOString(), message: message || undefined, send, pricingSnapshot: { lineItems, totalAmount } }),
    });
    if (res.ok) { router.push("/dashboard/quotes"); }
    else { const data = await res.json(); setError(data.error || "오류가 발생했습니다."); }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          뒤로
        </button>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>견적서 생성</h1>
      </div>

      {/* Project */}
      <div className="rounded-2xl p-5 fade-in-1" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
          프로젝트 선택 <span style={{ color: "#FCA5A5" }}>*</span>
        </label>
        <select
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
          className="input-dark w-full px-4 py-3 rounded-xl text-sm"
          style={{ background: "var(--bg-elevated)" }}
        >
          <option value="">프로젝트를 선택하세요</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.talent.nameKo})</option>)}
        </select>
      </div>

      {/* Package shortcuts */}
      {packages.length > 0 && (
        <div className="rounded-2xl p-5 fade-in-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>상품 빠른 추가</p>
          <div className="flex flex-wrap gap-2">
            {packages.filter(p => p.pricingVersions.some(v => v.isActive)).map(pkg => {
              const active = pkg.pricingVersions.find(v => v.isActive);
              const price = active ? (active.promoPrice ?? active.basePrice) : 0;
              return (
                <button key={pkg.id} onClick={() => addPackageItem(pkg)}
                  className="btn-ghost px-3 py-1.5 rounded-lg text-xs">
                  {pkg.name} ({formatCurrency(Number(price))})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Line items */}
      <div className="rounded-2xl p-5 fade-in-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>항목</p>
          <button
            onClick={() => setLineItems(prev => [...prev, { description: "", amount: 0, quantity: 1 }])}
            className="text-xs" style={{ color: "#A78BFA" }}
          >
            + 항목 추가
          </button>
        </div>
        <div className="space-y-2">
          {lineItems.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={item.description}
                onChange={e => updateItem(i, "description", e.target.value)}
                placeholder="항목명"
                className="input-dark flex-1 px-3 py-2.5 rounded-xl text-sm"
              />
              <input
                type="number" value={item.amount || ""}
                onChange={e => updateItem(i, "amount", Number(e.target.value))}
                placeholder="금액"
                className="input-dark w-28 px-3 py-2.5 rounded-xl text-sm"
              />
              <input
                type="number" value={item.quantity}
                onChange={e => updateItem(i, "quantity", Number(e.target.value))}
                min={1}
                className="input-dark w-14 px-3 py-2.5 rounded-xl text-sm text-center"
              />
              <button onClick={() => removeItem(i)} style={{ color: "#FCA5A5" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="text-right">
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>합계</p>
            <p className="text-xl font-bold text-gradient-amber">{formatCurrency(totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl p-5 space-y-4 fade-in-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
        <div>
          <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>유효기간</label>
          <div className="flex gap-2">
            {[3, 7, 14, 30].map(d => (
              <button key={d} onClick={() => setValidDays(d)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: validDays === d ? "rgba(124,92,252,0.15)" : "var(--bg-elevated)",
                  color: validDays === d ? "#C4B5FD" : "var(--text-muted)",
                  border: `1px solid ${validDays === d ? "rgba(124,92,252,0.3)" : "var(--border-subtle)"}`,
                }}
              >
                {d}일
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            메시지 <span style={{ color: "var(--text-muted)" }}>(선택)</span>
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="방송인에게 전할 메시지를 입력하세요"
            rows={3}
            className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#FCA5A5" }}>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => handleSubmit(false)} disabled={submitting}
          className="btn-ghost flex-1 py-3 rounded-xl text-sm font-medium">
          초안 저장
        </button>
        <button onClick={() => handleSubmit(true)} disabled={submitting}
          className="btn-primary flex-1 py-3 rounded-xl text-sm font-medium"
          style={{ background: "var(--accent)" }}>
          {submitting ? "처리 중..." : "견적서 발송"}
        </button>
      </div>
    </div>
  );
}
