import Link from "next/link";

const sections = [
  {
    badge: "WHO",
    title: "누구를 위한 서비스인가요?",
    content: "Castfolio는 방송인 PR 홈페이지를 제작·판매하는 파트너를 위한 운영 도구입니다. 방송인 고객은 로그인 없이 자료 제출과 검토만 진행합니다.",
  },
  {
    badge: "INTAKE",
    title: "자료 요청 링크 보내기",
    items: [
      { mode: "방송인 고객 등록", desc: "고객명과 포지션을 등록한 뒤 프로젝트를 연결합니다." },
      { mode: "자료 제출 링크 발송", desc: "링크 하나만 보내면 방송인 고객이 로그인 없이 사진, 소개, 경력, 영상 자료를 제출할 수 있습니다." },
      { mode: "제출 자료 확인", desc: "dashboard/intake에서 제출 현황을 보고 Builder 초안으로 바로 불러올 수 있습니다." },
    ],
  },
  {
    badge: "BUILD",
    title: "PR 홈페이지 제작",
    content: "7가지 전문 테마 중 하나를 선택하고 빌더에서 콘텐츠를 편집합니다. 제출 자료를 초안에 반영해 복붙 시간을 줄일 수 있습니다.",
  },
  {
    badge: "PRICE",
    title: "판매 확정과 수수료",
    content: "상품 가격은 파트너가 자유롭게 설정합니다. 홈페이지 생성 자체에는 비용이 없고, 판매 확정 금액 기준으로만 15% 플랫폼 수수료가 계산됩니다.",
  },
  {
    badge: "PAY",
    title: "정산",
    content: "파트너 수익은 판매 확정 금액의 85%입니다. 정산 정책은 운영 설정에 따라 달라질 수 있으며, dashboard에서 확인할 수 있습니다.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 glass"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16 fade-in">
          <span
            className="inline-block text-xs font-bold tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(124,92,252,0.15)", color: "#A78BFA", border: "1px solid rgba(124,92,252,0.25)" }}
          >
            GUIDE
          </span>
          <h1 className="font-bold text-3xl mb-3" style={{ color: "var(--text-primary)" }}>파트너 운영 가이드</h1>
          <p style={{ color: "var(--text-muted)" }}>방송인 고객 등록부터 자료 수집, 제작, 납품까지 전체 흐름을 안내합니다.</p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <div
              key={section.title}
              className={`rounded-2xl p-6 fade-in-${Math.min(i + 1, 6)}`}
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            >
              <span
                className="inline-block text-xs font-bold tracking-widest px-2 py-0.5 rounded mb-3"
                style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border-default)" }}
              >
                {section.badge}
              </span>
              <h2 className="font-bold text-base mb-3" style={{ color: "var(--text-primary)" }}>
                {section.title}
              </h2>
              {section.content && (
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {section.content}
                </p>
              )}
              {section.items && (
                <div className="space-y-3 mt-1">
                  {section.items.map(item => (
                    <div
                      key={item.mode}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
                    >
                      <div
                        className="rounded-full flex-shrink-0 mt-0.5"
                        style={{ width: 6, height: 6, background: "#7C5CFC", marginTop: 6 }}
                      />
                      <div>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: "#C4B5FD" }}>{item.mode}</p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-12 rounded-2xl p-8 text-center fade-in-6"
          style={{ background: "linear-gradient(135deg, rgba(124,92,252,0.12) 0%, rgba(90,63,216,0.08) 100%)", border: "1px solid rgba(124,92,252,0.2)" }}
        >
          <p className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>지금 바로 파트너 운영을 시작하세요</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>자료 요청부터 판매 확정까지 한 흐름으로 관리할 수 있습니다.</p>
          <Link
            href="/login"
            className="btn-primary px-6 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--accent)" }}
          >
            파트너로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
