import React from 'react';
import PRPage from '../PRPage/PRPage';
import { Page, PageContent } from '../../types';
import { ArrowLeft } from 'lucide-react';

const MOCK_CONTENT: PageContent = {
  hero: {
    nameKo: "전문 방송인",
    nameEn: "Professional Talent",
    label: "Announcer & Showhost",
    title: "신뢰를 주는 목소리, 마음을 움직이는 진행",
    tagline: "당신의 브랜드 가치를 가장 빛나는 순간으로 만듭니다.",
    photoUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&q=80&w=1200"
  },
  about: {
    title: "ABOUT ME",
    subtitle: "진심을 전하는 커뮤니케이터",
    profilePhotoUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&q=80&w=800",
    bio: "10년 차 전문 아나운서로서 수많은 생방송 현장과 대형 컨퍼런스를 진행해왔습니다. 단순히 정보를 전달하는 것을 넘어, 청중과 깊이 공감하고 브랜드의 철학을 우아하게 녹여내는 진행을 지향합니다.\n\n세련된 이미지와 안정적인 발성으로 당신의 행사에 품격을 더해드립니다.",
    details: [
      { id: '1', label: '경력', value: '10년' },
      { id: '2', label: '전문분야', value: '뉴스, 국제회의, 라이브커머스' },
      { id: '3', label: '언어', value: '한국어, 영어 (비즈니스)' }
    ]
  },
  career: [
    { id: '1', period: '2020 - 현재', title: '프리랜서 아나운서 & MC', description: '정부 부처 및 대기업 공식 행사 메인 진행 (500회 이상)' },
    { id: '2', period: '2018 - 2020', title: '경제 TV 앵커', description: '데일리 경제 뉴스 및 전문가 대담 프로그램 진행' },
    { id: '3', period: '2015 - 2018', title: '지역 방송국 공채 아나운서', description: '뉴스데스크 진행 및 시사 프로그램 제작 참여' }
  ],
  portfolio: [
    { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', title: '대형 컨퍼런스 진행' },
    { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800', title: '라이브 커머스 현장' },
    { id: '3', type: 'image', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=800', title: '방송 스튜디오 촬영' }
  ],
  strengths: [
    { id: '1', icon: '🎙️', title: '안정적인 보이스', description: '신뢰감을 주는 중저음의 톤과 정확한 딕션' },
    { id: '2', icon: '⚡', title: '순발력 있는 진행', description: '돌발 상황에서도 유연하게 대처하는 현장 장악력' },
    { id: '3', icon: '⭐', title: '브랜드 이해도', description: '클라이언트의 니즈를 정확히 파악한 맞춤형 톤앤매너' }
  ],
  contact: {
    title: "CONTACT",
    subtitle: "함께 최고의 순간을 만들어보세요",
    email: "professional@talent.com"
  }
};

const THEME_MOCKS: Record<string, Partial<Page>> = {
  'minimal-grid': {
    layout: 'minimal-grid',
    colorScheme: 'elegant-white',
    content: {
      ...MOCK_CONTENT,
      hero: {
        ...MOCK_CONTENT.hero,
        photoUrl: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&q=80&w=1200"
      }
    }
  },
  'diva-luxe': {
    layout: 'diva-luxe',
    colorScheme: 'classic-black',
    content: {
      ...MOCK_CONTENT,
      hero: {
        ...MOCK_CONTENT.hero,
        photoUrl: "https://images.unsplash.com/photo-1508002366002-f5a3c04b935f?auto=format&fit=crop&q=80&w=1200"
      }
    }
  },
  'artistic-dark': {
    layout: 'artistic-dark',
    colorScheme: 'marble-luxe',
    content: {
      ...MOCK_CONTENT,
      hero: {
        ...MOCK_CONTENT.hero,
        photoUrl: "https://images.unsplash.com/photo-1516534775068-ba3e84529519?auto=format&fit=crop&q=80&w=1200"
      }
    }
  }
};

const DemoPage: React.FC<{ themeId: string }> = ({ themeId }) => {
  const mockPage = THEME_MOCKS[themeId] || THEME_MOCKS['minimal-grid'];
  
  const page: Page = {
    id: 'demo',
    agentId: 'demo',
    talentId: 'demo',
    slug: 'demo',
    status: 'published',
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: 0,
    ...mockPage
  } as Page;

  return (
    <div className="relative">
      <div className="fixed top-6 left-6 z-50">
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.close();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg font-bold hover:bg-white transition-all"
        >
          <ArrowLeft size={18} />
          돌아가기
        </button>
      </div>
      <PRPage page={page} />
    </div>
  );
};

export default DemoPage;
