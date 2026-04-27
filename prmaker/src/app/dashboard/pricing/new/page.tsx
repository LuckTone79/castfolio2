"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default function NewPricingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice) { setError("이름과 기본가는 필수입니다."); return; }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined, basePrice: Number(basePrice) }),
    });

    if (res.ok) {
      router.push("/dashboard/pricing");
    } else {
      const data = await res.json();
      setError(data.error || "오류가 발생했습니다.");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-lg space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          뒤로
        </button>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>상품 추가</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-5 fade-in-1"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            상품명 <span style={{ color: "#FCA5A5" }}>*</span>
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: 기본형 PR 페이지"
            className="input-dark w-full px-4 py-3 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            설명 <span style={{ color: "var(--text-muted)" }}>(선택)</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="상품 설명을 입력하세요"
            rows={3}
            className="input-dark w-full px-4 py-3 rounded-xl text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            기본가 (원) <span style={{ color: "#FCA5A5" }}>*</span>
          </label>
          <input
            type="number"
            value={basePrice}
            onChange={e => setBasePrice(e.target.value)}
            placeholder="300000"
            min={0}
            className="input-dark w-full px-4 py-3 rounded-xl text-sm"
          />
          {Number(basePrice) > 0 && (
            <p className="text-xs mt-2 font-bold" style={{ color: "#FCD34D" }}>
              → {formatCurrency(Number(basePrice))}
            </p>
          )}
          {Number(basePrice) > 0 && Number(basePrice) < 50000 && (
            <p className="text-xs mt-1" style={{ color: "#FCA5A5" }}>
              기본가가 ₩50,000 미만입니다. 관리자에게 경고가 표시됩니다.
            </p>
          )}
        </div>

        {error && (
          <div
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#FCA5A5" }}
          >
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--accent)" }}
          >
            {submitting ? "저장 중..." : "상품 추가"}
          </button>
        </div>
      </form>
    </div>
  );
}
