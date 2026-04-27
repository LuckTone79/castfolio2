"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/me");
    const data = await res.json();

    if (!res.ok) {
      const msgMap: Record<string, string> = {
        NO_DB_USER: "등록되지 않은 계정입니다. 관리자에게 문의하세요.",
        SUSPENDED: "계정이 정지되었습니다. 관리자에게 문의하세요.",
        DELETED: "존재하지 않는 계정입니다.",
      };
      setError(msgMap[data.code] ?? "로그인 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    if (data.role === "MASTER_ADMIN") {
      router.push("/admin");
    } else {
      router.push(!data.userType ? "/dashboard/onboarding" : "/dashboard");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      setError("Google 로그인 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex dot-grid"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          width: 480,
          background: "linear-gradient(160deg, #0D1321 0%, #0F0A1E 100%)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: -100,
            left: -60,
            width: 400,
            height: 400,
            background: "radial-gradient(ellipse, rgba(124,92,252,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl flex items-center justify-center font-bold text-white"
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #7C5CFC, #5A3FD8)",
              boxShadow: "0 4px 16px rgba(124,92,252,0.45)",
              fontSize: "1rem",
            }}
          >
            C
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Castfolio</span>
        </div>

        {/* Feature list */}
        <div className="space-y-5 relative">
          <h2 className="font-bold text-xl mb-6 leading-snug" style={{ color: "var(--text-primary)" }}>
            방송인 PR 페이지<br />
            <span className="text-gradient-violet">전문 제작 파트너</span>를 위한<br />
            올인원 플랫폼
          </h2>
          {[
            "7가지 전문 테마, 10분 완성",
            "자료 수집부터 납품까지 원스톱",
            "QR 코드 + PDF 명함 자동 생성",
            "한·영·중 3개 언어 지원",
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div
                className="rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ width: 22, height: 22, background: "rgba(124,92,252,0.2)", color: "#A78BFA" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item}</span>
            </div>
          ))}
        </div>

        <p className="text-xs" style={{ color: "var(--text-muted)" }}>© 2026 Castfolio</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ width: 30, height: 30, background: "linear-gradient(135deg, #7C5CFC, #5A3FD8)" }}
            >
              C
            </div>
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>Castfolio</span>
          </div>

          <h1 className="font-bold text-2xl mb-1" style={{ color: "var(--text-primary)" }}>로그인</h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
            계정에 로그인하여 대시보드에 접속하세요.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-dark w-full px-4 py-3 rounded-xl text-sm"
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input-dark w-full px-4 py-3 pr-12 rounded-xl text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#FCA5A5",
                }}
              >
                <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm"
              style={{ background: loading ? "var(--accent-dim)" : "var(--accent)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  로그인 중...
                </span>
              ) : "로그인"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-6 mb-4">
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>또는</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 로그인
          </button>

          <div
            className="mt-6 pt-6 text-center space-y-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <a href="#" className="block text-sm transition-colors" style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              비밀번호를 잊으셨나요?
            </a>
            <a
              href="https://open.kakao.com/castfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm transition-colors"
              style={{ color: "#A78BFA" }}
            >
              신규 계정 문의하기 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
