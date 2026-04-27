"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTalentId = searchParams.get("talentId") || "";

  const [form, setForm] = useState({
    name: "", talentId: preselectedTalentId,
    purpose: "", intakeMode: "SELF_SUBMISSION",
  });
  const [talents, setTalents] = useState<Array<{ id: string; nameKo: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/talents").then(r => r.json()).then(data => setTalents(data.talents || []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/projects", {
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
    const project = await res.json();
    router.push(`/dashboard/projects/${project.id}`);
  };

  const purposeOptions = [
    { value: "BROADCAST_SUBMISSION", label: "방송국 제출용" },
    { value: "SHOPPING_HOST", label: "쇼호스트 지원용" },
    { value: "ENTERTAINMENT", label: "엔터용" },
    { value: "OTHER", label: "기타" },
  ];

  const intakeModes = [
    { value: "SELF_SUBMISSION", label: "직접 제출", desc: "방송인이 직접 링크로 입력" },
    { value: "OPERATOR_ENTRY", label: "대행 입력", desc: "담당자가 대신 입력" },
    { value: "HYBRID", label: "혼합", desc: "일부 직접, 일부 대행" },
  ];

  return (
    <div className="max-w-2xl space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          뒤로
        </button>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>프로젝트 생성</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 space-y-5 fade-in-1"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            프로젝트명 <span style={{ color: "#FCA5A5" }}>*</span>
          </label>
          <input
            required
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="예: 김유나 아나운서 PR 페이지 제작"
            className="input-dark w-full px-4 py-3 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            방송인 <span style={{ color: "#FCA5A5" }}>*</span>
          </label>
          <select
            required
            value={form.talentId}
            onChange={e => setForm(p => ({ ...p, talentId: e.target.value }))}
            className="input-dark w-full px-4 py-3 rounded-xl text-sm"
            style={{ background: "var(--bg-elevated)" }}
          >
            <option value="">방송인을 선택하세요</option>
            {talents.map(t => <option key={t.id} value={t.id}>{t.nameKo}</option>)}
          </select>
          {talents.length === 0 && (
            <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
              <a href="/dashboard/talents/new" style={{ color: "#A78BFA" }}>방송인을 먼저 등록하세요 →</a>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
            목적 <span style={{ color: "var(--text-muted)" }}>(선택)</span>
          </label>
          <select
            value={form.purpose}
            onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))}
            className="input-dark w-full px-4 py-3 rounded-xl text-sm"
            style={{ background: "var(--bg-elevated)" }}
          >
            <option value="">선택 (선택사항)</option>
            {purposeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>자료 수집 방식</label>
          <div className="space-y-2">
            {intakeModes.map(m => (
              <label
                key={m.value}
                className="flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                style={{
                  background: form.intakeMode === m.value ? "rgba(124,92,252,0.1)" : "var(--bg-elevated)",
                  border: `1px solid ${form.intakeMode === m.value ? "rgba(124,92,252,0.35)" : "var(--border-subtle)"}`,
                }}
              >
                <input
                  type="radio" name="intakeMode" value={m.value}
                  checked={form.intakeMode === m.value}
                  onChange={e => setForm(p => ({ ...p, intakeMode: e.target.value }))}
                  className="mt-0.5" style={{ accentColor: "#7C5CFC" }}
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: form.intakeMode === m.value ? "#C4B5FD" : "var(--text-primary)" }}>
                    {m.label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{m.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#FCA5A5" }}>
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">취소</button>
          <button type="submit" disabled={loading || !form.talentId} className="btn-primary flex-1 py-2.5 rounded-xl text-sm" style={{ background: "var(--accent)" }}>
            {loading ? "생성 중..." : "프로젝트 생성"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewProjectPage() {
  return <Suspense><NewProjectForm /></Suspense>;
}
