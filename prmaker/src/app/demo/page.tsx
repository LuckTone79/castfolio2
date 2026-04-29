import Link from "next/link";
import { ALL_THEMES } from "@/themes";

export default function DemoPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 glass"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
              style={{ width: 24, height: 24, background: "linear-gradient(135deg, #7C5CFC, #5A3FD8)" }}
            >C</div>
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Castfolio</span>
          </Link>
          <Link
            href="/login"
            className="btn-primary px-4 py-1.5 rounded-lg text-xs"
            style={{ background: "var(--accent)" }}
          >
            로그인
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12 fade-in">
          <span
            className="inline-block text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(124,92,252,0.15)", color: "#A78BFA", border: "1px solid rgba(124,92,252,0.25)" }}
          >
            THEMES
          </span>
          <h1 className="font-bold text-3xl mb-3" style={{ color: "var(--text-primary)" }}>고객에게 제안할 수 있는 PR 홈페이지 샘플</h1>
          <p style={{ color: "var(--text-muted)" }}>방송인 고객의 이미지와 포지션에 맞춰 제안할 수 있는 7가지 전문 테마입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_THEMES.map((theme, i) => (
            <div
              key={theme.id}
              className={`rounded-2xl overflow-hidden card-hover fade-in-${Math.min(i + 1, 6)}`}
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              {/* Theme preview */}
              <div
                className="h-44 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: theme.colors.background }}
              >
                {/* Accent bar */}
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: 3, background: theme.colors.accent }}
                />
                <div className="text-center px-6">
                  <p style={{
                    color: theme.colors.accent,
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}>
                    {theme.recommendedFor.split(",")[0]}
                  </p>
                  <p style={{
                    color: theme.colors.text,
                    fontFamily: theme.fonts.headingKo,
                    fontSize: "22px",
                    fontWeight: 700,
                    marginBottom: 4,
                  }}>
                    KIM YUNA
                  </p>
                  <p style={{ color: theme.colors.textLight, fontSize: "11px" }}>쇼호스트 · Show Host</p>
                  <div style={{
                    marginTop: 12,
                    display: "inline-block",
                    backgroundColor: theme.colors.buttonBg,
                    color: theme.colors.buttonText,
                    padding: "5px 14px",
                    borderRadius: theme.buttonStyle === "pill" ? "9999px" : theme.buttonStyle === "rounded" ? "8px" : "2px",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}>
                    포트폴리오 보기
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{theme.nameKo}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                  >
                    {theme.backgroundStyle}
                  </span>
                </div>
                <p className="text-xs mb-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {theme.descriptionKo}
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                  추천 고객: {theme.recommendedFor}
                </p>

                <Link
                  href={`/demo/${theme.id}`}
                  className="btn-primary block w-full py-2 rounded-xl text-xs text-center"
                  style={{ background: "var(--accent)" }}
                >
                  샘플 보기
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
