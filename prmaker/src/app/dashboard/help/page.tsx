const categories = [
  {
    title: "시작하기",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    color: "#7C5CFC",
    items: [
      { q: "방송인 고객은 어떻게 등록하나요?", a: "방송인 고객 메뉴에서 이름, 영문 이름, 포지션, 연락처를 등록하면 제작 흐름을 시작할 수 있습니다." },
      { q: "제작 프로젝트는 어떻게 시작하나요?", a: "제작 프로젝트 메뉴에서 방송인 고객을 연결하고 프로젝트명을 입력해 새로운 제작 건을 만듭니다." },
    ],
  },
  {
    title: "자료 수집",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      </svg>
    ),
    color: "#06B6D4",
    items: [
      { q: "방송인 고객에게 자료 제출 링크를 어떻게 보내나요?", a: "방송인 고객 목록이나 자료 수집 메뉴에서 자료 요청 링크를 생성하고 복사해 카카오톡이나 이메일로 전달하면 됩니다." },
      { q: "제출된 자료는 어디에서 확인하나요?", a: "자료 수집 관리 화면에서 제출 상태, 제출일, 이미지 포함 여부를 보고 미리보기와 Builder 불러오기를 진행할 수 있습니다." },
    ],
  },
  {
    title: "홈페이지 제작",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    color: "#10B981",
    items: [
      { q: "테마는 어떻게 선택하나요?", a: "샘플 갤러리에서 고객 이미지와 포지션에 맞는 테마를 먼저 확인한 뒤, 빌더에서 해당 테마를 적용하면 됩니다." },
      { q: "제출 자료는 Builder에 어떻게 반영하나요?", a: "자료 수집 화면의 Builder로 불러오기 버튼을 사용하면 제출 자료를 초안에 반영할 수 있고, 비어 있는 항목만 채우기 또는 덮어쓰기를 선택할 수 있습니다." },
    ],
  },
  {
    title: "판매 관리",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16l2.5-1.5L9 20l2.5-1.5L14 20l2.5-1.5L19 20V8z" />
        <path d="M14 2v6h5M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
    color: "#F59E0B",
    items: [
      { q: "판매 확정은 언제 입력하나요?", a: "방송인 고객이 결과물을 확인하고 실제 결제가 확인된 뒤 판매 관리 화면에서 확정 금액을 입력하는 방식으로 운영하는 것이 안전합니다." },
      { q: "가격은 누가 정하나요?", a: "제작 가격은 파트너가 자유롭게 정합니다. Castfolio는 판매 확정 금액을 기준으로 수수료와 정산 금액을 계산합니다." },
    ],
  },
  {
    title: "정산",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    color: "#EC4899",
    items: [
      { q: "수수료는 어떻게 계산되나요?", a: "기본 구조는 판매 확정 금액의 85%가 파트너 수익, 15%가 플랫폼 수수료입니다. 운영 정책에 따라 수수료율은 조정될 수 있습니다." },
      { q: "정산 정보는 어디에서 확인하나요?", a: "정산 내역 화면에서 판매 확정 건 기준의 예상 정산금과 수수료 흐름을 확인할 수 있습니다." },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-5 fade-in">
      <div>
        <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>파트너 운영 가이드</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          고객 등록부터 자료 수집, 제작, 판매 확정까지 실무 중심으로 정리했습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {categories.map((category) => (
          <a
            key={category.title}
            href={`#${category.title}`}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              color: category.color,
              textDecoration: "none",
            }}
          >
            {category.icon}
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {category.title}
            </span>
          </a>
        ))}
      </div>

      {categories.map((category, index) => (
        <div
          key={category.title}
          id={category.title}
          className={`rounded-2xl overflow-hidden fade-in-${index + 1}`}
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, background: `${category.color}15`, color: category.color }}>
              {category.icon}
            </div>
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              {category.title}
            </h2>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {category.items.map((item) => (
              <div key={item.q} className="px-5 py-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${category.color}15`, color: category.color }}>
                    Q
                  </span>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {item.q}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(139,156,200,0.1)", color: "var(--text-muted)" }}>
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

      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "linear-gradient(135deg, rgba(124,92,252,0.08) 0%, rgba(124,92,252,0.03) 100%)", border: "1px solid rgba(124,92,252,0.2)" }}
      >
        <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
          추가 도움이 필요하신가요?
        </p>
        <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
          파트너 운영 중 막히는 지점이 있으면 빠르게 문의를 남겨주세요.
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
