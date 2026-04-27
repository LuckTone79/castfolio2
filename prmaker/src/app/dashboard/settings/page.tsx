"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<{
    name: string; email: string; phone?: string; company?: string; userType?: string;
  } | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", company: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      setUser(d);
      setForm({ name: d.name || "", phone: d.phone || "", company: d.company || "" });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="shimmer rounded-xl h-16 w-full" />
        ))}
      </div>
    );
  }

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();
  const userTypeLabels: Record<string, string> = {
    INDIVIDUAL: "개인",
    SOLE_PROPRIETOR: "개인사업자",
    CORPORATION: "법인",
  };

  const fields = [
    { key: "name",    label: "이름",   placeholder: "홍길동",           type: "text" },
    { key: "phone",   label: "전화번호", placeholder: "010-0000-0000",  type: "tel" },
    { key: "company", label: "회사명",  placeholder: "Castfolio 미디어", type: "text" },
  ];

  return (
    <div className="max-w-xl space-y-5 fade-in">
      <div>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>설정</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>계정 정보를 관리하세요.</p>
      </div>

      {/* Profile card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className="rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
            style={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, #4A36B8, #7C5CFC)",
              color: "#EEF2FF",
            }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{user.name}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            {user.userType && (
              <span className="badge-violet inline-block text-xs px-2 py-0.5 rounded-full mt-1">
                {userTypeLabels[user.userType] ?? user.userType}
              </span>
            )}
          </div>
        </div>

        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          프로필 수정
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="input-dark w-full px-4 py-2.5 rounded-xl text-sm"
              />
            </div>
          ))}

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
              이메일
            </label>
            <input
              value={user.email}
              disabled
              className="input-dark w-full px-4 py-2.5 rounded-xl text-sm opacity-50 cursor-not-allowed"
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              이메일은 변경할 수 없습니다.
            </p>
          </div>

          {/* Success */}
          {success && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#6EE7B7",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              저장되었습니다.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2.5 rounded-xl text-sm w-full"
            style={{ background: loading ? "var(--accent-dim)" : "var(--accent)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                </svg>
                저장 중...
              </span>
            ) : "저장"}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-secondary)" }}>계정 정보</h2>
        <div className="space-y-3">
          {[
            { label: "플랫폼 수수료", value: "15%" },
            { label: "정산 주기",    value: "매월 1일" },
            { label: "최소 정산",    value: "₩10,000" },
          ].map(item => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg"
              style={{ background: "var(--bg-elevated)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
