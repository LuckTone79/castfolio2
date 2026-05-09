"use client";

import Link from "next/link";

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const roles = [
  {
    title: "Castfolio 운영자",
    body: "플랫폼을 제공하고 파트너 계정, 수수료, 정산, 전체 페이지 운영을 관리합니다.",
    accent: "#7C5CFC",
  },
  {
    title: "제작 파트너",
    body: "방송인 고객에게 PR 홈페이지 제작 서비스를 판매하고 자료 수집, 제작, 납품, 판매 확정을 진행합니다.",
    accent: "#06B6D4",
  },
  {
    title: "방송인 고객",
    body: "완성된 PR 홈페이지를 검토하고 방송사, PD, 에이전시 제출용으로 활용합니다.",
    accent: "#10B981",
  },
];

const partnerFeatures = [
  {
    title: "방송인 고객 관리",
    desc: "고객별 포지션, 자료 제출 여부, 제작 상태, 판매 확정 흐름을 한 화면에서 관리합니다.",
    color: "#7C5CFC",
  },
  {
    title: "자료 수집 링크",
    desc: "로그인 없는 제출 링크로 사진, 소개, 경력, 포트폴리오 자료를 정리해서 받습니다.",
    color: "#06B6D4",
  },
  {
    title: "PR 홈페이지 빌더",
    desc: "7가지 전문 테마를 바탕으로 고객 이미지에 맞는 결과물을 빠르게 제작합니다.",
    color: "#10B981",
  },
  {
    title: "검토 링크 전달",
    desc: "완성 전 페이지를 고객에게 보내 수정 요청과 최종 승인을 받을 수 있도록 준비합니다.",
    color: "#F59E0B",
  },
  {
    title: "공개 URL 및 QR 납품",
    desc: "최종 링크와 QR 카드로 방송사, PD, 에이전시 제출용 결과물을 전달합니다.",
    color: "#EC4899",
  },
  {
    title: "판매 및 정산 관리",
    desc: "판매 확정 금액 기준으로 파트너 수익과 플랫폼 수수료를 바로 확인할 수 있습니다.",
    color: "#8B5CF6",
  },
];

const workflow = [
  { step: "01", title: "방송인 고객 등록", desc: "이름, 포지션, 연락처를 등록하고 제작 흐름을 시작합니다." },
  { step: "02", title: "자료 요청 링크 발송", desc: "로그인 없이 제출 가능한 링크를 고객에게 보내 자료를 받습니다." },
  { step: "03", title: "자료 자동 수집", desc: "사진, 소개, 경력, 영상 링크를 한 번에 정리된 형태로 받습니다." },
  { step: "04", title: "Builder 반영", desc: "제출 자료를 PR 홈페이지 초안으로 가져와 복붙 시간을 줄입니다." },
  { step: "05", title: "검토 및 납품", desc: "검토 링크와 최종 공개 URL로 고객 확인과 납품을 진행합니다." },
  { step: "06", title: "판매 확정 및 정산", desc: "판매가 확정된 건만 수수료를 계산하고 정산 흐름을 관리합니다." },
];

const faqs = [
  {
    q: "Castfolio는 방송인이 직접 사용하는 서비스인가요?",
    a: "아닙니다. Castfolio는 방송인 PR 홈페이지를 제작·판매하는 파트너를 위한 B2B SaaS입니다. 방송인 고객은 자료 제출 링크, 검토 링크, 최종 공개 페이지만 이용합니다.",
  },
  {
    q: "파트너가 판매 가격을 직접 정할 수 있나요?",
    a: "네. 파트너가 고객에게 제안하는 제작 가격을 직접 정하고, 판매 확정 금액 기준으로 플랫폼 수수료가 계산됩니다.",
  },
  {
    q: "방송인 고객도 회원가입이 필요한가요?",
    a: "아닙니다. 로그인 없이 자료 제출과 검토가 가능하도록 링크 기반 흐름으로 운영됩니다.",
  },
  {
    q: "수수료는 언제 발생하나요?",
    a: "홈페이지 생성만으로는 발생하지 않습니다. 파트너가 판매 확정을 입력한 시점에만 수수료가 계산됩니다.",
  },
  {
    q: "완성된 홈페이지는 어떻게 납품하나요?",
    a: "최종 공개 URL과 QR 카드로 전달할 수 있어 방송사, PD, 에이전시 제출 흐름에 바로 활용할 수 있습니다.",
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 920,
          height: 620,
          background: "radial-gradient(ellipse, rgba(124,92,252,0.14) 0%, transparent 72%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <header
        className="glass fixed top-0 left-0 right-0 z-50"
        style={{ borderBottom: "1px solid var(--border-subtle)", height: 60 }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
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
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/guide" className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>
              파트너 운영 가이드
            </Link>
            <Link href="/demo" className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>
              샘플 갤러리
            </Link>
          </nav>

          <Link href="/login" className="btn-primary px-4 py-2 rounded-lg text-sm" style={{ background: "var(--accent)" }}>
            파트너 로그인
          </Link>
        </div>
      </header>

      <section className="relative dot-grid" style={{ paddingTop: 138, paddingBottom: 88, zIndex: 1 }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: "rgba(124,92,252,0.12)",
              border: "1px solid rgba(124,92,252,0.25)",
              color: "#A78BFA",
              letterSpacing: "0.06em",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#7C5CFC", boxShadow: "0 0 6px #7C5CFC" }} />
            방송인 PR 홈페이지 제작·판매 파트너용 SaaS
          </div>

          <h1 className="font-bold leading-tight mb-6" style={{ fontSize: "clamp(2.2rem, 5vw, 4.1rem)" }}>
            방송인 PR 홈페이지 제작을
            <br />
            <span className="text-gradient-violet">수익화하는 파트너용 빌더</span>
          </h1>

          <p className="text-base leading-relaxed mb-10 mx-auto" style={{ maxWidth: 700, color: "var(--text-secondary)" }}>
            Castfolio는 아나운서, 쇼호스트, MC, 리포터 고객에게 전문 PR 홈페이지를 제작·판매하는 파트너를 위한 B2B SaaS입니다.
            <br />
            고객 자료 수집부터 제작, 검토, 납품, 판매 확정, 정산 관리까지 하나의 흐름으로 운영하세요.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login" className="btn-primary px-7 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: "var(--accent)" }}>
              파트너로 시작하기
              <ArrowRight />
            </Link>
            <Link href="/demo" className="btn-ghost px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
              샘플 PR 페이지 보기
              <ArrowRight />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 flex-wrap">
            {["월정액 없음", "로그인 없는 자료 제출 링크", "판매 확정 시에만 15%", "파트너 수익 85%"].map((badge) => (
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

      <section className="py-10 relative" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              Structure
            </p>
            <h2 className="font-bold text-2xl md:text-3xl">Castfolio는 이렇게 운영됩니다</h2>
            <p className="mt-3 text-sm md:text-base" style={{ color: "var(--text-secondary)" }}>
              관리자, 제작 파트너, 방송인 고객의 역할을 분리해 제작과 판매 흐름을 명확하게 관리합니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((item) => (
              <div key={item.title} className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: item.accent }}>
                  Role
                </div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl px-5 py-4 mt-4 text-sm md:text-base"
            style={{ background: "var(--bg-surface)", border: "1px dashed rgba(124,92,252,0.3)", color: "var(--text-secondary)" }}
          >
            Castfolio 운영자 → 제작 파트너 → 방송인 고객 → 방송사 / PD / 에이전시 제출
          </div>
        </div>
      </section>

      <section className="py-24 relative" style={{ zIndex: 1 }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              Workflow Features
            </p>
            <h2 className="font-bold text-2xl md:text-3xl">파트너가 실제로 쓰는 제작 업무 흐름</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerFeatures.map((feature) => (
              <div key={feature.title} className="card-hover rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="rounded-xl mb-4" style={{ width: 40, height: 40, background: `${feature.color}18`, border: `1px solid ${feature.color}28` }} />
                <h3 className="font-semibold mb-2 text-sm">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative" style={{ zIndex: 1 }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              Process
            </p>
            <h2 className="font-bold text-2xl md:text-3xl">고객 등록부터 판매 확정까지 6단계</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {workflow.map((item) => (
              <div key={item.step} className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <div className="font-mono font-bold text-xs mb-3" style={{ color: "#7C5CFC", letterSpacing: "0.08em" }}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              Pricing
            </p>
            <h2 className="font-bold text-2xl md:text-3xl">파트너 수익 85%, 플랫폼 수수료 15%</h2>
          </div>

          <div
            className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(124,92,252,0.18) 0%, rgba(90,63,216,0.08) 100%)",
              border: "1px solid rgba(124,92,252,0.3)",
              boxShadow: "0 0 60px rgba(124,92,252,0.08)",
            }}
          >
            <div className="font-bold mb-1" style={{ fontSize: "4rem", color: "var(--text-primary)", lineHeight: 1 }}>
              15<span style={{ fontSize: "2rem" }}>%</span>
            </div>
            <p className="mb-1" style={{ color: "#C4B5FD", fontSize: "0.95rem" }}>
              판매 확정 시에만 계산되는 플랫폼 수수료
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              홈페이지 생성 자체에는 비용이 없고, 판매 확정 금액의 85%는 파트너 수익으로 집계됩니다.
            </p>

            <div className="flex justify-center gap-8 mt-8 pt-8 flex-wrap" style={{ borderTop: "1px solid rgba(124,92,252,0.2)" }}>
              {[
                { label: "월정액", value: "없음" },
                { label: "수수료 기준", value: "판매 확정" },
                { label: "파트너 수익", value: "85%" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24" style={{ zIndex: 1, position: "relative" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#7C5CFC" }}>
              FAQ
            </p>
            <h2 className="font-bold text-2xl md:text-3xl">자주 묻는 질문</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl p-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                <p className="font-semibold text-sm mb-2">Q. {faq.q}</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  A. {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6" style={{ zIndex: 1, position: "relative" }}>
        <div
          className="max-w-3xl mx-auto rounded-3xl p-10 text-center"
          style={{ background: "linear-gradient(135deg, #4A36B8 0%, #7C5CFC 50%, #9D71FF 100%)", boxShadow: "0 20px 80px rgba(124,92,252,0.25)" }}
        >
          <h2 className="font-bold text-2xl md:text-3xl mb-3 text-white">파트너 운영을 바로 시작하세요</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.78)" }}>
            자료 요청, 제작, 납품, 판매 확정을 한 흐름으로 연결해 방송인 PR 홈페이지 제작 업무를 더 빠르게 운영할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm" style={{ background: "white", color: "#4A36B8" }}>
              파트너로 시작하기
              <ArrowRight />
            </Link>
            <Link href="/guide" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm" style={{ background: "rgba(255,255,255,0.14)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}>
              운영 가이드 보기
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}>
        © 2026 Castfolio. Partner workflow platform for broadcast PR pages.
      </footer>
    </div>
  );
}
