import React, { useState, useEffect, useRef } from 'react';
import { Talent, Page, PageContent, LayoutId, ColorSchemeId } from '../../types';
import { LAYOUTS, COLOR_SCHEMES, KOREAN_FONTS } from '../../constants';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Eye, EyeOff, Rocket, Layout, Type, Image as ImageIcon, Briefcase, Star, Phone, Sparkles, ChevronLeft, ChevronRight, X, Plus, Trash2, Smartphone, Monitor, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type as TypeIcon, Palette, MoveVertical, MoveHorizontal, ChevronUp, ChevronDown, MessageCircle, QrCode, Search, Globe, Youtube, Link as LinkIcon } from 'lucide-react';
import PRPage from '../PRPage/PRPage';
import QRCodeCard from '../PRPage/QRCodeCard';
import { GoogleGenAI } from '@google/genai';
import { QRCodeSVG } from 'qrcode.react';
import { RichTextField } from './RichTextField';
import { logAuditEvent } from '../../lib/audit';
import { ensureUniqueSlug, slugifyTalentName } from '../../lib/slug';
import { getISODateString } from '../../lib/date';

interface BuilderProps {
  talent: Talent;
  onBack: () => void;
}

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const INITIAL_CONTENT: PageContent = {
  hero: {
    nameKo: '',
    nameEn: '',
    label: '',
    title: '',
    tagline: '시청자의 마음을 여는 따뜻한 목소리',
    photoUrl: 'https://picsum.photos/seed/broadcaster/1920/1080',
  },
  about: {
    title: '',
    subtitle: '',
    profilePhotoUrl: 'https://picsum.photos/seed/profile/800/1000',
    bio: '안녕하세요, 방송인으로서 새로운 도전을 시작하는 김유나입니다.',
    details: [
      { id: '1', label: '키', value: '168cm' },
      { id: '2', label: '위치', value: '서울' },
      { id: '3', label: '학력', value: '한국대학교 언론정보학과 졸업' },
    ],
  },
  career: [
    { id: '1', period: '2024.03', title: 'KBS 아나운서 아카데미 수료', description: '실전 방송 역량 강화 및 발성 훈련' },
  ],
  portfolio: [
    { id: '1', type: 'image', url: 'https://picsum.photos/seed/port1/800/600', title: '방송 스튜디오 촬영' },
  ],
  strengths: [
    { id: '1', icon: '🎤', title: '발성·발음', description: '정확한 딕션과 신뢰감 있는 목소리' },
    { id: '2', icon: '🌟', title: '무대 매너', description: '자연스러운 제스처와 여유로운 진행 실력' },
  ],
  contact: {
    email: '',
    phone: '',
    kakaoOpenChat: '',
    instagram: '',
  },
};

const TRANSLATIONS = {
  ko: {
    editor: '편집기',
    theme: '테마',
    hero: '히어로',
    about: '소개',
    career: '경력',
    portfolio: '포트폴리오',
    strengths: '강점',
    contact: '연락처',
    save: '임시 저장',
    saving: '저장 중...',
    publish: '게시하기',
    unpublish: '게시 중단',
    archive: '보관하기',
    archiveConfirm: '이 페이지를 보관하시겠습니까? 보관된 페이지는 공개되지 않습니다.',
    preview: '미리보기',
    backToEditor: '편집기로 돌아가기',
    editing: '편집 중',
    published: '공개됨',
    draft: '초안',
    styleEditor: '스타일 편집',
    selectedElement: '선택된 요소',
    font: '글꼴',
    size: '크기',
    weight: '굵기',
    color: '글자 색상',
    alignment: '정렬',
    letterSpacing: '자간',
    lineHeight: '행간',
    marginBottom: '아래 여백',
    marginTop: '위 여백',
    resetStyle: '스타일 초기화',
    layoutSelect: '1. 레이아웃 선택',
    themeSelect: '2. 색상 테마 선택',
    heroPhoto: '히어로 사진',
    heroLabel: '히어로 라벨',
    heroTitle: '히어로 제목',
    tagline: '태그라인',
    aiRecommend: 'AI 추천',
    profilePhoto: '프로필 사진',
    aboutTitle: '소개 제목',
    aboutSubtitle: '소개 부제목',
    bio: '자기소개',
    aiWrite: 'AI 작성',
    additionalInfo: '추가 정보',
    height: '키',
    location: '위치',
    education: '학력',
    add: '추가',
    period: '기간',
    title: '제목',
    description: '설명',
    thumbnail: '썸네일 URL',
    type: '유형',
    url: 'URL',
    icon: '아이콘',
    email: '이메일',
    kakao: '카카오톡 오픈채팅',
    instagram: '인스타그램',
    loading: '빌더 로딩 중...',
    error: '오류가 발생했습니다',
    back: '돌아가기',
    default: '기본값',
    sectionVisibility: '섹션 표시 설정',
    show: '표시',
    hide: '숨김',
    label: '항목명',
    value: '내용',
    qrCode: 'QR 코드',
    seo: 'SEO 설정',
    seoTitle: 'SEO 제목',
    seoDescription: 'SEO 설명',
    seoImage: 'SEO 이미지 URL',
    qrEnabled: 'QR 카드 표시',
    qrTitle: 'QR 제목',
    qrSubtitle: 'QR 부제목',
    sectionOrder: '섹션 순서',
    moveUp: '위로',
    moveDown: '아래로',
    contactSNS: 'SNS 및 추가 연락처',
    youtube: '유튜브',
    tiktok: '틱톡',
    blog: '블로그',
    phone: '전화번호',
  },
  en: {
    editor: 'Editor',
    theme: 'Theme',
    hero: 'Hero',
    about: 'About',
    career: 'Career',
    portfolio: 'Portfolio',
    strengths: 'Strengths',
    contact: 'Contact',
    save: 'Save Draft',
    saving: 'Saving...',
    publish: 'Publish',
    unpublish: 'Unpublish',
    archive: 'Archive',
    archiveConfirm: 'Are you sure you want to archive this page? Archived pages are not public.',
    preview: 'Preview',
    backToEditor: 'Back to Editor',
    editing: 'Editing',
    published: 'Published',
    draft: 'Draft',
    styleEditor: 'Style Editor',
    selectedElement: 'Selected Element',
    font: 'Font',
    size: 'Size',
    weight: 'Weight',
    color: 'Text Color',
    alignment: 'Alignment',
    letterSpacing: 'Letter Spacing',
    lineHeight: 'Line Height',
    marginBottom: 'Margin Bottom',
    marginTop: 'Margin Top',
    resetStyle: 'Reset Style',
    layoutSelect: '1. Select Layout',
    themeSelect: '2. Select Color Theme',
    heroPhoto: 'Hero Photo',
    heroLabel: 'Hero Label',
    heroTitle: 'Hero Title',
    tagline: 'Tagline',
    aiRecommend: 'AI Suggest',
    profilePhoto: 'Profile Photo',
    aboutTitle: 'About Title',
    aboutSubtitle: 'About Subtitle',
    bio: 'Bio',
    aiWrite: 'AI Write',
    additionalInfo: 'Additional Info',
    height: 'Height',
    location: 'Location',
    education: 'Education',
    add: 'Add',
    period: 'Period',
    title: 'Title',
    description: 'Description',
    thumbnail: 'Thumbnail URL',
    type: 'Type',
    url: 'URL',
    icon: 'Icon',
    email: 'Email',
    kakao: 'KakaoTalk',
    instagram: 'Instagram',
    loading: 'Loading Builder...',
    error: 'An error occurred',
    back: 'Go Back',
    default: 'Default',
    sectionVisibility: 'Section Visibility',
    show: 'Show',
    hide: 'Hide',
    label: 'Label',
    value: 'Value',
    qrCode: 'QR Code',
    seo: 'SEO Settings',
    seoTitle: 'SEO Title',
    seoDescription: 'SEO Description',
    seoImage: 'SEO Image URL',
    qrEnabled: 'Enable QR Card',
    qrTitle: 'QR Title',
    qrSubtitle: 'QR Subtitle',
    sectionOrder: 'Section Order',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    contactSNS: 'SNS & Extra Contact',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    blog: 'Blog',
    phone: 'Phone',
  },
  ja: {
    editor: 'エディタ',
    theme: 'テーマ',
    hero: 'ヒーロー',
    about: '紹介',
    career: '経歴',
    portfolio: 'ポートフォリオ',
    strengths: '強み',
    contact: '連絡先',
    save: '下書き保存',
    saving: '保存中...',
    publish: '公開する',
    unpublish: '公開中止',
    archive: 'アーカイブ',
    archiveConfirm: 'このページをアーカイブしてもよろしいですか？アーカイブされたページは公開されません。',
    preview: 'プレビュー',
    backToEditor: 'エディタに戻る',
    editing: '編集内容',
    published: '公開済み',
    draft: '下書き',
    styleEditor: 'スタイル編集',
    selectedElement: '選択された要素',
    font: 'フォント',
    size: 'サイズ',
    weight: '太さ',
    color: '文字色',
    alignment: '整列',
    letterSpacing: '字間',
    lineHeight: '行間',
    marginBottom: '下の余白',
    marginTop: '上の余白',
    resetStyle: 'スタイル初期化',
    layoutSelect: '1. レイアウト選択',
    themeSelect: '2. カラーテーマ選択',
    heroPhoto: 'ヒーロー写真',
    heroLabel: 'ヒーローラベル',
    heroTitle: 'ヒーロータイトル',
    tagline: 'キャッチコピー',
    aiRecommend: 'AI推薦',
    profilePhoto: 'プロフィール写真',
    aboutTitle: '紹介タイトル',
    aboutSubtitle: '紹介サブタイトル',
    bio: '自己紹介',
    aiWrite: 'AI作成',
    additionalInfo: '追加情報',
    height: '身長',
    location: '場所',
    education: '学歴',
    add: '追加',
    period: '期間',
    title: 'タイトル',
    description: '説明',
    thumbnail: 'サムネイルURL',
    type: 'タイプ',
    url: 'URL',
    icon: 'アイコン',
    email: 'メール',
    kakao: 'カカオトーク',
    instagram: 'インスタグラム',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    back: '戻る',
    default: 'デフォルト',
    sectionVisibility: 'セクション表示設定',
    show: '表示',
    hide: '非表示',
    label: '項目名',
    value: '内容',
    qrCode: 'QRコード',
    seo: 'SEO設定',
    seoTitle: 'SEOタイトル',
    seoDescription: 'SEO説明',
    seoImage: 'SEO画像URL',
    qrEnabled: 'QRカード表示',
    qrTitle: 'QRタイトル',
    qrSubtitle: 'QRサブタイトル',
    sectionOrder: 'セクション順序',
    moveUp: '上へ',
    moveDown: '下へ',
    contactSNS: 'SNSおよび追加連絡先',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    blog: 'ブログ',
    phone: '電話番号',
  },
  zh: {
    editor: '编辑器',
    theme: '主题',
    hero: '英雄',
    about: '关于',
    career: '经历',
    portfolio: '作品集',
    strengths: '优势',
    contact: '联系方式',
    save: '保存草稿',
    saving: '保存中...',
    publish: '发布',
    unpublish: '取消发布',
    archive: '归档',
    archiveConfirm: '您确定要归档此页面吗？归档后的页面将不再公开。',
    preview: '预览',
    backToEditor: '返回编辑器',
    editing: '正在编辑',
    published: '已发布',
    draft: '草稿',
    styleEditor: '样式编辑',
    selectedElement: '选定元素',
    font: '字体',
    size: '大小',
    weight: '粗细',
    color: '文字颜色',
    alignment: '对齐',
    letterSpacing: '字间距',
    lineHeight: '行高',
    marginBottom: '下边距',
    marginTop: '上边距',
    resetStyle: '重置样式',
    layoutSelect: '1. 选择布局',
    themeSelect: '2. 选择配色方案',
    heroPhoto: '英雄照片',
    heroLabel: '英雄标签',
    heroTitle: '英雄标题',
    tagline: '标语',
    aiRecommend: 'AI推荐',
    profilePhoto: '个人照片',
    aboutTitle: '关于标题',
    aboutSubtitle: '关于副标题',
    bio: '自我介绍',
    aiWrite: 'AI写作',
    additionalInfo: '额外信息',
    height: '身高',
    location: '位置',
    education: '教育经历',
    add: '添加',
    period: '期间',
    title: '标题',
    description: '描述',
    thumbnail: '缩略图URL',
    type: '类型',
    url: 'URL',
    icon: '图标',
    email: '邮箱',
    kakao: 'KakaoTalk',
    instagram: 'Instagram',
    loading: '加载中...',
    error: '发生错误',
    back: '返回',
    default: '默认',
    sectionVisibility: '部分可见性',
    show: '显示',
    hide: '隐藏',
    label: '标签',
    value: '值',
    qrCode: '二维码',
    seo: 'SEO设置',
    seoTitle: 'SEO标题',
    seoDescription: 'SEO描述',
    seoImage: 'SEO图片URL',
    qrEnabled: '启用二维码卡片',
    qrTitle: '二维码标题',
    qrSubtitle: '二维码副标题',
    sectionOrder: '部分顺序',
    moveUp: '上移',
    moveDown: '下移',
    contactSNS: 'SNS及额外联系方式',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    blog: '博客',
    phone: '电话号码',
  },
  vi: {
    editor: 'Trình chỉnh sửa',
    theme: 'Chủ đề',
    hero: 'Hero',
    about: 'Giới thiệu',
    career: 'Sự nghiệp',
    portfolio: 'Hồ sơ năng lực',
    strengths: 'Thế mạnh',
    contact: 'Liên hệ',
    save: 'Lưu nháp',
    saving: 'Đang lưu...',
    publish: 'Xuất bản',
    unpublish: 'Hủy xuất bản',
    archive: 'Lưu trữ',
    archiveConfirm: 'Bạn có chắc chắn muốn lưu trữ trang này không? Các trang đã lưu trữ sẽ không được công khai.',
    preview: 'Xem trước',
    backToEditor: 'Quay lại trình chỉnh sửa',
    editing: 'Đang chỉnh sửa',
    published: 'Đã xuất bản',
    draft: 'Bản nháp',
    styleEditor: 'Chỉnh sửa kiểu dáng',
    selectedElement: 'Phần tử đã chọn',
    font: 'Phông chữ',
    size: 'Kích thước',
    weight: 'Độ dày',
    color: 'Màu chữ',
    alignment: 'Căn lề',
    letterSpacing: 'Khoảng cách chữ',
    lineHeight: 'Chiều cao dòng',
    marginBottom: 'Lề dưới',
    marginTop: 'Lề trên',
    resetStyle: 'Đặt lại kiểu dáng',
    layoutSelect: '1. Chọn bố cục',
    themeSelect: '2. Chọn chủ đề màu sắc',
    heroPhoto: 'Ảnh Hero',
    heroLabel: 'Nhãn Hero',
    heroTitle: 'Tiêu đề Hero',
    tagline: 'Tagline',
    aiRecommend: 'AI đề xuất',
    profilePhoto: 'Ảnh hồ sơ',
    aboutTitle: 'Tiêu đề giới thiệu',
    aboutSubtitle: 'Tiêu đề phụ giới thiệu',
    bio: 'Tiểu sử',
    aiWrite: 'AI viết',
    additionalInfo: 'Thông tin thêm',
    height: 'Chiều cao',
    location: 'Vị trí',
    education: 'Học vấn',
    add: 'Thêm',
    period: 'Giai đoạn',
    title: 'Tiêu đề',
    description: 'Mô tả',
    thumbnail: 'URL ảnh thu nhỏ',
    type: 'Loại',
    url: 'URL',
    icon: 'Biểu tượng',
    email: 'Email',
    kakao: 'KakaoTalk',
    instagram: 'Instagram',
    loading: 'Đang tải...',
    error: 'Đã xảy ra lỗi',
    back: 'Quay lại',
    default: 'Mặc định',
    sectionVisibility: 'Hiển thị phần',
    show: 'Hiện',
    hide: 'Ẩn',
    label: 'Nhãn',
    value: 'Giá trị',
    qrCode: 'Mã QR',
    seo: 'Cài đặt SEO',
    seoTitle: 'Tiêu đề SEO',
    seoDescription: 'Mô tả SEO',
    seoImage: 'URL ảnh SEO',
    qrEnabled: 'Hiển thị thẻ QR',
    qrTitle: 'Tiêu đề QR',
    qrSubtitle: 'Tiêu đề phụ QR',
    sectionOrder: 'Thứ tự phần',
    moveUp: 'Lên',
    moveDown: 'Xuống',
    contactSNS: 'SNS & Liên hệ thêm',
    youtube: 'YouTube',
    tiktok: 'TikTok',
    blog: 'Blog',
    phone: 'Số điện thoại',
  }
};

const PALETTE = [
  '#000000', '#FFFFFF', '#666666', '#999999', '#CCCCCC',
  '#FF0000', '#FF6B00', '#FFD600', '#00C853', '#00B0FF',
  '#2962FF', '#D500F9', '#F50057', '#3E2723', '#263238',
  '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A'
];

const STRENGTH_ICONS = ['🎤', '📺', '📻', '🎬', '🌟', '✨', '🔥', '💎', '📢', '💬', '🤝', '📈', '🎯', '💡', '🎨'];

const Builder: React.FC<BuilderProps> = ({ talent, onBack }) => {
  const { user } = useAuth();
  const [page, setPage] = useState<Page | null>(null);
  const [activeTab, setActiveTab] = useState<'theme' | 'hero' | 'about' | 'career' | 'portfolio' | 'strengths' | 'contact' | 'qr' | 'seo'>('theme');
  const [isPreview, setIsPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementStyle, setSelectedElementStyle] = useState<any>(null);
  const [currentLang, setCurrentLang] = useState<'ko' | 'en' | 'ja' | 'zh' | 'vi'>('ko');
  const previewScrollRef = useRef<HTMLDivElement | null>(null);

  const t = TRANSLATIONS[currentLang];

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab) {
      const element = document.getElementById(`sidebar-tab-${activeTab}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchPage = async () => {
      if (!user) {
        console.log('Builder: User not available yet');
        return;
      }
      
      // 최대 2회 재시도 (Firestore 일시적 에러 대응)
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log('Builder: Fetching page for talent:', talent.id, '(attempt', attempt, ')');
          
          const q = query(
            collection(db, 'pages'), 
            where('talentId', '==', talent.id),
            where('agentId', '==', user.uid)
          );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          let pageData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Page;
          console.log('Builder: Page found:', pageData.id);
          
          // Data Migration: Convert details object to array if needed
          if (pageData.content.about.details && !Array.isArray(pageData.content.about.details)) {
            const oldDetails = pageData.content.about.details as any;
            const newDetails = [
              { id: '1', label: '키', value: oldDetails.height || '' },
              { id: '2', label: '위치', value: oldDetails.location || '' },
              { id: '3', label: '학력', value: oldDetails.education || '' },
            ];
            pageData.content.about.details = newDetails;
          }
          
          // Data Migration: Ensure visibleSections exists
          if (!pageData.visibleSections || !pageData.visibleSections.hero) {
            pageData.visibleSections = {
              hero: true,
              about: true,
              career: true,
              portfolio: true,
              strengths: true,
              contact: true,
              ...(pageData.visibleSections || {})
            };
          }

          if (!pageData.sectionOrder) {
            pageData.sectionOrder = ['hero', 'about', 'career', 'portfolio', 'strengths', 'contact'];
          }
          if (!pageData.status) {
            pageData.status = pageData.isPublished ? 'published' : 'draft';
          }
          if (!pageData.seo) {
            pageData.seo = {};
          }
          if (!pageData.qrCard) {
            pageData.qrCard = { enabled: true };
          }
          
          setPage(pageData);
        } else {
          console.log('Builder: No page found, creating new one');
          
          // Fallback for random ID if crypto.randomUUID is not available
          const generateId = () => {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
              return crypto.randomUUID();
            }
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          };

          const newPageId = generateId();
          const baseSlug = slugifyTalentName(talent.nameEn, `talent-${talent.id.substring(0, 5)}`);
          const uniqueSlug = await ensureUniqueSlug(db, baseSlug);

          const newPage: Page = {
            id: newPageId,
            talentId: talent.id,
            agentId: user.uid,
            slug: uniqueSlug,
            layout: 'standard-modern',
            colorScheme: 'elegant-white',
            content: {
              ...INITIAL_CONTENT,
              hero: { ...INITIAL_CONTENT.hero, nameKo: talent.nameKo, nameEn: talent.nameEn },
              contact: { ...INITIAL_CONTENT.contact, email: talent.email || '', phone: talent.phone || '' },
            },
            visibleSections: {
              hero: true,
              about: true,
              career: true,
              portfolio: true,
              strengths: true,
              contact: true
            },
            sectionOrder: ['hero', 'about', 'career', 'portfolio', 'strengths', 'contact'],
            isPublished: false,
            status: 'draft',
            seo: {},
            qrCard: { enabled: true },
            viewsCount: 0,
            createdAt: getISODateString(),
            updatedAt: getISODateString(),
          };
          
          await setDoc(doc(db, 'pages', newPage.id), newPage);
          console.log('Builder: New page created successfully:', newPage.id);
          
          await logAuditEvent({
            db,
            actorId: user.uid,
            actorEmail: user.email || '',
            action: 'create_page',
            targetType: 'page',
            targetId: newPage.id,
            targetLabel: newPage.slug
          });

          setPage(newPage);
        }
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Builder: Error in fetchPage (attempt ${attempt}):`, errMsg);
        
        if (attempt < 2) {
          console.log('Builder: Retrying in 1s...');
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        
        setError(`빌더 로드 실패: ${errMsg}`);
      }
      break; // 성공 시 루프 종료
      }
    };
    
    fetchPage();
  }, [talent, user]);

  const handleUpdateContent = (section: keyof PageContent, data: any) => {
    if (!page) return;
    setPage({
      ...page,
      content: {
        ...page.content,
        [section]: data,
      },
    });
  };

  const handleUpdateStyle = (elementId: string, updates: any) => {
    if (!page) return;
    const currentOverrides = page.styleOverrides || {};
    const elementOverrides = currentOverrides[elementId] || {};
    
    setPage({
      ...page,
      styleOverrides: {
        ...currentOverrides,
        [elementId]: {
          ...elementOverrides,
          ...updates,
        },
      },
    });
  };

  const scrollPreviewToTop = () => {
    previewScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLayoutChange = (layoutId: LayoutId) => {
    if (!page) return;
    setPage({ ...page, layout: layoutId });
    setTimeout(scrollPreviewToTop, 0);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!page) return;
    const order = [...(page.sectionOrder || ['hero', 'about', 'career', 'portfolio', 'strengths', 'contact'])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;
    
    const temp = order[index];
    order[index] = order[newIndex];
    order[newIndex] = temp;
    
    setPage({ ...page, sectionOrder: order });
  };

  const handleToggleSection = (section: string, visible: boolean) => {
    if (!page) return;
    const newVisibility = { 
      hero: true,
      about: true,
      career: true, 
      portfolio: true, 
      strengths: true,
      contact: true,
      ...(page.visibleSections || {}),
      [section]: visible 
    };
    setPage({ ...page, visibleSections: newVisibility });
  };

  useEffect(() => {
    if (!page || !user) return;
    
    // Save to local storage immediately
    localStorage.setItem(`castfolio-page-draft-${page.id}`, JSON.stringify({
      ...page,
      _localUpdatedAt: Date.now()
    }));

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateDoc(doc(db, 'pages', page.id), {
          ...page,
          updatedAt: getISODateString(),
        });
      } catch (error) {
        console.error('Autosave failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [page, user]);

  const handleSave = async () => {
    if (!page || !user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'pages', page.id), {
        ...page,
        status: 'draft',
        updatedAt: getISODateString(),
      });
      setPage({ ...page, status: 'draft' });
      
      await logAuditEvent({
        db,
        actorId: user.uid,
        actorEmail: user.email || '',
        action: 'save_draft',
        targetType: 'page',
        targetId: page.id,
        targetLabel: page.slug
      });
      
      alert('Saved successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!page || !user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'pages', page.id), {
        ...page,
        isPublished: true,
        status: 'published',
        publishedAt: getISODateString(),
        updatedAt: getISODateString(),
      });
      setPage({ ...page, isPublished: true, status: 'published' });
      
      await logAuditEvent({
        db,
        actorId: user.uid,
        actorEmail: user.email || '',
        action: 'publish_page',
        targetType: 'page',
        targetId: page.id,
        targetLabel: page.slug
      });
      
      alert('Published successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!page || !user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'pages', page.id), {
        isPublished: false,
        status: 'draft',
        updatedAt: getISODateString(),
      });
      setPage({ ...page, isPublished: false, status: 'draft' });
      
      await logAuditEvent({
        db,
        actorId: user.uid,
        actorEmail: user.email || '',
        action: 'unpublish_page',
        targetType: 'page',
        targetId: page.id,
        targetLabel: page.slug
      });
      
      alert('Unpublished successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!page || !user) return;
    if (!window.confirm(t.archiveConfirm)) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'pages', page.id), {
        status: 'archived',
        isPublished: false,
        updatedAt: getISODateString(),
      });
      setPage({ ...page, status: 'archived', isPublished: false });
      
      await logAuditEvent({
        db,
        actorId: user.uid,
        actorEmail: user.email || '',
        action: 'archive_page',
        targetType: 'page',
        targetId: page.id,
        targetLabel: page.slug
      });
      
      alert('Archived successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIContent = async (type: 'tagline' | 'bio') => {
    setIsGenerating(true);
    try {
      const prompt = type === 'tagline' 
        ? `${talent.nameKo}님은 ${talent.position}입니다. 방송사 PD에게 어필할 수 있는 짧고 강렬한 한 줄 소개를 3개 추천해주세요. 한국어로만 답변해주세요.`
        : `${talent.nameKo}님은 ${talent.position}입니다. 경력: ${page?.content.career.map(c => c.title).join(', ')}. 이 정보를 바탕으로 전문적이고 따뜻한 자기소개 글을 작성해주세요. 한국어로만 답변해주세요.`;
      
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const text = response.text;
      
      if (type === 'tagline') {
        handleUpdateContent('hero', { ...page?.content.hero, tagline: text?.split('\n')[0].replace(/^\d+\.\s*/, '') || '' });
      } else {
        handleUpdateContent('about', { ...page?.content.about, bio: text || '' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (section: keyof PageContent, field: string, index?: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent: any) => {
          const base64 = readerEvent.target.result;
          if (index !== undefined) {
            const newList = [...(page.content as any)[section]];
            newList[index] = { ...newList[index], [field]: base64 };
            handleUpdateContent(section, newList);
          } else {
            handleUpdateContent(section, { ...(page.content as any)[section], [field]: base64 });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <X size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.error}</h2>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <button 
          onClick={onBack}
          className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
        >
          {t.back}
        </button>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold tracking-widest uppercase opacity-30">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold">{t.editor}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => setActiveTab('theme')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'theme' ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Layout size={18} />
            <span className="font-medium">{t.theme}</span>
          </button>

          <div className="py-2">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-4">Sections</div>
            {(page.sectionOrder || ['hero', 'about', 'career', 'portfolio', 'strengths', 'contact']).map((sectionId, idx) => {
              const icons = { hero: Type, about: Type, career: Briefcase, portfolio: ImageIcon, strengths: Star, contact: Phone };
              const Icon = icons[sectionId as keyof typeof icons] || Layout;
              const label = (t as any)[sectionId];
              const isVisible = page.visibleSections?.[sectionId as keyof typeof page.visibleSections] ?? true;
              
              return (
                <div key={sectionId} className="flex items-center gap-1 mb-1 group">
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMoveSection(idx, 'up')} disabled={idx === 0} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronUp size={12} /></button>
                    <button onClick={() => handleMoveSection(idx, 'down')} disabled={idx === (page.sectionOrder?.length || 6) - 1} className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-30"><ChevronDown size={12} /></button>
                  </div>
                  <button
                    id={`sidebar-tab-${sectionId}`}
                    onClick={() => {
                      setActiveTab(sectionId as any);
                      const element = document.getElementById(`section-${sectionId}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === sectionId ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                  <button
                    onClick={() => handleToggleSection(sectionId, !isVisible)}
                    className={`p-2 rounded-lg transition-colors ${isVisible ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    title={isVisible ? t.hide : t.show}
                  >
                    {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="py-2 border-t border-gray-100">
            {[
              { id: 'qr', icon: QrCode, label: t.qrCode || 'QR 코드' },
              { id: 'seo', icon: Search, label: 'SEO 설정' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
                  activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 space-y-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-black py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            <span>{isSaving ? t.saving : t.save}</span>
          </button>
          
          {page.status === 'published' ? (
            <div className="space-y-3">
              <button 
                onClick={handleUnpublish}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-yellow-100 text-yellow-800 py-3 rounded-xl font-bold hover:bg-yellow-200 transition-all shadow-sm disabled:opacity-50"
              >
                <Eye size={18} />
                <span>{t.unpublish}</span>
              </button>
              <a 
                href={`/p/${page.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                <Globe size={18} />
                <span>결과물 페이지 보기</span>
              </a>
            </div>
          ) : (
            <button 
              onClick={handlePublish}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50"
            >
              <Rocket size={18} />
              <span>{t.publish}</span>
            </button>
          )}

          {page.status !== 'archived' && (
            <button 
              onClick={handleArchive}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50"
            >
              <Trash2 size={18} />
              <span>{t.archive}</span>
            </button>
          )}

          {/* Language Selector */}
          <div className="pt-4 flex items-center justify-center gap-2 border-t border-gray-100">
            {[
              { code: 'ko', label: '한' },
              { code: 'ja', label: '日' },
              { code: 'zh', label: '中' },
              { code: 'vi', label: 'VN' },
              { code: 'en', label: 'EN' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setCurrentLang(lang.code as any)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-bold transition-all ${
                  currentLang === lang.code 
                    ? 'bg-black text-white shadow-md' 
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">{t.editing}: <span className="text-black">{talent.nameKo}</span></span>
            <div className={`w-2 h-2 rounded-full ${page.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-xs uppercase tracking-widest font-bold opacity-50">{page.isPublished ? t.published : t.draft}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1 mr-4">
              <button 
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                <Monitor size={16} />
              </button>
              <button 
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
              >
                <Smartphone size={16} />
              </button>
            </div>
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                isPreview ? 'bg-black text-white' : 'hover:bg-gray-100'
              }`}
            >
              <Eye size={18} />
              <span>{isPreview ? t.backToEditor : t.preview}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Editor Panel */}
          {!isPreview && (
            <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto p-8 flex flex-col gap-8">
              <AnimatePresence mode="wait">
                {activeTab === 'theme' && (
                  <motion.div key="theme" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">{t.layoutSelect}</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {LAYOUTS.map((l, idx) => (
                          <button
                            key={l.id}
                            onClick={() => handleLayoutChange(l.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              page.layout === l.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold">{idx + 1}. {l.name}</span>
                              {page.layout === l.id && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">글꼴: {l.fonts.display}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">{t.themeSelect}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {COLOR_SCHEMES.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setPage({ ...page, colorScheme: c.id })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              page.colorScheme === c.id ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.colors.accent }} />
                              <span className="text-xs font-bold truncate">{c.name}</span>
                            </div>
                            <div className="flex gap-0.5">
                              <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: c.colors.bg, border: '1px solid #eee' }} />
                              <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: c.colors.secondary }} />
                              <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: c.colors.text }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-xl font-bold mb-4">3. 포인트 컬러 커스텀</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={page.accentColor || COLOR_SCHEMES.find(c => c.id === page.colorScheme)?.colors.accent || '#000000'}
                          onChange={(e) => setPage({ ...page, accentColor: e.target.value })}
                          className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">원하는 포인트 색상을 직접 선택하세요.</p>
                          <button
                            onClick={() => setPage({ ...page, accentColor: undefined })}
                            className="text-xs text-gray-500 hover:text-black underline"
                          >
                            테마 기본 색상으로 초기화
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'hero' && (
                  <motion.div key="hero" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <h3 className="text-xl font-bold mb-2">히어로 섹션</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">{t.heroLabel}</label>
                      <input 
                        type="text" 
                        value={page.content.hero.label || ''}
                        onChange={e => handleUpdateContent('hero', { ...page.content.hero, label: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                        placeholder="예: 독보적인 존재"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">{t.heroTitle}</label>
                      <input 
                        type="text" 
                        value={page.content.hero.title || ''}
                        onChange={e => handleUpdateContent('hero', { ...page.content.hero, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                        placeholder="예: KARINA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">히어로 사진</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={page.content.hero.photoUrl}
                          onChange={e => handleUpdateContent('hero', { ...page.content.hero, photoUrl: e.target.value })}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                          placeholder="사진 URL"
                        />
                        <button 
                          onClick={() => handleImageUpload('hero', 'photoUrl')}
                          className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                        >
                          <ImageIcon size={18} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-500">태그라인</label>
                        <button 
                          onClick={() => generateAIContent('tagline')}
                          disabled={isGenerating}
                          className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline disabled:opacity-50"
                        >
                          <Sparkles size={12} />
                          <span>AI 추천</span>
                        </button>
                      </div>
                      <textarea 
                        rows={3}
                        value={page.content.hero.tagline}
                        onChange={e => handleUpdateContent('hero', { ...page.content.hero, tagline: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'about' && (
                  <motion.div key="about" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <h3 className="text-xl font-bold mb-2">소개 섹션</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">{t.aboutTitle}</label>
                      <input 
                        type="text" 
                        value={page.content.about.title || ''}
                        onChange={e => handleUpdateContent('about', { ...page.content.about, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                        placeholder="예: 나의 본질"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">{t.aboutSubtitle}</label>
                      <input 
                        type="text" 
                        value={page.content.about.subtitle || ''}
                        onChange={e => handleUpdateContent('about', { ...page.content.about, subtitle: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                        placeholder="예: The Essence"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">프로필 사진</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={page.content.about.profilePhotoUrl}
                          onChange={e => handleUpdateContent('about', { ...page.content.about, profilePhotoUrl: e.target.value })}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-sm"
                          placeholder="사진 URL"
                        />
                        <button 
                          onClick={() => handleImageUpload('about', 'profilePhotoUrl')}
                          className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                        >
                          <ImageIcon size={18} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-500">자기소개</label>
                        <button 
                          onClick={() => generateAIContent('bio')}
                          disabled={isGenerating}
                          className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline disabled:opacity-50"
                        >
                          <Sparkles size={12} />
                          <span>AI 작성</span>
                        </button>
                      </div>
                      <RichTextField
                        value={page.content.about.bio}
                        onChange={value => handleUpdateContent('about', { ...page.content.about, bio: value })}
                        className="mb-4"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.additionalInfo}</h4>
                        <button 
                          onClick={() => {
                            const newDetails = [...(page.content.about.details || []), { id: crypto.randomUUID(), label: '', value: '' }];
                            handleUpdateContent('about', { ...page.content.about, details: newDetails });
                          }}
                          className="p-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(page.content.about.details || []).map((detail, idx) => (
                          <div key={detail.id} className="flex gap-2 items-start group">
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                value={detail.label}
                                onChange={e => {
                                  const newDetails = [...(page.content.about.details || [])];
                                  newDetails[idx].label = e.target.value;
                                  handleUpdateContent('about', { ...page.content.about, details: newDetails });
                                }}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                placeholder={t.label}
                              />
                              <input 
                                type="text" 
                                value={detail.value}
                                onChange={e => {
                                  const newDetails = [...(page.content.about.details || [])];
                                  newDetails[idx].value = e.target.value;
                                  handleUpdateContent('about', { ...page.content.about, details: newDetails });
                                }}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                placeholder={t.value}
                              />
                            </div>
                            <button 
                              onClick={() => {
                                const newDetails = (page.content.about.details || []).filter(d => d.id !== detail.id);
                                handleUpdateContent('about', { ...page.content.about, details: newDetails });
                              }}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'career' && (
                  <motion.div key="career" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 제목</label>
                        <input 
                          type="text" 
                          value={page.content.careerTitle || ''}
                          onChange={e => handleUpdateContent('careerTitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="CAREER"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 부제목</label>
                        <input 
                          type="text" 
                          value={page.content.careerSubtitle || ''}
                          onChange={e => handleUpdateContent('careerSubtitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="주요 경력 및 활동"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold">경력</h3>
                      <button 
                        onClick={() => {
                          const newCareer = [...page.content.career, { id: crypto.randomUUID(), period: '2024.01', title: '새로운 항목', description: '' }];
                          handleUpdateContent('career', newCareer);
                        }}
                        className="p-2 bg-black text-white rounded-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {page.content.career.map((item, idx) => (
                        <div key={item.id} className="p-4 border border-gray-100 rounded-2xl space-y-3 relative group">
                          <button 
                            onClick={() => {
                              const newCareer = page.content.career.filter(c => c.id !== item.id);
                              handleUpdateContent('career', newCareer);
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                          <input 
                            type="text" 
                            value={item.period}
                            onChange={e => {
                              const newCareer = [...page.content.career];
                              newCareer[idx].period = e.target.value;
                              handleUpdateContent('career', newCareer);
                            }}
                            className="w-full text-sm font-bold bg-transparent outline-none"
                            placeholder="기간"
                          />
                          <input 
                            type="text" 
                            value={item.title}
                            onChange={e => {
                              const newCareer = [...page.content.career];
                              newCareer[idx].title = e.target.value;
                              handleUpdateContent('career', newCareer);
                            }}
                            className="w-full font-medium bg-transparent outline-none"
                            placeholder="제목"
                          />
                          <RichTextField
                            value={item.description}
                            onChange={value => {
                              const newCareer = [...page.content.career];
                              newCareer[idx].description = value;
                              handleUpdateContent('career', newCareer);
                            }}
                            className="w-full text-sm text-gray-500 bg-transparent outline-none"
                            placeholder="설명"
                          />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ImageIcon size={14} className="text-gray-400" />
                              <input 
                                type="text" 
                                value={item.thumbnail || ''}
                                onChange={e => {
                                  const newCareer = [...page.content.career];
                                  newCareer[idx].thumbnail = e.target.value;
                                  handleUpdateContent('career', newCareer);
                                }}
                                className="flex-1 text-xs text-gray-500 bg-transparent outline-none border-b border-gray-100 pb-1"
                                placeholder="이미지 URL"
                              />
                              <button 
                                onClick={() => handleImageUpload('career', 'thumbnail', idx)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <ImageIcon size={14} className="text-gray-400" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Youtube size={14} className="text-red-500" />
                              <input 
                                type="text" 
                                value={item.youtubeUrl || ''}
                                onChange={e => {
                                  const newCareer = [...page.content.career];
                                  newCareer[idx].youtubeUrl = e.target.value;
                                  handleUpdateContent('career', newCareer);
                                }}
                                className="flex-1 text-xs text-gray-500 bg-transparent outline-none border-b border-gray-100 pb-1"
                                placeholder="YouTube URL"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <LinkIcon size={14} className="text-blue-500" />
                              <input 
                                type="text" 
                                value={item.websiteUrl || ''}
                                onChange={e => {
                                  const newCareer = [...page.content.career];
                                  newCareer[idx].websiteUrl = e.target.value;
                                  handleUpdateContent('career', newCareer);
                                }}
                                className="flex-1 text-xs text-gray-500 bg-transparent outline-none border-b border-gray-100 pb-1"
                                placeholder="홈페이지 URL"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'portfolio' && (
                  <motion.div key="portfolio" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 제목</label>
                        <input 
                          type="text" 
                          value={page.content.portfolioTitle || ''}
                          onChange={e => handleUpdateContent('portfolioTitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="PORTFOLIO"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 부제목</label>
                        <input 
                          type="text" 
                          value={page.content.portfolioSubtitle || ''}
                          onChange={e => handleUpdateContent('portfolioSubtitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="작업물 및 포트폴리오"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold">포트폴리오</h3>
                      <button 
                        onClick={() => {
                          const newItem = { id: crypto.randomUUID(), type: 'image' as const, url: 'https://picsum.photos/seed/new/800/600', title: '새로운 작업' };
                          handleUpdateContent('portfolio', [...page.content.portfolio, newItem]);
                        }}
                        className="p-2 bg-black text-white rounded-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {page.content.portfolio.map((item, idx) => (
                        <div key={item.id} className="p-4 border border-gray-100 rounded-2xl space-y-3 relative group">
                          <button 
                            onClick={() => {
                              const newPortfolio = page.content.portfolio.filter(p => p.id !== item.id);
                              handleUpdateContent('portfolio', newPortfolio);
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                          <div className="flex gap-2 mb-2">
                            <select
                              value={item.type}
                              onChange={e => {
                                const newPortfolio = [...page.content.portfolio];
                                newPortfolio[idx].type = e.target.value as 'image' | 'video';
                                handleUpdateContent('portfolio', newPortfolio);
                              }}
                              className="text-xs border border-gray-200 rounded px-2 py-1 outline-none"
                            >
                              <option value="image">이미지</option>
                              <option value="video">비디오</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={item.url}
                              onChange={e => {
                                const newPortfolio = [...page.content.portfolio];
                                newPortfolio[idx].url = e.target.value;
                                handleUpdateContent('portfolio', newPortfolio);
                              }}
                              className="flex-1 text-xs text-gray-400 bg-transparent outline-none border-b border-gray-100 pb-1"
                              placeholder={item.type === 'image' ? "이미지 URL" : "YouTube/Vimeo/MP4 URL"}
                            />
                            {item.type === 'image' && (
                              <button 
                                onClick={() => handleImageUpload('portfolio', 'url', idx)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <ImageIcon size={14} className="text-gray-400" />
                              </button>
                            )}
                          </div>
                          <input 
                            type="text" 
                            value={item.title}
                            onChange={e => {
                              const newPortfolio = [...page.content.portfolio];
                              newPortfolio[idx].title = e.target.value;
                              handleUpdateContent('portfolio', newPortfolio);
                            }}
                            className="w-full font-medium bg-transparent outline-none"
                            placeholder="제목"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'strengths' && (
                  <motion.div key="strengths" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 제목</label>
                        <input 
                          type="text" 
                          value={page.content.strengthsTitle || ''}
                          onChange={e => handleUpdateContent('strengthsTitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="STRENGTHS"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 부제목</label>
                        <input 
                          type="text" 
                          value={page.content.strengthsSubtitle || ''}
                          onChange={e => handleUpdateContent('strengthsSubtitle', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="나만의 강점과 매력"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold">강점</h3>
                      <button 
                        onClick={() => {
                          const newItem = { id: crypto.randomUUID(), icon: '🌟', title: '새로운 강점', description: '설명을 입력하세요' };
                          handleUpdateContent('strengths', [...page.content.strengths, newItem]);
                        }}
                        className="p-2 bg-black text-white rounded-lg"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {page.content.strengths.map((item, idx) => (
                        <div key={item.id} className="p-4 border border-gray-100 rounded-2xl space-y-3 relative group">
                          <button 
                            onClick={() => {
                              const newStrengths = page.content.strengths.filter(s => s.id !== item.id);
                              handleUpdateContent('strengths', newStrengths);
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex flex-wrap gap-2 flex-1">
                              {STRENGTH_ICONS.map((icon) => (
                                <button
                                  key={icon}
                                  onClick={() => {
                                    const newStrengths = [...page.content.strengths];
                                    newStrengths[idx].icon = icon;
                                    handleUpdateContent('strengths', newStrengths);
                                  }}
                                  className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                                    item.icon === icon ? 'border-black bg-gray-50 scale-110' : 'border-gray-100 hover:border-gray-300'
                                  }`}
                                >
                                  <span className="text-xl">{icon}</span>
                                </button>
                              ))}
                            </div>
                            <div className="w-16">
                              <label className="block text-[10px] text-gray-400 uppercase mb-1">직접입력</label>
                              <input 
                                type="text" 
                                value={item.icon}
                                onChange={e => {
                                  const newStrengths = [...page.content.strengths];
                                  newStrengths[idx].icon = e.target.value;
                                  handleUpdateContent('strengths', newStrengths);
                                }}
                                className="w-full h-10 text-center rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black"
                                placeholder="🌟"
                              />
                            </div>
                          </div>
                          <input 
                            type="text" 
                            value={item.title}
                            onChange={e => {
                              const newStrengths = [...page.content.strengths];
                              newStrengths[idx].title = e.target.value;
                              handleUpdateContent('strengths', newStrengths);
                            }}
                            className="w-full font-bold bg-transparent outline-none"
                            placeholder="강점 제목"
                          />
                          <RichTextField
                            value={item.description}
                            onChange={value => {
                              const newStrengths = [...page.content.strengths];
                              newStrengths[idx].description = value;
                              handleUpdateContent('strengths', newStrengths);
                            }}
                            className="w-full text-sm text-gray-500 bg-transparent outline-none"
                            placeholder="강점 설명"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'contact' && (
                  <motion.div key="contact" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 제목</label>
                        <input 
                          type="text" 
                          value={page.content.contact.title || ''}
                          onChange={e => handleUpdateContent('contact', { ...page.content.contact, title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="CONTACT"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">섹션 부제목</label>
                        <input 
                          type="text" 
                          value={page.content.contact.subtitle || ''}
                          onChange={e => handleUpdateContent('contact', { ...page.content.contact, subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-black"
                          placeholder="함께 일하고 싶다면 연락주세요"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">연락처 정보</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">이메일</label>
                      <input 
                        type="email" 
                        value={page.content.contact.email}
                        onChange={e => handleUpdateContent('contact', { ...page.content.contact, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">전화번호</label>
                      <input 
                        type="tel" 
                        value={page.content.contact.phone || ''}
                        onChange={e => handleUpdateContent('contact', { ...page.content.contact, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                        placeholder="010-0000-0000"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                        <MessageCircle size={16} className="text-yellow-500" />
                        <span>카카오톡 오픈채팅 (우측 하단 플로팅 버튼)</span>
                      </label>
                      <input 
                        type="text" 
                        value={page.content.contact.kakaoOpenChat}
                        onChange={e => handleUpdateContent('contact', { ...page.content.contact, kakaoOpenChat: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                        placeholder="https://open.kakao.com/o/..."
                      />
                      <p className="text-[10px] text-gray-400 mt-1">오픈채팅 링크를 입력하면 페이지 우측 하단에 '연락하기' 버튼이 나타납니다.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">인스타그램</label>
                      <input 
                        type="text" 
                        value={page.content.contact.instagram}
                        onChange={e => handleUpdateContent('contact', { ...page.content.contact, instagram: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">유튜브</label>
                      <input 
                        type="text" 
                        value={page.content.contact.youtube || ''}
                        onChange={e => handleUpdateContent('contact', { ...page.content.contact, youtube: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">틱톡</label>
                      <input 
                        type="text" 
                        value={page.content.contact.tiktok || ''}
                        onChange={e => handleUpdateContent('contact', { ...page.content.contact, tiktok: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">블로그</label>
                      <input 
                        type="text" 
                        value={page.content.contact.blog || ''}
                        onChange={e => handleUpdateContent('contact', { ...page.content.contact, blog: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                {activeTab === 'qr' && (
                  <motion.div key="qr" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <h3 className="text-xl font-bold mb-2">QR 카드 설정</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">카드 제목</label>
                        <input 
                          type="text" 
                          value={page.qrCard?.title || ''}
                          onChange={e => setPage({ ...page, qrCard: { ...page.qrCard, enabled: true, title: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                          placeholder={talent.nameEn || page.content.hero.nameEn || 'Portfolio'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">카드 부제목</label>
                        <input 
                          type="text" 
                          value={page.qrCard?.subtitle || ''}
                          onChange={e => setPage({ ...page, qrCard: { ...page.qrCard, enabled: true, subtitle: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                          placeholder={talent.position || page.content.hero.tagline || 'Scan to view'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">연결할 링크 (URL)</label>
                        <input 
                          type="text" 
                          value={page.content.contact.qrCodeUrl || ''}
                          onChange={e => handleUpdateContent('contact', { ...page.content.contact, qrCodeUrl: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                          placeholder={`${window.location.origin}/p/${page.slug}`}
                        />
                        <p className="text-xs text-gray-400 mt-2">기본값은 현재 공개 페이지 주소입니다.</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-4">미리보기 및 다운로드</h4>
                      <div className="bg-gray-50 p-6 rounded-2xl flex justify-center">
                        <QRCodeCard 
                          page={page} 
                          talent={talent} 
                          publicUrl={page.content.contact.qrCodeUrl || `${window.location.origin}/p/${page.slug}`} 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'seo' && (
                  <motion.div key="seo" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <h3 className="text-xl font-bold mb-2">SEO 및 공유 설정</h3>
                    <p className="text-sm text-gray-500 mb-6">링크를 공유할 때 표시되는 정보를 설정합니다.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">페이지 제목 (Title)</label>
                        <input 
                          type="text" 
                          value={page.seo?.title || ''}
                          onChange={e => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                          placeholder={`${talent.nameKo} | ${talent.position}`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">페이지 설명 (Description)</label>
                        <textarea 
                          rows={3}
                          value={page.seo?.description || ''}
                          onChange={e => setPage({ ...page, seo: { ...page.seo, description: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none"
                          placeholder={page.content.hero.tagline || '포트폴리오입니다.'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">공유 이미지 URL (OG Image)</label>
                        <input 
                          type="text" 
                          value={page.seo?.imageUrl || ''}
                          onChange={e => setPage({ ...page, seo: { ...page.seo, imageUrl: e.target.value } })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                          placeholder={page.content.hero.photoUrl || 'https://...'}
                        />
                        <p className="text-xs text-gray-400 mt-2">카카오톡, 페이스북 등에 공유될 때 표시되는 썸네일 이미지입니다.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>




              {selectedElementId && (
                <motion.div 
                  key="style-editor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 pt-8 border-t-2 border-gray-200 mt-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">{t.styleEditor}</h3>
                    <button 
                      onClick={() => setSelectedElementId(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t.selectedElement}</p>
                    <p className="font-mono text-sm text-black">{selectedElementId}</p>
                  </div>

                  {/* Font Family */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <TypeIcon size={16} />
                      <span>{t.font}</span>
                    </label>
                    <select 
                      value={page.styleOverrides?.[selectedElementId]?.fontFamily || selectedElementStyle?.fontFamily || ''}
                      onChange={(e) => handleUpdateStyle(selectedElementId, { fontFamily: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none bg-white"
                    >
                      <option value="">{t.default} ({selectedElementStyle?.fontFamily || 'Default'})</option>
                      {KOREAN_FONTS.map(font => (
                        <option key={font.value} value={font.value}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <TypeIcon size={16} />
                        <span>{t.size}</span>
                      </label>
                      <select 
                        value={page.styleOverrides?.[selectedElementId]?.fontSize || selectedElementStyle?.fontSize || ''}
                        onChange={(e) => handleUpdateStyle(selectedElementId, { fontSize: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none bg-white"
                      >
                        <option value="">{t.default} ({selectedElementStyle?.fontSize || 'Default'})</option>
                        {['0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '2rem', '2.5rem', '3rem', '4rem', '5rem', '6rem', '8rem', '9rem', '10rem', '12rem', '14rem', '16rem'].map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <Bold size={16} />
                        <span>{t.weight}</span>
                      </label>
                      <select 
                        value={page.styleOverrides?.[selectedElementId]?.fontWeight || selectedElementStyle?.fontWeight || ''}
                        onChange={(e) => handleUpdateStyle(selectedElementId, { fontWeight: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none bg-white"
                      >
                        <option value="">{t.default} ({selectedElementStyle?.fontWeight || 'Default'})</option>
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">SemiBold</option>
                        <option value="700">Bold</option>
                        <option value="800">ExtraBold</option>
                        <option value="900">Black</option>
                      </select>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <Palette size={16} />
                      <span>{t.color}</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {PALETTE.map(color => (
                        <button
                          key={color}
                          onClick={() => handleUpdateStyle(selectedElementId, { color })}
                          className={`w-full aspect-square rounded-lg border border-gray-100 shadow-sm transition-transform hover:scale-110 ${
                            page.styleOverrides?.[selectedElementId]?.color === color ? 'ring-2 ring-black ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <details className="group">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-black transition-colors list-none flex items-center gap-1">
                        <Plus size={12} />
                        <span>Advanced Color</span>
                      </summary>
                      <div className="flex gap-2 mt-3">
                        <input 
                          type="color"
                          value={page.styleOverrides?.[selectedElementId]?.color || '#000000'}
                          onChange={(e) => handleUpdateStyle(selectedElementId, { color: e.target.value })}
                          className="w-12 h-12 rounded-xl border border-gray-200 p-1 bg-white cursor-pointer"
                        />
                        <input 
                          type="text"
                          value={page.styleOverrides?.[selectedElementId]?.color || ''}
                          onChange={(e) => handleUpdateStyle(selectedElementId, { color: e.target.value })}
                          placeholder="#000000"
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                        />
                      </div>
                    </details>
                  </div>

                  {/* Alignment */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                      <AlignCenter size={16} />
                      <span>{t.alignment}</span>
                    </label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      {[
                        { id: 'left', icon: AlignLeft },
                        { id: 'center', icon: AlignCenter },
                        { id: 'right', icon: AlignRight },
                      ].map((align) => (
                        <button
                          key={align.id}
                          onClick={() => handleUpdateStyle(selectedElementId, { textAlign: align.id as any })}
                          className={`flex-1 flex justify-center py-2 rounded-lg transition-all ${
                            page.styleOverrides?.[selectedElementId]?.textAlign === align.id ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <align.icon size={18} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spacing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <MoveHorizontal size={16} />
                        <span>{t.letterSpacing}</span>
                      </label>
                      <input 
                        type="text"
                        placeholder="예: 0.1em"
                        value={page.styleOverrides?.[selectedElementId]?.letterSpacing || ''}
                        onChange={(e) => handleUpdateStyle(selectedElementId, { letterSpacing: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <MoveVertical size={16} />
                        <span>{t.lineHeight}</span>
                      </label>
                      <input 
                        type="text"
                        placeholder="예: 1.2"
                        value={page.styleOverrides?.[selectedElementId]?.lineHeight || ''}
                        onChange={(e) => handleUpdateStyle(selectedElementId, { lineHeight: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                  </div>

                  {/* Margins & Position */}
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <MoveVertical size={16} />
                        <span>{t.marginTop}</span>
                      </label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const current = parseInt(String(page.styleOverrides?.[selectedElementId]?.marginTop || '0')) || 0;
                            handleUpdateStyle(selectedElementId, { marginTop: `${current - 8}px` });
                          }}
                          className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <input 
                          type="text"
                          placeholder="예: 2rem"
                          value={page.styleOverrides?.[selectedElementId]?.marginTop || ''}
                          onChange={(e) => handleUpdateStyle(selectedElementId, { marginTop: e.target.value })}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-center"
                        />
                        <button 
                          onClick={() => {
                            const current = parseInt(String(page.styleOverrides?.[selectedElementId]?.marginTop || '0')) || 0;
                            handleUpdateStyle(selectedElementId, { marginTop: `${current + 8}px` });
                          }}
                          className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <MoveVertical size={16} />
                        <span>{t.marginBottom}</span>
                      </label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const current = parseInt(String(page.styleOverrides?.[selectedElementId]?.marginBottom || '0')) || 0;
                            handleUpdateStyle(selectedElementId, { marginBottom: `${current - 8}px` });
                          }}
                          className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <ChevronUp size={18} />
                        </button>
                        <input 
                          type="text"
                          placeholder="예: 2rem"
                          value={page.styleOverrides?.[selectedElementId]?.marginBottom || ''}
                          onChange={(e) => handleUpdateStyle(selectedElementId, { marginBottom: e.target.value })}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none text-center"
                        />
                        <button 
                          onClick={() => {
                            const current = parseInt(String(page.styleOverrides?.[selectedElementId]?.marginBottom || '0')) || 0;
                            handleUpdateStyle(selectedElementId, { marginBottom: `${current + 8}px` });
                          }}
                          className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      const newOverrides = { ...page.styleOverrides };
                      delete newOverrides[selectedElementId];
                      setPage({ ...page, styleOverrides: newOverrides });
                    }}
                    className="w-full py-3 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all"
                  >
                    {t.resetStyle}
                  </button>
                </motion.div>
              )}

            </div>
          )}

          {/* Preview Panel */}
          <div className={`flex-1 bg-gray-200 overflow-y-auto p-12 transition-all ${isPreview ? 'p-0' : ''}`}>
            <div className={`mx-auto bg-white shadow-2xl transition-all ${
              isPreview 
                ? 'w-full h-full' 
                : previewDevice === 'mobile' 
                  ? 'w-[375px] h-[667px] rounded-[40px] border-[12px] border-black overflow-hidden relative' 
                  : 'w-full max-w-[1200px] rounded-2xl overflow-hidden h-[800px]'
            }`}>
              <div ref={previewScrollRef} className="h-full overflow-y-auto custom-scrollbar">
                <PRPage 
                  page={page} 
                  onSelectElement={(id, style) => {
                    setSelectedElementId(id);
                    setSelectedElementStyle(style);
                    const section = id.split('-')[0];
                    if (['hero', 'about', 'career', 'portfolio', 'strengths', 'contact'].includes(section)) {
                      setActiveTab(section as any);
                    }
                  }}
                  onUpdateStyle={handleUpdateStyle}
                  selectedElementId={selectedElementId}
                  isMobile={previewDevice === 'mobile'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
