const categories = [
  {
    title: "시작하기",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
      </svg>
    ),
    color: "#7C5CFC",
    items: [
      { q: "첫 방송인 등록 방법", a: "방송인 메뉴 → 방송인 등록에서 이름(한글/영문)과 포지션을 입력하세요." },
      { q: "첫 프로젝트 생성 방법", a: "프로젝트 메뉴 → 프로젝트 생성에서 방송인을 선택하고 프로젝트명을 입력하세요." },
    ],
  },
  {
    title: "자료 수집",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
      </svg>
    ),
    color: "#06B6D4",
    items: [
      { q: "방송인에게 자료 제출 링크 보내기", a: "프로젝트 상세 → 자료 요청 생성에서 링크를 생성하여 카카오톡/이메일로 전송하세요." },
      { q: "카카오톡으로 받은 자료 입력하기", a: "대행 입력 모드를 선택하면 수신 채널을 기록하고 담당자가 직접 입력할 수 있습니다. 카카오톡 사진은 화질이 낮을 수 있으므로 원본 요청을 권장합니다." },
    ],
  },
  {
    title: "페이지 제작",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    color: "#10B981",
    items: [
      { q: "테마는 어떻게 선택하나요?", a: "빌더 상단에서 7가지 테마 중 선택하세요. 데모 갤러리에서 미리 확인할 수 있습니다." },
      { q: "여러 언어로 편집하려면?", a: "빌더 상단의 KO/EN/ZH 탭으로 언어를 전환하여 각 언어별로 편집하세요." },
    ],
  },
  {
    title: "견적 / 주문",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16l2.5-1.5L9 20l2.5-1.5L14 20l2.5-1.5L19 20V8z"/>
        <path d="M14 2v6h5M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    color: "#F59E0B",
    items: [
      { q: "견적서 발송 방법", a: "견적 메뉴 → 견적 생성에서 상품을 선택하고 발송하면 방송인에게 링크가 전달됩니다." },
      { q: "결제 확인 방법", a: "주문 관리에서 오프라인 결제 정보를 입력하여 결제를 확인합니다." },
    ],
  },
  {
    title: "정산",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    color: "#EC4899",
    items: [
      { q: "정산 주기는?", a: "매월 1일 전월 매출분을 정산합니다." },
      { q: "최소 정산 금액은?", a: "10,000원 미만이면 다음 달로 이월됩니다." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-5 fade-in">
      <div>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>도움말 센터</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          자주 묻는 질문과 사용 가이드
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {categories.map(cat => (
          <a
            key={cat.title}
            href={`#${cat.title}`}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: cat.color,
              textDecoration: "none",
            }}
          >
            {cat.icon}
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {cat.title}
            </span>
          </a>
        ))}
      </div>

      {/* FAQ sections */}
      {categories.map((cat, catIdx) => (
        <div
          key={cat.title}
          id={cat.title}
          className={`rounded-2xl overflow-hidden fade-in-${catIdx + 1}`}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          {/* Section header */}
          <div
            className="flex items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div
              className="rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                width: 32, height: 32,
                background: `${cat.color}15`,
                color: cat.color,
              }}
            >
              {cat.icon}
            </div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {cat.title}
            </h2>
          </div>

          {/* Items */}
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {cat.items.map(item => (
              <div key={item.q} className="px-5 py-4">
                <div className="flex items-start gap-2 mb-2">
                  <span
                    className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${cat.color}15`, color: cat.color }}
                  >
                    Q
                  </span>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {item.q}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span
                    className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(139,156,200,0.1)", color: "var(--text-muted)" }}
                  >
                    A
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Contact */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(124,92,252,0.03) 100%)",
          border: "1px solid rgba(124,92,252,0.2)",
        }}
      >
        <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
          추가 도움이 필요하신가요?
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          카카오톡 채널로 문의하시면 빠르게 답변드립니다.
        </p>
        <a
          href="https://open.kakao.com/castfolio"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm px-5 py-2.5 rounded-xl font-medium"
          style={{ background: "#FEE500", color: "#3C1E1E" }}
        >
          카카오톡 문의하기
        </a>
      </div>
    </div>
  );
}
