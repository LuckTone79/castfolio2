"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← 뒤로</button>
        <h1 className="text-2xl font-bold">상품 추가</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="예: 기본형 PR 페이지"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">설명 (선택)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="상품 설명"
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">기본가 (원) *</label>
          <input
            type="number"
            value={basePrice}
            onChange={e => setBasePrice(e.target.value)}
            placeholder="300000"
            min={0}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          {Number(basePrice) > 0 && Number(basePrice) < 50000 && (
            <p className="text-xs text-orange-500 mt-1">⚠️ 기본가가 ₩50,000 미만입니다. 관리자에게 경고가 표시됩니다.</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-2.5 border rounded-lg text-sm hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "저장 중..." : "상품 추가"}
          </button>
        </div>
      </form>
    </div>
  );
}
