import Link from "next/link";

const sections = [
  {
    badge: "WHO",
    title: "누구를 위한 서비스인가요?",
    content: "Castfolio는 방송인 PR 페이지를 제작·납품하는 에이전트(제작 파트너)를 위한 플랫폼입니다. 방송인 코치, 브랜딩 전문가, 에이전시 등이 주요 고객입니다.",
  },
  {
    badge: "INTAKE",
    title: "자료 수집 3가지 모드",
    items: [
      { mode: "직접 제출 (Self Submission)", desc: "방송인에게 제출 링크를 보내면 방송인이 직접 자료를 입력합니다." },
      { mode: "대행 입력 (Operator Entry)", desc: "카카오톡, 이메일, 전화 등으로 받은 자료를 담당자가 직접 입력합니다." },
      { mode: "혼합 (Hybrid)", desc: "일부는 방송인이, 일부는 담당자가 입력하는 유연한 방식입니다." },
    ],
  },
  {
    badge: "BUILD",
    title: "PR 페이지 제작",
    content: "7가지 전문 테마 중 하나를 선택하고 빌더에서 콘텐츠를 편집합니다. 한국어/영어/중국어 3개 언어로 작성할 수 있습니다.",
  },
  {
    badge: "PRICE",
    title: "가격 및 수수료",
    content: "상품 가격은 파트너가 자유롭게 설정합니다. Castfolio는 결제 금액의 15%만 수수료로 가져갑니다. 별도의 월정액이나 고정 비용은 없습니다.",
  },
  {
    badge: "PAY",
    title: "정산",
    content: "매월 1일 전월 매출분을 정산합니다. 최소 정산 금액은 10,000원이며, 미달 시 다음 달로 이월됩니다.",
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
          <h1 className="font-bold text-3xl mb-3" style={{ color: "var(--text-primary)" }}>기능 가이드</h1>
          <p style={{ color: "var(--text-muted)" }}>Castfolio를 활용하는 방법을 안내드립니다.</p>
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
          <p className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>지금 바로 시작하세요</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>별도 월정액 없이 성과 기반으로만 비용이 발생합니다.</p>
          <Link
            href="/login"
            className="btn-primary px-6 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--accent)" }}
          >
            무료로 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
