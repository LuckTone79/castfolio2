import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { Talent, Page, Sale, Settlement, PaymentMethod, CheckoutSession } from '../../types';
import { DollarSign, TrendingUp, PieChart, CheckCircle, AlertCircle, Download, FileText, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { DEFAULT_COMMISSION_RATE } from '../../config';
import { normalizeCommissionRate, calculateCommission, calculateNetAmount } from '../../lib/sales';
import { exportSalesToExcel, exportSettlementsToExcel } from '../../lib/export';
import { compressImageToDataUrl } from '../../lib/storage';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../lib/i18n';

const SalesDashboard: React.FC = () => {
  const { user, role, userProfile } = useAuth();
  const { language } = useLanguage();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [sales, setSales] = useState<Sale[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  
  const [activeTab, setActiveTab] = useState<'sales' | 'settlements' | 'checkouts'>('sales');
  const [checkoutSessions, setCheckoutSessions] = useState<CheckoutSession[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [saleAmount, setSaleAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('manual');
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const commissionRate = normalizeCommissionRate(userProfile?.commissionRate, DEFAULT_COMMISSION_RATE);

  useEffect(() => {
    if (!user) return;
    const qSales = role === 'owner' ? query(collection(db, 'sales')) : query(collection(db, 'sales'), where('agentId', '==', user.uid));
    const unsubscribeSales = onSnapshot(qSales, (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
    });

    const qSettlements = role === 'owner' ? query(collection(db, 'settlements')) : query(collection(db, 'settlements'), where('agentId', '==', user.uid));
    const unsubscribeSettlements = onSnapshot(qSettlements, (snapshot) => {
      setSettlements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Settlement)));
    });

    const qTalents = role === 'owner' ? query(collection(db, 'talents')) : query(collection(db, 'talents'), where('agentId', '==', user.uid));
    const unsubscribeTalents = onSnapshot(qTalents, (snapshot) => {
      setTalents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Talent)));
    });

    const qPages = role === 'owner' ? query(collection(db, 'pages')) : query(collection(db, 'pages'), where('agentId', '==', user.uid));
    const unsubscribePages = onSnapshot(qPages, (snapshot) => {
      setPages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page)));
    });

    // Checkout sessions 구독
    const qCheckouts = role === 'owner'
      ? query(collection(db, 'checkout_sessions'))
      : query(collection(db, 'checkout_sessions'), where('agentId', '==', user.uid));
    const unsubscribeCheckouts = onSnapshot(qCheckouts, (snapshot) => {
      setCheckoutSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CheckoutSession)));
    }, (err) => { console.error('Checkout sessions load error:', err); });

    return () => {
      unsubscribeSales();
      unsubscribeSettlements();
      unsubscribeTalents();
      unsubscribePages();
      unsubscribeCheckouts();
    };
  }, [user, role]);

  const totalSales = sales.reduce((acc, sale) => acc + (sale.grossAmount || 0), 0);
  const totalCommission = sales.reduce((acc, sale) => acc + ((sale.grossAmount || 0) * sale.commissionRate), 0);
  const myEarnings = totalSales - totalCommission;
  
  const unsettledSales = sales.filter(s => s.paymentStatus === 'paid' && s.settlementStatus !== 'settled');
  const unsettledAmount = unsettledSales.reduce((acc, sale) => acc + sale.agentPayoutAmount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthSales = sales.filter(s => {
    const d = new Date(s.confirmedAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthSales.reduce((acc, sale) => acc + sale.grossAmount, 0);
  const thisMonthCommission = thisMonthSales.reduce((acc, sale) => acc + (sale.grossAmount * sale.commissionRate), 0);

  // Unconfirmed Monitoring (Published > 30 days, no sales)
  const unconfirmedPages = pages.filter(p => {
    if (p.status !== 'published' || !p.publishedAt) return false;
    const hasSale = sales.some(s => s.pageId === p.id);
    if (hasSale) return false;
    
    const publishedDate = new Date(p.publishedAt);
    const daysSincePublish = (new Date().getTime() - publishedDate.getTime()) / (1000 * 3600 * 24);
    return daysSincePublish > 30;
  });

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, 800, 0.8);
      setEvidenceUrl(dataUrl);
    } catch (err) {
      console.error('Failed to compress image', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTalent) return;
    
    const amount = parseFloat(saleAmount);
    const commission = calculateCommission(amount, commissionRate);
    const netAmount = calculateNetAmount(amount, commission);
    const page = pages.find(p => p.talentId === selectedTalent.id);

    const newSale: Omit<Sale, 'id'> = {
      agentId: user.uid,
      talentId: selectedTalent.id,
      pageId: page?.id || '',
      orderType: 'initial_purchase',
      grossAmount: amount,
      commissionRate: commissionRate,
      platformCommissionAmount: commission,
      agentPayoutAmount: netAmount,
      paymentMethod,
      paymentStatus: 'paid',
      settlementStatus: 'none',
      evidenceUrl,
      notes,
      confirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const now = new Date().toISOString();
      const saleRef = await addDoc(collection(db, 'sales'), newSale);

      // Platform Ledger 자동 생성 (15% 수수료 원장)
      await addDoc(collection(db, 'platform_ledger'), {
        saleId: saleRef.id,
        agentId: user.uid,
        ownerId: 'platform',
        grossAmount: amount,
        commissionRate: commissionRate,
        platformCommissionAmount: commission,
        agentPayoutAmount: netAmount,
        status: 'accrued',
        createdAt: now,
        updatedAt: now,
      });

      await updateDoc(doc(db, 'talents', selectedTalent.id), {
        status: 'active',
        updatedAt: now,
      });

      setShowConfirmModal(false);
      setSelectedTalent(null);
      setSaleAmount('');
      setPaymentMethod('manual');
      setNotes('');
      setEvidenceUrl('');
    } catch (err) {
      console.error('Error recording sale:', err);
    }
  };

  // Checkout session을 Sale로 확정하는 함수
  const confirmCheckoutAsSale = async (session: CheckoutSession) => {
    if (!user || !window.confirm(`${session.buyerName}님의 구매를 확정하시겠습니까?\n금액: ₩${session.amount.toLocaleString()}`)) return;
    try {
      const commission = calculateCommission(session.amount, commissionRate);
      const payout = calculateNetAmount(session.amount, commission);
      const now = new Date().toISOString();

      // 1. Sale 생성
      const saleRef = await addDoc(collection(db, 'sales'), {
        agentId: session.agentId,
        talentId: session.talentId,
        pageId: session.pageId,
        checkoutSessionId: session.id,
        pricingPlanId: session.pricingPlanId,
        pricingPlanSnapshot: session.pricingPlanSnapshot,
        orderType: 'initial_purchase',
        buyerName: session.buyerName,
        buyerPhone: session.buyerPhone,
        buyerEmail: session.buyerEmail,
        grossAmount: session.amount,
        commissionRate: commissionRate,
        platformCommissionAmount: commission,
        agentPayoutAmount: payout,
        paymentMethod: session.paymentMethod,
        paymentStatus: 'paid',
        settlementStatus: 'none',
        provider: session.provider || 'platform_manual',
        confirmedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      // 2. Platform Ledger 생성
      await addDoc(collection(db, 'platform_ledger'), {
        saleId: saleRef.id,
        agentId: session.agentId,
        ownerId: 'platform',
        grossAmount: session.amount,
        commissionRate: commissionRate,
        platformCommissionAmount: commission,
        agentPayoutAmount: payout,
        status: 'accrued',
        createdAt: now,
        updatedAt: now,
      });

      // 3. Checkout session 상태 업데이트
      await updateDoc(doc(db, 'checkout_sessions', session.id), {
        status: 'paid',
        paidAt: now,
        updatedAt: now,
      });

      alert('판매가 확정되었습니다.');
    } catch (err) {
      console.error('판매 확정 실패:', err);
      alert('판매 확정에 실패했습니다.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('salesDashboard')}</h1>
          <p className="text-gray-500">{t('salesDesc')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => exportSalesToExcel(sales, talents)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            <span>{t('exportSales')}</span>
          </button>
          <button 
            onClick={() => exportSettlementsToExcel(settlements)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <Download size={16} />
            <span>{t('exportSettlements')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <TrendingUp size={18} />
            <span className="font-medium text-sm">{t('totalRevenue')}</span>
          </div>
          <div className="text-3xl font-bold">₩{totalSales.toLocaleString()}</div>
          <div className="mt-2 text-xs text-gray-400">
            {t('thisMonth')}: ₩{thisMonthTotal.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <PieChart size={18} />
            <span className="font-medium text-sm">{t('totalCommission')}</span>
          </div>
          <div className="text-3xl font-bold text-red-500">₩{totalCommission.toLocaleString()}</div>
          <div className="mt-2 text-xs text-gray-400">
            {t('thisMonth')}: ₩{thisMonthCommission.toLocaleString()}
          </div>
        </div>
        <div className="bg-black text-white p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3 opacity-60 mb-2">
            <DollarSign size={18} />
            <span className="font-medium text-sm">{t('netProfit')}</span>
          </div>
          <div className="text-3xl font-bold">₩{myEarnings.toLocaleString()}</div>
          <div className="mt-2 text-xs opacity-60">
            {t('currentRate')}: {(commissionRate * 100).toFixed(1)}%
          </div>
        </div>
        <div className="bg-indigo-50 p-6 rounded-3xl shadow-sm border border-indigo-100">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <FileText size={18} />
            <span className="font-medium text-sm">{t('pendingSettlement')}</span>
          </div>
          <div className="text-3xl font-bold text-indigo-900">₩{unsettledAmount.toLocaleString()}</div>
          <div className="mt-2 text-xs text-indigo-500">
            {t('pendingSettlement')}
          </div>
        </div>
      </div>

      {unconfirmedPages.length > 0 && (
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-orange-800 font-bold mb-4">
            <AlertCircle size={20} />
            <h3>{t('unconfirmedWarning')}</h3>
          </div>
          <p className="text-sm text-orange-700 mb-4">
            {t('unconfirmedDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unconfirmedPages.map(page => {
              const talent = talents.find(t => t.id === page.talentId);
              return (
                <div key={page.id} className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm">{talent?.nameKo || 'Unknown'}</div>
                    <div className="text-xs text-gray-500">{t('publishedAt')}: {new Date(page.publishedAt!).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedTalent(talent || null);
                      setShowConfirmModal(true);
                    }}
                    className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-lg font-medium hover:bg-orange-200"
                  >
                    {t('recordSale')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 flex">
          <button 
            onClick={() => setActiveTab('checkouts')}
            className={`px-8 py-4 font-medium text-sm transition-colors ${activeTab === 'checkouts' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
          >
            구매 요청 {checkoutSessions.filter(c => c.status === 'created').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{checkoutSessions.filter(c => c.status === 'created').length}</span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('sales')}
            className={`px-8 py-4 font-medium text-sm transition-colors ${activeTab === 'sales' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
          >
            {t('salesHistory')}
          </button>
          <button 
            onClick={() => setActiveTab('settlements')}
            className={`px-8 py-4 font-medium text-sm transition-colors ${activeTab === 'settlements' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-black'}`}
          >
            {t('settlements')}
          </button>
        </div>

        {/* 구매 요청 탭 */}
        {activeTab === 'checkouts' && (
          <div>
            <div className="p-6 bg-gray-50/50">
              <h2 className="text-lg font-bold">구매 요청 목록</h2>
              <p className="text-sm text-gray-500 mt-1">caster가 공개 페이지에서 신청한 구매 요청입니다. 결제 확인 후 판매를 확정하세요.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-left">
                    <th className="px-6 py-3 font-medium">신청일</th>
                    <th className="px-6 py-3 font-medium">구매자</th>
                    <th className="px-6 py-3 font-medium">메뉴</th>
                    <th className="px-6 py-3 font-medium">금액</th>
                    <th className="px-6 py-3 font-medium">결제수단</th>
                    <th className="px-6 py-3 font-medium">상태</th>
                    <th className="px-6 py-3 font-medium text-right">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {checkoutSessions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(session => {
                      const talent = talents.find(t2 => t2.id === session.talentId);
                      const statusColors: Record<string, string> = {
                        created: 'bg-yellow-100 text-yellow-700',
                        pending: 'bg-blue-100 text-blue-700',
                        paid: 'bg-green-100 text-green-700',
                        failed: 'bg-red-100 text-red-700',
                        cancelled: 'bg-gray-100 text-gray-600',
                      };
                      const statusLabels: Record<string, string> = {
                        created: '신규 요청',
                        pending: '결제 대기',
                        paid: '확정 완료',
                        failed: '실패',
                        cancelled: '취소',
                      };
                      return (
                        <tr key={session.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(session.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="font-bold">{session.buyerName}</div>
                            <div className="text-xs text-gray-400">{session.buyerEmail}</div>
                            <div className="text-xs text-gray-400">{session.buyerPhone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium">{session.pricingPlanSnapshot?.title || '-'}</div>
                            {talent && <div className="text-xs text-gray-400">{talent.nameKo}</div>}
                          </td>
                          <td className="px-6 py-4 font-bold">₩{session.amount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{session.paymentMethod}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[session.status] || 'bg-gray-100 text-gray-600'}`}>
                              {statusLabels[session.status] || session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {(session.status === 'created' || session.status === 'pending') && (
                              <button
                                onClick={() => confirmCheckoutAsSale(session)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
                              >
                                <CheckCircle size={14} />
                                판매 확정
                              </button>
                            )}
                            {session.status === 'paid' && (
                              <span className="text-xs text-green-600 font-medium">확정됨</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {checkoutSessions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <DollarSign size={32} className="text-gray-300" />
                          <p>아직 구매 요청이 없습니다</p>
                          <p className="text-xs">공개 PR 페이지의 "제작 신청하기" 버튼을 통해 구매 요청이 들어옵니다.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            <div className="p-6 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold">{t('recentSales')}</h2>
              <button 
                onClick={() => setShowConfirmModal(true)}
                className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <CheckCircle size={16} />
                {t('manualSaleConfirmation')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">{t('date')}</th>
                    <th className="px-6 py-4">{t('talent')}</th>
                    <th className="px-6 py-4">{t('amount')}</th>
                    <th className="px-6 py-4">{t('netAmount')}</th>
                    <th className="px-6 py-4">{t('paymentMethod')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()).map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">{new Date(sale.confirmedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold">{talents.find(t => t.id === sale.talentId)?.nameKo || 'Unknown'}</td>
                      <td className="px-6 py-4 font-bold">₩{sale.grossAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">₩{sale.agentPayoutAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                        {sale.paymentMethod === 'manual' ? t('manualPayment') :
                         sale.paymentMethod === 'bank_transfer' ? t('bankTransfer') :
                         sale.paymentMethod === 'kakaopay' ? t('kakaopay') :
                         sale.paymentMethod === 'naverpay' ? t('naverpay') :
                         sale.paymentMethod === 'toss' ? t('toss') :
                         String(sale.paymentMethod || 'manual').replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sale.settlementStatus === 'settled' ? 'bg-gray-100 text-gray-600' :
                          sale.settlementStatus === 'pending' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {sale.settlementStatus === 'settled' ? t('statusSettled') :
                           sale.settlementStatus === 'pending' ? t('statusSettlementPending') :
                           t('statusConfirmed')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">{t('noSales')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settlements' && (
          <div>
            <div className="p-6 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold">{t('mySettlements')}</h2>
              {sales.some(s => s.paymentStatus === 'paid' && s.settlementStatus === 'none') && (
                <button 
                  onClick={async () => {
                    try {
                      const { generateSettlement } = await import('../../lib/settlements');
                      const now = new Date();
                      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                      await generateSettlement(user!.uid, startDate, endDate);
                    } catch (err: any) {
                      console.error(err);
                    }
                  }}
                  className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <FileText size={16} />
                  {t('generateSettlement')}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">{t('date')}</th>
                    <th className="px-6 py-4">{t('period')}</th>
                    <th className="px-6 py-4">{t('amount')}</th>
                    <th className="px-6 py-4">{t('commission')}</th>
                    <th className="px-6 py-4">{t('payoutAmount')}</th>
                    <th className="px-6 py-4">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settlements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm">{new Date(settlement.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{settlement.startDate} ~ {settlement.endDate}</td>
                      <td className="px-6 py-4 font-bold">₩{settlement.totalGrossAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-red-500">-₩{settlement.totalPlatformCommission.toLocaleString()}</td>
                      <td className="px-6 py-4 text-green-600 font-bold">₩{settlement.totalAgentPayout.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          settlement.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {settlement.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-400">{t('noSettlements')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl my-8"
          >
            <h2 className="text-2xl font-bold mb-2">{t('confirmSale')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('recordManualSale')}</p>
            <form onSubmit={handleConfirmSale} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('selectTalent')}</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                  value={selectedTalent?.id || ''}
                  onChange={(e) => setSelectedTalent(talents.find(t => t.id === e.target.value) || null)}
                >
                  <option value="">{t('chooseTalent')}</option>
                  {talents.map(t => (
                    <option key={t.id} value={t.id}>{t.nameKo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('saleAmountKrw')}</label>
                <input 
                  required
                  type="number" 
                  value={saleAmount}
                  onChange={e => setSaleAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                  placeholder="300,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('paymentMethod')}</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                >
                  <option value="manual">{t('manualPayment')}</option>
                  <option value="bank_transfer">{t('bankTransfer')}</option>
                  <option value="kakaopay">{t('kakaopay')}</option>
                  <option value="naverpay">{t('naverpay')}</option>
                  <option value="toss">{t('toss')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('evidenceOptional')}</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Upload size={18} />
                      <span className="text-sm font-medium">{isUploading ? t('processing') : t('uploadReceipt')}</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleEvidenceUpload} disabled={isUploading} />
                  </label>
                </div>
                {evidenceUrl && (
                  <div className="mt-2 relative rounded-lg overflow-hidden h-24 bg-gray-100 border border-gray-200">
                    <img src={evidenceUrl} alt="Evidence" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setEvidenceUrl('')} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black">
                      <AlertCircle size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('notesOptional')}</label>
                <textarea 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none h-24"
                  placeholder={t('anyAdditionalDetails')}
                />
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl text-sm">
                <div className="flex justify-between mb-1">
                  <span>{t('commission')} ({(commissionRate * 100).toFixed(1)}%)</span>
                  <span className="text-red-500">-₩{calculateCommission(parseFloat(saleAmount || '0'), commissionRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{t('yourEarnings')}</span>
                  <span className="text-green-600">₩{calculateNetAmount(parseFloat(saleAmount || '0'), calculateCommission(parseFloat(saleAmount || '0'), commissionRate)).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {t('confirmSale')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;
