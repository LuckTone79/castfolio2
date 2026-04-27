import Link from "next/link";

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16l2.5-1.5L9 20l2.5-1.5L14 20l2.5-1.5L19 20V8z"/>
        <path d="M14 2v6h5M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    title: "자료 수집",
    desc: "방송인이 직접 제출하거나 담당자가 대행 입력",
    color: "#7C5CFC",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    title: "PR 페이지 제작",
    desc: "7가지 전문 테마로 10분 만에 완성",
    color: "#06B6D4",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: "미리보기 검토",
    desc: "토큰 기반 검토 링크로 방송인과 소통",
    color: "#10B981",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <path d="M2 10h20"/>
        <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    title: "견적 & 결제",
    desc: "자동 견적서 발송 및 결제 안내",
    color: "#F59E0B",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M3 9h18M9 21V9M12 6v1M16 6v1"/>
      </svg>
    ),
    title: "QR 납품",
    desc: "고해상도 QR 코드 + PDF 명함 자동 생성",
    color: "#EC4899",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    title: "월 정산",
    desc: "15% 수수료, 매월 1일 자동 정산",
    color: "#8B5CF6",
  },
];

const steps = [
  { num: "01", title: "방송인 등록",    desc: "이름, 포지션, 연락처 입력" },
  { num: "02", title: "자료 수집",      desc: "제출 링크 발송 또는 직접 입력" },
  { num: "03", title: "PR 페이지 제작", desc: "테마 선택 후 빌더로 편집" },
  { num: "04", title: "검토 & 결제",   desc: "미리보기 확인 후 견적 발송" },
  { num: "05", title: "배포 & 납품",   desc: "공개 링크 + QR 코드 전달" },
  { num: "06", title: "월 정산",        desc: "수익 85% 익월 1일 정산" },
];

const faqs = [
  { q: "방송인이 직접 사용하는 서비스인가요?", a: "아닙니다. Castfolio는 방송인 PR 페이지를 제작·납품하는 에이전트(제작 파트너)를 위한 B2B SaaS입니다." },
  { q: "테마는 몇 가지인가요?", a: "7가지 전문 테마(앵커 클린, 프레스티지 블랙, 럭스 마블, 프레시 스카이, 소프트 블러시, 내추럴 그린, 웜 코랄)를 제공합니다." },
  { q: "결제는 어떻게 이루어지나요?", a: "현재 MVP에서는 오프라인 결제를 지원합니다. 담당자가 직접 결제를 안내하고 확인합니다." },
  { q: "수수료는 얼마인가요?", a: "기본 수수료는 15%입니다. 우수 파트너에게는 할인 혜택이 제공됩니다." },
  { q: "다국어 지원이 되나요?", a: "한국어/영어/중국어 3개 언어를 지원합니다. 공개 PR 페이지에서 언어 전환이 가능합니다." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* ─── Ambient glow ─── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 600,
          background: "radial-gradient(ellipse, rgba(124,92,252,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ─── Header ─── */}
      <header
        className="glass fixed top-0 left-0 right-0 z-50"
        style={{ borderBottom: "1px solid var(--border-subtle)", height: 60 }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-lg flex items-center justify-center font-bold text-sm text-white"
              style={{
                width: 28,
                height: 28,
                background: "linear-gradient(135deg, #7C5CFC 0%, #5A3FD8 100%)",
                boxShadow: "0 2px 10px rgba(124,92,252,0.4)",
              }}
            >
              C
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
              Castfolio
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/guide" className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              기능 가이드
            </Link>
            <Link href="/demo" className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              데모
            </Link>
          </nav>

          <Link
            href="/login"
            className="btn-primary px-4 py-2 rounded-lg text-sm"
            style={{ background: "var(--accent)" }}
          >
            로그인
          </Link>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section
        className="relative dot-grid"
        style={{ paddingTop: 140, paddingBottom: 100, zIndex: 1 }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(124,92,252,0.12)",
              border: "1px solid rgba(124,92,252,0.25)",
              color: "#A78BFA",
              letterSpacing: "0.06em",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#7C5CFC", boxShadow: "0 0 6px #7C5CFC" }}
            />
            방송인 PR 페이지 빌더 · B2B SaaS
          </div>

          <h1
            className="font-bold leading-tight mb-6"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "var(--text-primary)" }}
          >
            방송인 PR 페이지를<br />
            <span className="text-gradient-violet">10분 만에 완성</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-10 mx-auto"
            style={{ maxWidth: 520, color: "var(--text-secondary)" }}
          >
            아나운서, 쇼호스트, MC, 리포터를 위한 전문 PR 페이지.<br />
            자료 수집부터 납품, 정산까지 원스톱으로 처리하세요.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/demo"
              className="btn-ghost px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              데모 보기
              <ArrowRight />
            </Link>
            <Link
              href="/login"
              className="btn-primary px-7 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: "var(--accent)" }}
            >
              무료로 시작하기
              <ArrowRight />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
            {[
              "7가지 전문 테마",
              "3개 언어 지원 (한·영·중)",
              "QR · PDF 자동 생성",
              "월 정산 85%",
            ].map(badge => (
              <div key={badge} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <span style={{ color: "var(--accent-emerald)" }}>
                  <CheckIcon />
                </span>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="relative py-24" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              핵심 기능
            </p>
            <h2 className="font-bold text-2xl md:text-3xl" style={{ color: "var(--text-primary)" }}>
              제작부터 납품까지 모든 것
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div
                key={f.title}
                className="card-hover rounded-2xl p-6"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div
                  className="rounded-xl flex items-center justify-center mb-4"
                  style={{
                    width: 40,
                    height: 40,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}28`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1.5 text-sm" style={{ color: "var(--text-primary)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Workflow Steps ─── */}
      <section className="py-24 relative" style={{ zIndex: 1 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, transparent, rgba(124,92,252,0.04), transparent)",
            pointerEvents: "none",
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              워크플로우
            </p>
            <h2 className="font-bold text-2xl md:text-3xl" style={{ color: "var(--text-primary)" }}>
              6단계 원스톱 프로세스
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                <div
                  className="font-mono font-bold text-xs mb-3"
                  style={{ color: "#7C5CFC", letterSpacing: "0.08em" }}
                >
                  {s.num}
                </div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="py-24" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              수수료 구조
            </p>
            <h2 className="font-bold text-2xl md:text-3xl" style={{ color: "var(--text-primary)" }}>
              성과 기반, 월정액 없음
            </h2>
          </div>

          <div
            className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(124,92,252,0.18) 0%, rgba(90,63,216,0.08) 100%)",
              border: "1px solid rgba(124,92,252,0.3)",
              boxShadow: "0 0 60px rgba(124,92,252,0.08)",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                background: "radial-gradient(ellipse, rgba(124,92,252,0.15), transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              className="font-bold mb-1"
              style={{ fontSize: "4rem", color: "var(--text-primary)", lineHeight: 1 }}
            >
              15<span style={{ fontSize: "2rem" }}>%</span>
            </div>
            <p className="mb-1" style={{ color: "#C4B5FD", fontSize: "0.95rem" }}>
              플랫폼 수수료
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              나머지 <strong style={{ color: "var(--text-secondary)" }}>85%</strong>는 파트너 수익 · 월 1회 정산 · 최소 ₩10,000
            </p>

            <div className="flex justify-center gap-8 mt-8 pt-8" style={{ borderTop: "1px solid rgba(124,92,252,0.2)" }}>
              {[
                { label: "별도 월정액", value: "없음" },
                { label: "정산 주기",  value: "월 1회" },
                { label: "최소 금액",  value: "₩10,000" },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-24" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              FAQ
            </p>
            <h2 className="font-bold text-2xl md:text-3xl" style={{ color: "var(--text-primary)" }}>
              자주 묻는 질문
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <p className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>
                  Q. {faq.q}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  A. {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 px-6" style={{ zIndex: 1, position: "relative" }}>
        <div
          className="max-w-3xl mx-auto rounded-3xl p-10 text-center"
          style={{
            background: "linear-gradient(135deg, #4A36B8 0%, #7C5CFC 50%, #9D71FF 100%)",
            boxShadow: "0 20px 80px rgba(124,92,252,0.25)",
          }}
        >
          <h2 className="font-bold text-2xl md:text-3xl mb-3 text-white">
            지금 바로 시작하세요
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.75)" }}>
            방송인 PR 페이지 제작을 10분 안에 완성하는 경험, 직접 해보세요.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "white", color: "#4A36B8" }}
          >
            무료로 시작하기
            <ArrowRight />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="py-8 text-center text-xs"
        style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}
      >
        © 2026 Castfolio. Powered by Castfolio.
      </footer>
    </div>
  );
}
