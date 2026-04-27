import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Page, PricingPlan, UserProfile, PayoutInfo, CheckoutSession, PaymentMethod } from '../../types';
import { ShoppingCart, CreditCard, Building2, AlertCircle, CheckCircle, ExternalLink, ArrowLeft, Tag, RefreshCcw, Star, Zap, Layout, Sparkles, Check, ArrowRight, Play, Image as ImageIcon } from 'lucide-react';
import { formatKRW, calculateDiscountPercent } from '../../lib/sales';
import { getISODateString } from '../../lib/date';
import { validateEmail, validatePhone } from '../../lib/validators';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutPageProps {
  pageSlug?: string;
  agentId?: string;
}

type Step = 'select_plan' | 'buyer_info' | 'payment' | 'complete';

const PromotionContent = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black text-white px-6 py-20">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070" 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase mb-6">
              Next-Gen PR Platform for Talents
            </span>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] md:leading-[0.9] mb-8 break-keep" style={{ wordBreak: 'keep-all' }}>
              당신의 가치를 <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                가장 완벽하게
              </span> 증명하세요
            </h1>
            <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed break-keep">
              아나운서, 쇼호스트, 크리에이터를 위한 프리미엄 PR 페이지 제작 솔루션. 
              세련된 디자인과 전문적인 구성으로 당신의 커리어를 완성합니다.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button 
                onClick={onStart}
                className="w-full md:w-auto px-10 py-5 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-2xl shadow-white/10"
              >
                지금 바로 시작하기
                <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-black" referrerPolicy="no-referrer" />
                  ))}
                </div>
                <span>500+ 명의 전문가가 선택함</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why CastFolio? */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-12">왜 CastFolio인가요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold">압도적인 첫인상</h3>
              <p className="text-gray-500 leading-relaxed break-keep">
                단순한 링크가 아닙니다. 방송사 PD와 광고주가 당신의 전문성을 한눈에 파악할 수 있도록 설계된 프리미엄 레이아웃을 제공합니다.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold">세련된 전문성</h3>
              <p className="text-gray-500 leading-relaxed break-keep">
                복잡한 과정 없이 당신의 경력을 가장 세련된 방식으로 시각화합니다. 당신의 가치를 증명하는 가장 스마트한 방법입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Themes Showcase */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 break-keep">전문성을 극대화하는 3가지 테마</h2>
            <p className="text-xl text-gray-500 break-keep">당신의 색깔에 맞는 최적의 레이아웃을 선택하세요.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Minimal Theme */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&q=80&w=800" 
                  alt="Minimal Theme Example" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 block">MINIMAL THEME</span>
                  <h3 className="text-2xl font-bold text-white mb-1">Professional Talent</h3>
                  <p className="text-sm text-gray-300">신뢰와 정갈함이 돋보이는 뉴스/행사 전문</p>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-green-500" /> 그리드 기반의 정갈한 레이아웃
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-green-500" /> 텍스트 중심의 가독성 극대화
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-green-500" /> 모던한 타이포그래피 시스템
                  </li>
                </ul>
                <button 
                  onClick={() => window.open('/demo/minimal-grid', '_blank')}
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 hover:bg-gray-100 transition-colors group/btn"
                >
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 group-hover/btn:text-indigo-600">실제 구조 미리보기</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="h-2 w-full bg-gray-200 rounded-full"></div>
                      <div className="h-2 w-2/3 bg-gray-200 rounded-full"></div>
                    </div>
                    <ExternalLink size={16} className="text-gray-300 ml-4 group-hover/btn:text-indigo-600" />
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Diva Theme */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-indigo-500/20 group relative"
            >
              <div className="absolute top-6 right-6 z-20 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">BEST CHOICE</div>
              <div className="aspect-[3/4] relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1508002366002-f5a3c04b935f?auto=format&fit=crop&q=80&w=800" 
                  alt="Diva Theme Example" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2 block">DIVA THEME</span>
                  <h3 className="text-2xl font-bold text-white mb-1">Premium Showhost</h3>
                  <p className="text-sm text-gray-200">화려한 비주얼과 에너지가 넘치는 라이브 커머스</p>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-indigo-500" /> 풀스크린 비주얼 임팩트
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-indigo-500" /> 다이내믹한 스크롤 애니메이션
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-indigo-500" /> 프리미엄 골드/블랙 테마 컬러
                  </li>
                </ul>
                <button 
                  onClick={() => window.open('/demo/diva-luxe', '_blank')}
                  className="w-full p-4 bg-indigo-50 rounded-2xl border border-dashed border-indigo-100 hover:bg-indigo-100 transition-colors group/btn"
                >
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2 group-hover/btn:text-indigo-600">실제 구조 미리보기</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-full bg-indigo-100 rounded-lg"></div>
                      <div className="h-4 w-2/3 bg-indigo-100 rounded-lg"></div>
                    </div>
                    <ExternalLink size={16} className="text-indigo-300 ml-4 group-hover/btn:text-indigo-600" />
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Artistic Theme */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1516534775068-ba3e84529519?auto=format&fit=crop&q=80&w=800" 
                  alt="Artistic Theme Example" 
                  className="w-full h-full object-cover group-hover:rotate-2 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 block">ARTISTIC THEME</span>
                  <h3 className="text-2xl font-bold text-white mb-1">Creative Artist</h3>
                  <p className="text-sm text-gray-200">감각적이고 트렌디한 뷰티/패션 아이콘</p>
                </div>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-purple-500" /> 비정형적인 예술적 레이아웃
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-purple-500" /> 유니크한 오버랩 요소들
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <Check size={18} className="text-purple-500" /> 트렌디한 그라데이션 포인트
                  </li>
                </ul>
                <button 
                  onClick={() => window.open('/demo/artistic-dark', '_blank')}
                  className="w-full p-4 bg-purple-50 rounded-2xl border border-dashed border-purple-100 hover:bg-purple-100 transition-colors group/btn"
                >
                  <p className="text-[10px] font-bold text-purple-400 uppercase mb-2 group-hover/btn:text-indigo-600">실제 구조 미리보기</p>
                  <div className="flex items-center justify-between">
                    <div className="relative h-10 flex-1">
                      <div className="absolute top-0 left-0 w-8 h-8 bg-purple-200 rounded-full opacity-50"></div>
                      <div className="absolute bottom-0 right-4 w-10 h-4 bg-purple-200 rounded-full"></div>
                    </div>
                    <ExternalLink size={16} className="text-gray-300 ml-4 group-hover/btn:text-indigo-600" />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Zap className="text-yellow-500" />, title: "세련된 디자인", desc: "당신의 가치를 가장 우아하게 표현하는 프리미엄 디자인" },
              { icon: <Layout className="text-indigo-500" />, title: "반응형 최적화", desc: "모바일, 태블릿, PC 어디서나 완벽한 레이아웃" },
              { icon: <Sparkles className="text-purple-500" />, title: "전문적인 인상", desc: "클라이언트에게 신뢰를 주는 체계적인 포트폴리오 구성" },
              { icon: <Star className="text-orange-500" />, title: "프리미엄 도메인", desc: "나만의 고유한 URL로 전문성을 더하세요" },
            ].map((f, i) => (
              <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed break-keep">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6 bg-black text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-8 break-keep">지금 당신의 커리어를 <br className="hidden md:block" />새롭게 정의하세요.</h2>
          <button 
            onClick={onStart}
            className="w-full md:w-auto px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-colors shadow-2xl shadow-indigo-500/20"
          >
            가격 플랜 확인하기
          </button>
        </div>
      </section>
    </div>
  );
};

const CheckoutPage: React.FC<CheckoutPageProps> = ({ pageSlug, agentId }) => {
  const [page, setPage] = useState<Page | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [agentProfile, setAgentProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(true);

  const [step, setStep] = useState<Step>('select_plan');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutSession | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        let currentAgentId = agentId;
        let pageData: Page | null = null;

        if (pageSlug) {
          // 1. 페이지 조회
          const pageQ = query(collection(db, 'pages'), where('slug', '==', pageSlug), where('isPublished', '==', true));
          const pageSnap = await getDocs(pageQ);
          if (pageSnap.empty) { setError('페이지를 찾을 수 없습니다.'); setLoading(false); return; }
          pageData = { id: pageSnap.docs[0].id, ...pageSnap.docs[0].data() } as Page;
          if (!pageData.isPublished) { setError('이 페이지는 아직 공개되지 않았습니다.'); setLoading(false); return; }
          setPage(pageData);
          currentAgentId = pageData.agentId;
        }

        if (!currentAgentId) {
          setError('잘못된 접근입니다.'); setLoading(false); return;
        }

        // 2. 가격 메뉴 조회
        const plansQ = query(collection(db, 'pricing_plans'), where('agentId', '==', currentAgentId), where('isActive', '==', true));
        const plansSnap = await getDocs(plansQ);
        const allPlans = plansSnap.docs.map(d => ({ id: d.id, ...d.data() } as PricingPlan));
        
        let filtered = allPlans;
        if (pageData) {
          // talent 전용 + 공통 필터
          filtered = allPlans.filter(p => !p.talentId || p.talentId === pageData!.talentId);
        } else {
          // 공통 메뉴만
          filtered = allPlans.filter(p => !p.talentId);
        }
        filtered.sort((a, b) => a.sortOrder - b.sortOrder);
        setPlans(filtered);

        // 3. agent 프로필 (결제수단)
        const userDoc = await getDoc(doc(db, 'users', currentAgentId));
        if (userDoc.exists()) {
          setAgentProfile(userDoc.data() as UserProfile);
        }
      } catch (err) {
        console.error(err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pageSlug, agentId]);

  const payoutInfo: PayoutInfo = agentProfile?.payoutInfo || {};

  // 사용 가능한 결제수단 목록
  const availableMethods: { method: PaymentMethod; label: string; icon: React.ReactNode }[] = [];
  if (payoutInfo.bankName && payoutInfo.accountNumber) {
    availableMethods.push({ method: 'bank_transfer', label: '계좌이체', icon: <Building2 size={18} /> });
  }
  if (payoutInfo.tossPaymentLink) {
    availableMethods.push({ method: 'toss', label: '토스', icon: <CreditCard size={18} /> });
  }
  if (payoutInfo.kakaoPayPaymentLink) {
    availableMethods.push({ method: 'kakaopay', label: '카카오페이', icon: <CreditCard size={18} /> });
  }
  if (payoutInfo.naverPayPaymentLink) {
    availableMethods.push({ method: 'naverpay', label: '네이버페이', icon: <CreditCard size={18} /> });
  }
  if (payoutInfo.cardPaymentLink) {
    availableMethods.push({ method: 'card', label: '카드결제', icon: <CreditCard size={18} /> });
  }

  const validateBuyerInfo = (): boolean => {
    const errs: Record<string, string> = {};
    if (!buyerName.trim()) errs.name = '이름을 입력하세요';
    if (!buyerPhone.trim() || !validatePhone(buyerPhone)) errs.phone = '올바른 연락처를 입력하세요';
    if (!buyerEmail.trim() || !validateEmail(buyerEmail)) errs.email = '올바른 이메일을 입력하세요';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitCheckout = async () => {
    const currentAgentId = page?.agentId || agentId;
    if (!currentAgentId || !selectedPlan || !selectedMethod) return;
    setSubmitting(true);
    try {
      const amount = selectedPlan.salePrice ?? selectedPlan.basePrice;
      const sessionData = {
        agentId: currentAgentId,
        talentId: page?.talentId || selectedPlan.talentId || null,
        pageId: page?.id || null,
        pricingPlanId: selectedPlan.id,
        pricingPlanSnapshot: selectedPlan,
        buyerName: buyerName.trim(),
        buyerPhone: buyerPhone.trim(),
        buyerEmail: buyerEmail.trim(),
        amount,
        paymentMethod: selectedMethod,
        provider: selectedMethod === 'bank_transfer' ? 'platform_manual' as const : 'external_link' as const,
        status: 'created' as const,
        paymentInstructionSnapshot: payoutInfo,
        createdAt: getISODateString(),
        updatedAt: getISODateString(),
      };
      // Remove undefined/null values for Firestore
      const cleanSessionData = Object.fromEntries(Object.entries(sessionData).filter(([_, v]) => v != null));
      const ref = await addDoc(collection(db, 'checkout_sessions'), cleanSessionData);
      setCheckoutResult({ id: ref.id, ...sessionData } as CheckoutSession);
      setStep('complete');
    } catch (err) {
      console.error(err);
      alert('결제 요청 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPaymentLink = (method: PaymentMethod): string | undefined => {
    if (method === 'toss') return payoutInfo.tossPaymentLink;
    if (method === 'kakaopay') return payoutInfo.kakaoPayPaymentLink;
    if (method === 'naverpay') return payoutInfo.naverPayPaymentLink;
    if (method === 'card') return payoutInfo.cardPaymentLink;
    return undefined;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-indigo-600" size={40} />
          <p className="text-gray-500 font-bold">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">오류</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (showPromo) {
    return <PromotionContent onStart={() => setShowPromo(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="font-bold">홈페이지 제작 신청</h1>
            <p className="text-xs text-gray-400">맞춤형 PR 홈페이지를 제작해드립니다</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* 단계 표시 */}
        <div className="flex items-center gap-2 mb-8">
          {(['select_plan', 'buyer_info', 'payment', 'complete'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-black text-white' : i < ['select_plan', 'buyer_info', 'payment', 'complete'].indexOf(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</div>
              {i < 3 && <div className={`flex-1 h-0.5 ${i < ['select_plan', 'buyer_info', 'payment', 'complete'].indexOf(step) ? 'bg-green-500' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1: 메뉴 선택 */}
        {step === 'select_plan' && (
          <div>
            <h2 className="text-2xl font-bold mb-2">서비스를 선택하세요</h2>
            <p className="text-gray-500 mb-6">PR 홈페이지 제작 메뉴</p>
            {plans.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-gray-500">현재 이용 가능한 메뉴가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map(plan => (
                  <button key={plan.id} onClick={() => { setSelectedPlan(plan); setStep('buyer_info'); }}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-6 text-left hover:border-black hover:shadow-lg transition-all group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">{plan.title}</span>
                          {plan.badge && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{plan.badge}</span>}
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
                        <div className="flex items-baseline gap-2">
                          {plan.salePrice ? (
                            <>
                              <span className="text-2xl font-black">{formatKRW(plan.salePrice)}</span>
                              <span className="text-sm text-gray-400 line-through">{formatKRW(plan.basePrice)}</span>
                              <span className="text-sm text-red-500 font-bold">-{calculateDiscountPercent(plan.basePrice, plan.salePrice)}%</span>
                            </>
                          ) : (
                            <span className="text-2xl font-black">{formatKRW(plan.basePrice)}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {plan.revisionPolicy.firstRevisionFree ? `첫 ${plan.revisionPolicy.includedRevisionCount}회 수정 무료` : ''}
                          {plan.revisionPolicy.extraRevisionPrice > 0 ? ` · 추가 수정 ${formatKRW(plan.revisionPolicy.extraRevisionPrice)}` : ''}
                        </p>
                      </div>
                      <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ShoppingCart size={20} className="text-black" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: 구매자 정보 */}
        {step === 'buyer_info' && selectedPlan && (
          <div>
            <h2 className="text-2xl font-bold mb-2">연락처 정보를 입력하세요</h2>
            <p className="text-gray-500 mb-6">선택 메뉴: {selectedPlan.title} — {formatKRW(selectedPlan.salePrice ?? selectedPlan.basePrice)}</p>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input type="text" value={buyerName} onChange={e => { setBuyerName(e.target.value); setFormErrors(p => ({ ...p, name: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.name ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-black outline-none`} placeholder="홍길동" />
                {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
                <input type="tel" value={buyerPhone} onChange={e => { setBuyerPhone(e.target.value); setFormErrors(p => ({ ...p, phone: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.phone ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-black outline-none`} placeholder="010-1234-5678" />
                {formErrors.phone && <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                <input type="email" value={buyerEmail} onChange={e => { setBuyerEmail(e.target.value); setFormErrors(p => ({ ...p, email: '' })); }}
                  className={`w-full px-4 py-3 rounded-xl border ${formErrors.email ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-black outline-none`} placeholder="email@example.com" />
                {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('select_plan')} className="flex-1 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50">이전</button>
              <button onClick={() => { if (validateBuyerInfo()) setStep('payment'); }}
                className="flex-1 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">다음</button>
            </div>
          </div>
        )}

        {/* STEP 3: 결제수단 선택 */}
        {step === 'payment' && selectedPlan && (
          <div>
            <h2 className="text-2xl font-bold mb-2">결제 방법을 선택하세요</h2>
            <p className="text-gray-500 mb-6">결제 금액: {formatKRW(selectedPlan.salePrice ?? selectedPlan.basePrice)}</p>
            {availableMethods.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                <AlertCircle size={32} className="text-yellow-500 mx-auto mb-3" />
                <p className="text-yellow-800 font-medium">현재 이용 가능한 결제수단이 없습니다.</p>
                <p className="text-yellow-600 text-sm mt-1">에이전트에게 문의해주세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableMethods.map(m => (
                  <button key={m.method} onClick={() => setSelectedMethod(m.method)}
                    className={`w-full bg-white rounded-2xl border p-5 text-left flex items-center gap-4 transition-all ${
                      selectedMethod === m.method ? 'border-black shadow-lg' : 'border-gray-100 hover:border-gray-300'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === m.method ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {m.icon}
                    </div>
                    <span className="font-bold">{m.label}</span>
                    {selectedMethod === m.method && <CheckCircle size={20} className="ml-auto text-green-500" />}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep('buyer_info')} className="flex-1 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50">이전</button>
              <button onClick={handleSubmitCheckout} disabled={!selectedMethod || submitting}
                className="flex-1 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
                {submitting ? '처리 중...' : '결제 진행'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 완료 */}
        {step === 'complete' && checkoutResult && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">신청이 접수되었습니다!</h2>
            <p className="text-gray-500 mb-8">아래 안내에 따라 결제를 완료해주세요.</p>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-left space-y-4 mb-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">신청 메뉴</p>
                <p className="font-bold">{checkoutResult.pricingPlanSnapshot.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">결제 금액</p>
                <p className="text-xl font-black">{formatKRW(checkoutResult.amount)}</p>
              </div>

              {checkoutResult.paymentMethod === 'bank_transfer' && checkoutResult.paymentInstructionSnapshot && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-800 mb-2">계좌이체 안내</p>
                  <p className="text-sm text-blue-700">
                    {checkoutResult.paymentInstructionSnapshot.bankName} {checkoutResult.paymentInstructionSnapshot.accountNumber}
                  </p>
                  <p className="text-sm text-blue-700">예금주: {checkoutResult.paymentInstructionSnapshot.accountHolder}</p>
                </div>
              )}

              {checkoutResult.paymentMethod !== 'bank_transfer' && (() => {
                const link = getPaymentLink(checkoutResult.paymentMethod);
                return link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    <ExternalLink size={18} /> 결제 페이지로 이동
                  </a>
                ) : null;
              })()}

              {checkoutResult.paymentInstructionSnapshot?.paymentNotice && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">{checkoutResult.paymentInstructionSnapshot.paymentNotice}</p>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-400">결제 완료 후 담당 에이전트가 확인하여 진행합니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
