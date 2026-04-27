import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, Instagram, Youtube, Globe, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "김유나 — 쇼호스트 | Castfolio",
  description: "김유나 쇼호스트 PR 페이지 데모",
};

const DEMO = {
  nameKo: "김유나",
  nameEn: "Yuna Kim",
  hero: {
    position: "쇼호스트 · MC",
    tagline: "진심을 전하는 목소리, 시청자와 함께 만드는 라이브",
    ctaPrimary: { label: "연락하기" },
    ctaSecondary: { label: "포트폴리오" },
  },
  profile: {
    intro: "안녕하세요, 쇼호스트 김유나입니다.\n\n10년간 라이브 커머스와 TV 홈쇼핑에서 활동하며, 누적 방송 3,000회 이상을 진행했습니다. 뷰티·패션·리빙 카테고리에 전문성을 갖추고 있으며, 시청자와의 실시간 소통을 가장 중요하게 생각합니다.\n\n자연스러운 진행과 따뜻한 에너지로 브랜드의 가치를 전달합니다.",
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
      { title: "CJ온스타일 뷰티 라이브 하이라이트", url: "#" },
      { title: "네이버 쇼핑라이브 베스트 클립", url: "#" },
      { title: "2024 서울 뷰티위크 MC 영상", url: "#" },
    ],
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

export default function DemoPRPage() {
  const d = DEMO;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950" />
        <div className="relative max-w-3xl mx-auto px-6 py-24 text-center">
          <div className="w-28 h-28 rounded-full bg-gray-800 mx-auto mb-6 ring-4 ring-gray-700 flex items-center justify-center text-3xl font-bold text-gray-500">
            {d.nameKo[0]}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{d.nameKo}</h1>
          <p className="text-lg text-gray-500 mt-1">{d.nameEn}</p>
          <p className="text-xl text-gray-300 mt-3">{d.hero.position}</p>
          <p className="text-gray-400 mt-4 text-lg italic">&ldquo;{d.hero.tagline}&rdquo;</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <a href="#contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors">
              {d.hero.ctaPrimary.label}
            </a>
            <a href="#portfolio" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-700 text-white font-medium text-sm hover:bg-gray-800 transition-colors">
              {d.hero.ctaSecondary.label}
            </a>
          </div>
        </div>
      </section>

      {/* Profile */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-6">소개</h2>
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{d.profile.intro}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          {d.profile.strengths.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-800 text-sm text-gray-300 border border-gray-700">
              <span>{s.icon}</span>
              {s.label}
            </span>
          ))}
        </div>
      </section>

      {/* Career */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-8">경력</h2>
        <div className="space-y-6">
          {d.career.items.map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="w-28 shrink-0 text-right">
                <span className="text-sm text-gray-500 font-mono">{item.period}</span>
              </div>
              <div className="flex-1 pb-6 border-l border-gray-800 pl-6 relative">
                <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-gray-600" />
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-8">포트폴리오</h2>
        <div className="grid gap-4 mb-6">
          {d.portfolio.videos.map((v, i) => (
            <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-4">
              <p className="text-sm font-medium text-white mb-2">{v.title}</p>
              <a href={v.url} className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                영상 보기 <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Strength */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-8">강점</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {d.strength.cards.map((card, i) => (
            <div key={i} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-gray-400">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="max-w-3xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-8">연락처</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {d.contact.channels.map((ch, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-900 border border-gray-800 p-4">
              <ContactIcon type={ch.type} />
              <div>
                <p className="text-xs text-gray-500 uppercase">{ch.label}</p>
                <p className="text-sm text-white">{ch.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center">
        <p className="text-xs text-gray-600">
          Powered by <span className="text-gray-500">Castfolio</span>
        </p>
      </footer>
    </div>
  );
}

function ContactIcon({ type }: { type: string }) {
  const cls = "text-gray-400";
  switch (type) {
    case "email": return <Mail size={18} className={cls} />;
    case "phone": return <Phone size={18} className={cls} />;
    case "kakao": return <MessageCircle size={18} className={cls} />;
    case "instagram": return <Instagram size={18} className={cls} />;
    case "youtube": return <Youtube size={18} className={cls} />;
    default: return <Globe size={18} className={cls} />;
  }
}
