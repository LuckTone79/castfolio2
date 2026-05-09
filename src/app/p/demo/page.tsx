import type { Metadata } from "next";
import { PRPageRenderer } from "@/components/page/pr-page-renderer";
import type { PageContent } from "@/types/page-content";

export const metadata: Metadata = {
  title: "김유나 — 쇼호스트 | Castfolio",
  description: "김유나 쇼호스트 PR 페이지 데모",
};

const DEMO_CONTENT: PageContent = {
  hero: {
    position: "쇼호스트 · MC",
    tagline: "진심을 전하는 목소리, 시청자와 함께 만드는 라이브",
    heroImageId: "",
    ctaPrimary: { label: "연락하기", action: "contact" },
    ctaSecondary: { label: "포트폴리오", action: "portfolio" },
  },
  profile: {
    intro: "안녕하세요, 쇼호스트 김유나입니다.\n\n10년간 라이브 커머스와 TV 홈쇼핑에서 활동하며, 누적 방송 3,000회 이상을 진행했습니다. 뷰티·패션·리빙 카테고리에 전문성을 갖추고 있으며, 시청자와의 실시간 소통을 가장 중요하게 생각합니다.\n\n자연스러운 진행과 따뜻한 에너지로 브랜드의 가치를 전달합니다.",
    profileImageId: "",
    infoItems: [
      { label: "경력", value: "10년" },
      { label: "전문분야", value: "뷰티/패션/리빙" },
      { label: "누적 방송", value: "3,000회+" },
    ],
    strengths: [
      { icon: "🎙️", label: "라이브 커머스" },
      { icon: "💄", label: "뷰티 전문" },
      { icon: "🏠", label: "리빙 카테고리" },
      { icon: "🌐", label: "한/영 이중언어" },
      { icon: "📱", label: "SNS 마케팅" },
    ],
  },
  career: {
    items: [
      { period: "2024 — 현재", title: "CJ온스타일 쇼호스트", description: "뷰티·패션 카테고리 전담, 월 평균 방송 40회" },
      { period: "2021 — 2024", title: "네이버 쇼핑라이브 MC", description: "브랜드 라이브 커머스 진행, 누적 시청 500만+" },
      { period: "2019 — 2021", title: "GS홈쇼핑 게스트 쇼호스트", description: "리빙·키친 카테고리 게스트 출연" },
      { period: "2017 — 2019", title: "프리랜서 행사 MC", description: "기업 행사, 세미나, 전시회 MC 활동" },
      { period: "2016", title: "한국외국어대학교 졸업", description: "미디어커뮤니케이션학과" },
    ],
  },
  portfolio: {
    videos: [
      { url: "#", platform: "youtube", title: "CJ온스타일 뷰티 라이브 하이라이트" },
      { url: "#", platform: "youtube", title: "네이버 쇼핑라이브 베스트 클립" },
      { url: "#", platform: "youtube", title: "2024 서울 뷰티위크 MC 영상" },
    ],
    photos: [],
    audioSamples: [],
  },
  strength: {
    cards: [
      { icon: "🎯", title: "높은 전환율", description: "평균 전환율 8.5%로, 업계 평균 대비 2배 이상의 성과를 기록하고 있습니다." },
      { icon: "💬", title: "실시간 소통", description: "시청자 댓글에 즉각 반응하며, 참여형 라이브를 통해 체류 시간을 극대화합니다." },
      { icon: "📚", title: "철저한 준비", description: "모든 제품을 직접 사용하고 리서치한 뒤 방송에 임합니다. 진정성 있는 리뷰가 강점입니다." },
    ],
  },
  contact: {
    channels: [
      { type: "email", value: "yuna@example.com", label: "이메일" },
      { type: "phone", value: "010-1234-5678", label: "전화" },
      { type: "kakao", value: "yuna_host", label: "카카오톡" },
      { type: "instagram", value: "@yuna_official", label: "인스타그램" },
      { type: "youtube", value: "유나TV", label: "유튜브" },
    ],
  },
};

interface Props {
  searchParams: { theme?: string };
}

export default function DemoPRPage({ searchParams }: Props) {
  const themeId = searchParams.theme ?? "curated-atelier";

  return (
    <PRPageRenderer
      themeId={themeId}
      content={DEMO_CONTENT}
      talentNameKo="김유나"
      talentNameEn="Yuna Kim"
      sectionOrder={["hero", "profile", "career", "portfolio", "strength", "contact", "footer"]}
      disabledSections={[]}
    />
  );
}
