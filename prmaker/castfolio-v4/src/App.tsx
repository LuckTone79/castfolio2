import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import TalentList from './components/Dashboard/TalentList';
import Builder from './components/Builder/Builder';
import SalesDashboard from './components/Dashboard/SalesDashboard';
import IntakeSubmissionList from './components/Dashboard/IntakeSubmissionList';
import AgentPaymentSettings from './components/Dashboard/AgentPaymentSettings';
import PricingPlanManager from './components/Dashboard/PricingPlanManager';
import OwnerConsole from './components/Owner/OwnerConsole';
import PRPage from './components/PRPage/PRPage';
import TalentIntakeForm from './components/Public/TalentIntakeForm';
import CheckoutPage from './components/Public/CheckoutPage';
import DemoPage from './components/Public/DemoPage';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { Talent, Page, Language, DashboardTab } from './types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { LogIn, Sparkles, Layout, Users, Rocket, Home, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { recordPageView } from './lib/pageViews';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { getTranslation } from './lib/i18n';

const AppContent = () => {
  const { user, loading, login, role } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const [activeTab, setActiveTab] = useState<DashboardTab>('talents');
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [publicPage, setPublicPage] = useState<Page | null>(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicViewError, setPublicViewError] = useState<string | null>(null);
  const [isIntakeView, setIsIntakeView] = useState(false);
  const [intakeToken, setIntakeToken] = useState<string | null>(null);
  const [isCheckoutView, setIsCheckoutView] = useState(false);
  const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);
  const [checkoutAgentId, setCheckoutAgentId] = useState<string | null>(null);
  const [isDemoView, setIsDemoView] = useState(false);
  const [demoThemeId, setDemoThemeId] = useState<string | null>(null);

  // 라우팅: URL path 기반
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/submit/')) {
      setIsIntakeView(true);
      setIntakeToken(path.split('/submit/')[1]);
    } else if (path.startsWith('/demo/')) {
      setIsDemoView(true);
      setDemoThemeId(path.split('/demo/')[1]);
    } else if (path.startsWith('/checkout/agent/')) {
      setIsCheckoutView(true);
      setCheckoutAgentId(path.split('/checkout/agent/')[1]);
    } else if (path.startsWith('/checkout/')) {
      setIsCheckoutView(true);
      setCheckoutSlug(path.split('/checkout/')[1]);
    } else if (path.startsWith('/p/')) {
      const slug = path.split('/p/')[1];
      setIsPublicView(true);
      const fetchPublicPage = async () => {
        try {
          const q = query(collection(db, 'pages'), where('slug', '==', slug), where('isPublished', '==', true));
          const snapshot = await getDocs(q);
          if (snapshot.empty) { setPublicViewError(t('pageNotFound')); return; }
          const pageData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Page;
          if (!pageData.isPublished || pageData.status !== 'published') { setPublicViewError(t('pageNotPublished')); return; }
          setPublicPage(pageData);
          recordPageView(pageData.id);
        } catch (error) {
          console.error('Error fetching public page:', error);
          setPublicViewError(t('pageLoadError'));
        }
      };
      fetchPublicPage();
    }
  }, []);

  // 공개 라우트: 자료수집 폼
  if (isIntakeView && intakeToken) {
    return <TalentIntakeForm token={intakeToken} />;
  }

  // 공개 라우트: 데모 페이지
  if (isDemoView && demoThemeId) {
    return <DemoPage themeId={demoThemeId} />;
  }

  // 공개 라우트: 결제/신청 페이지
  if (isCheckoutView) {
    if (checkoutSlug) return <CheckoutPage pageSlug={checkoutSlug} />;
    if (checkoutAgentId) return <CheckoutPage agentId={checkoutAgentId} />;
  }

  // 공개 라우트: PR 페이지
  if (isPublicView) {
    if (publicViewError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Oops!</h1>
            <p className="text-gray-500 mb-8">{publicViewError}</p>
            <button onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
              <Home size={18} /><span>{t('backToHome')}</span>
            </button>
          </motion.div>
        </div>
      );
    }
    if (publicPage) return <PRPage page={publicPage} />;
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  }

  // 로딩
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold tracking-widest uppercase opacity-30">{t('loadingCastFolio')}</p>
        </div>
      </div>
    );
  }

  // 미로그인: 랜딩 페이지
  if (!user) {
    const languages: { code: Language; label: string }[] = [
      { code: 'ko', label: '한' }, { code: 'ja', label: '日' }, { code: 'zh', label: '中' }, { code: 'vi', label: 'VN' }, { code: 'en', label: 'EN' },
    ];
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <nav className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
            <h1 className="text-2xl font-black tracking-tighter">CastFolio</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100">
              {languages.map(lang => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${language === lang.code ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
                  {lang.label}
                </button>
              ))}
            </div>
            <button onClick={login} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all shadow-xl">
              <LogIn size={18} /><span>{t('agentLogin')}</span>
            </button>
          </div>
        </nav>
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold">
              <Sparkles size={16} /><span>{t('aiPoweredBuilder')}</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
              {t('buildPerfectPage')} <span className="text-indigo-600">{t('buildPerfectPageHighlight')}</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">{t('heroSubtitle')}</p>
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              {[
                { icon: <Layout size={20} className="text-indigo-600" />, text: t('professionalThemes') },
                { icon: <Users size={20} className="text-indigo-600" />, text: t('talentManagement') },
                { icon: <Rocket size={20} className="text-indigo-600" />, text: t('instantDeployment') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {item.icon}<span className="font-bold">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
        <footer className="p-12 text-center text-gray-400 text-sm border-t border-gray-50">&copy; 2026 CastFolio. All rights reserved.</footer>
      </div>
    );
  }

  // 빌더 모드
  if (selectedTalent) {
    return <Builder talent={selectedTalent} onBack={() => setSelectedTalent(null)} />;
  }

  // 대시보드
  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBoundary key={activeTab}>
        {activeTab === 'talents' && <TalentList onSelectTalent={setSelectedTalent} />}
        {activeTab === 'intake' && <IntakeSubmissionList onEditTalent={setSelectedTalent} />}
        {activeTab === 'pricing' && <PricingPlanManager />}
        {activeTab === 'paymentSettings' && <AgentPaymentSettings />}
        {activeTab === 'sales' && <SalesDashboard />}
        {activeTab === 'owner' && <OwnerConsole />}
      </ErrorBoundary>
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
