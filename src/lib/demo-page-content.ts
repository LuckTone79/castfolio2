import type { PageContent } from "@/types/page-content";

export const DEMO_PAGE_CONTENT: PageContent = {
  hero: {
    tagline: "시청자의 마음을 움직이는 진심 어린 방송",
    position: "쇼호스트",
    heroImageId: "",
    ctaPrimary: { label: "포트폴리오 보기", action: "portfolio" },
    ctaSecondary: { label: "연락하기", action: "contact" },
  },
  profile: {
    intro:
      "안녕하세요, 김유나입니다. 10년간 국내 주요 홈쇼핑 채널에서 뷰티·라이프스타일 전문 쇼호스트로 활동해 왔습니다. 고객의 마음을 움직이는 진심 어린 방송으로 연간 최고 판매 기록을 보유하고 있습니다.",
    profileImageId: "",
    infoItems: [
      { label: "경력", value: "10년" },
      { label: "전문분야", value: "뷰티/라이프스타일" },
      { label: "학력", value: "서울대 언론정보학과" },
    ],
    strengths: [
      { icon: "💄", label: "뷰티 전문" },
      { icon: "🎤", label: "발성 우수" },
      { icon: "🌍", label: "영어 능통" },
    ],
  },
  career: {
    items: [
      { period: "2020 – 현재", title: "GS홈쇼핑 전속 쇼호스트", description: "뷰티/라이프 채널 담당, 연간 매출 1,000억 달성" },
      { period: "2018 – 2020", title: "CJ온스타일 쇼호스트", description: "식품/건강 카테고리 전담, 런칭 방송 최고 시청률" },
      { period: "2016 – 2018", title: "MBC 방송 리포터", description: "뉴스 및 예능 프로그램 다수 출연" },
    ],
  },
  portfolio: {
    videos: [
      { url: "https://youtu.be/dQw4w9WgXcQ", platform: "youtube", title: "GS홈쇼핑 뷰티 런칭 방송" },
      { url: "https://youtu.be/dQw4w9WgXcQ", platform: "youtube", title: "CJ온스타일 식품 특집" },
    ],
    photos: [],
    audioSamples: [],
  },
  strength: {
    cards: [
      { icon: "🏆", title: "판매 전문가", description: "10년간 쌓은 판매 노하우로 시청자의 구매 욕구를 이끌어냅니다." },
      { icon: "💬", title: "탁월한 소통력", description: "편안하면서도 신뢰감 있는 화법으로 시청자와 깊이 소통합니다." },
      { icon: "📚", title: "전문 지식", description: "뷰티, 라이프스타일, 건강 분야의 깊은 제품 지식을 보유하고 있습니다." },
    ],
  },
  contact: {
    channels: [
      { type: "email", value: "yuna.kim@example.com", label: "이메일" },
      { type: "instagram", value: "@yuna_host", label: "인스타그램" },
      { type: "phone", value: "010-1234-5678", label: "전화" },
    ],
  },
};
