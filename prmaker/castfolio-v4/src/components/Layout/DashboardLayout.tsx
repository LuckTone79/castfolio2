import React from 'react';
import { useAuth } from '../../AuthContext';
import { Users, DollarSign, LogOut, Inbox, Tag, CreditCard, Settings, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../lib/i18n';
import { DashboardTab, Language } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

// 메뉴 라벨 다국어 매핑
const TAB_LABELS: Record<string, Record<string, string>> = {
  talents:         { ko: '방송인 관리', en: 'Talent Mgmt', ja: 'タレント管理', zh: '人才管理', vi: 'Quản lý tài năng' },
  intake:          { ko: '자료 수집', en: 'Data Collection', ja: '提出データ', zh: '资料收集', vi: 'Thu thập dữ liệu' },
  pricing:         { ko: '판매 메뉴', en: 'Pricing', ja: '販売メニュー', zh: '定价菜单', vi: 'Bảng giá' },
  paymentSettings: { ko: '결제 설정', en: 'Payment Settings', ja: '決済設定', zh: '支付设置', vi: 'Cài đặt thanh toán' },
  sales:           { ko: '매출 및 정산', en: 'Sales & Settlement', ja: '売上と精算', zh: '销售与结算', vi: 'Doanh thu & Thanh toán' },
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [copied, setCopied] = React.useState(false);

  const isOwner = role === 'owner';

  const getTabLabel = (tabId: string): string => {
    return TAB_LABELS[tabId]?.[language] || TAB_LABELS[tabId]?.['en'] || tabId;
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'ko', label: '한' },
    { code: 'ja', label: '日' },
    { code: 'zh', label: '中' },
    { code: 'vi', label: 'VN' },
    { code: 'en', label: 'EN' },
  ];

  const mainTabs: { id: DashboardTab; icon: React.ReactNode }[] = [
    { id: 'talents', icon: <Users size={20} /> },
    { id: 'intake', icon: <Inbox size={20} /> },
    { id: 'pricing', icon: <Tag size={20} /> },
    { id: 'paymentSettings', icon: <CreditCard size={20} /> },
    { id: 'sales', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
            <h1 className="text-2xl font-black tracking-tighter">CastFolio</h1>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {isOwner ? 'OWNER PORTAL' : 'AGENT PORTAL'}
          </p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {mainTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {tab.icon}
              <span className="font-bold">{getTabLabel(tab.id)}</span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={async () => {
                if (user) {
                  const link = `${window.location.origin}/checkout/agent/${user.uid}`;
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                copied ? 'bg-green-600 text-white shadow-lg' : 'hover:bg-green-50 text-green-600'
              }`}
            >
              {copied ? <CheckCircle size={20} /> : <CreditCard size={20} />}
              <span className="font-bold">{copied ? '복사 완료!' : '결제 링크 복사'}</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
              {user?.displayName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate">{user?.displayName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          {isOwner && (
            <button
              onClick={() => onTabChange('owner')}
              className={`w-full flex items-center justify-center gap-2 mb-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'owner'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Settings size={14} />
              <span>Owner Console</span>
            </button>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 py-3 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span>{getTranslation(language, 'logout')}</span>
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="absolute top-6 right-8 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-gray-100">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${
                language === lang.code
                  ? 'bg-black text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="pt-20 px-8 pb-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
