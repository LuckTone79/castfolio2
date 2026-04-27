"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTalentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nameKo: "", nameEn: "", nameCn: "",
    position: "", email: "", phone: "", kakaoId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const positions = ["아나운서", "쇼호스트", "MC", "리포터", "기타"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/talents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "오류가 발생했습니다");
      setLoading(false);
      return;
    }
    const talent = await res.json();
    router.push(`/dashboard/talents/${talent.id}`);
  };

  return (
    <div className="max-w-2xl space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          뒤로
        </button>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>방송인 등록</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-5 fade-in-1"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              이름 (한글) <span style={{ color: "#FCA5A5" }}>*</span>
            </label>
            <input required value={form.nameKo} onChange={e => setForm(p => ({ ...p, nameKo: e.target.value }))}
              placeholder="홍길동" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              이름 (영문) <span style={{ color: "#FCA5A5" }}>*</span>
            </label>
            <input required value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))}
              placeholder="Hong Gildong" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            이름 (중문) <span style={{ color: "var(--text-muted)" }}>(선택)</span>
          </label>
          <input value={form.nameCn} onChange={e => setForm(p => ({ ...p, nameCn: e.target.value }))}
            placeholder="洪吉童" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            포지션 <span style={{ color: "#FCA5A5" }}>*</span>
          </label>
          <select required value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))}
            className="input-dark w-full px-4 py-3 rounded-xl text-sm" style={{ background: "var(--bg-elevated)" }}>
            <option value="">선택해주세요</option>
            {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>이메일</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="talent@email.com" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>전화번호</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="010-0000-0000" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>카카오톡 ID</label>
          <input value={form.kakaoId} onChange={e => setForm(p => ({ ...p, kakaoId: e.target.value }))}
            placeholder="kakao_id" className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#FCA5A5" }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">취소</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 rounded-xl text-sm" style={{ background: "var(--accent)" }}>
            {loading ? "저장 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
