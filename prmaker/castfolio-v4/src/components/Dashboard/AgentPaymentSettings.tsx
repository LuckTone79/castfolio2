import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { PayoutInfo } from '../../types';
import { CreditCard, Save, CheckCircle, AlertCircle, Building2, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { validateUrl } from '../../lib/validators';
import { logWorkActivity } from '../../lib/activity';
import { getISODateString } from '../../lib/date';

const AgentPaymentSettings: React.FC = () => {
  const { user, role, userProfile } = useAuth();

  const [form, setForm] = useState<PayoutInfo>({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    tossPaymentLink: '',
    kakaoPayPaymentLink: '',
    naverPayPaymentLink: '',
    cardPaymentLink: '',
    paymentNotice: '',
  });

  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // userProfile에서 기존 값 로드
  useEffect(() => {
    if (userProfile) {
      if (userProfile.payoutInfo) {
        setForm({
          bankName: userProfile.payoutInfo.bankName || '',
          accountNumber: userProfile.payoutInfo.accountNumber || '',
          accountHolder: userProfile.payoutInfo.accountHolder || '',
          tossPaymentLink: userProfile.payoutInfo.tossPaymentLink || '',
          kakaoPayPaymentLink: userProfile.payoutInfo.kakaoPayPaymentLink || '',
          naverPayPaymentLink: userProfile.payoutInfo.naverPayPaymentLink || '',
          cardPaymentLink: userProfile.payoutInfo.cardPaymentLink || '',
          paymentNotice: userProfile.payoutInfo.paymentNotice || '',
        });
      }
      if (userProfile.updatedAt) {
        setLastSaved(userProfile.updatedAt);
      }
      setLoaded(true);
    }
  }, [userProfile]);

  // user가 아직 로드되지 않은 경우
  if (!user) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const updateField = (field: keyof PayoutInfo, value: string) => {
    const trimmed = value.slice(0, 500); // 최대 500자 제한
    setForm(prev => ({ ...prev, [field]: trimmed }));
    setSaveResult(null);
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const linkFields: (keyof PayoutInfo)[] = ['tossPaymentLink', 'kakaoPayPaymentLink', 'naverPayPaymentLink', 'cardPaymentLink'];
    for (const field of linkFields) {
      const val = form[field]?.trim();
      if (val && !validateUrl(val)) {
        newErrors[field] = '올바른 URL 형식을 입력하세요 (https://...)';
      }
    }
    // 계좌번호: 숫자/하이픈 검증
    if (form.accountNumber?.trim()) {
      if (!/^[\d\-\s]{4,30}$/.test(form.accountNumber.trim())) {
        newErrors.accountNumber = '계좌번호는 숫자와 하이픈만 사용 가능합니다';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !validate()) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const cleanedForm: PayoutInfo = {
        bankName: form.bankName?.trim() || undefined,
        accountNumber: form.accountNumber?.trim() || undefined,
        accountHolder: form.accountHolder?.trim() || undefined,
        tossPaymentLink: form.tossPaymentLink?.trim() || undefined,
        kakaoPayPaymentLink: form.kakaoPayPaymentLink?.trim() || undefined,
        naverPayPaymentLink: form.naverPayPaymentLink?.trim() || undefined,
        cardPaymentLink: form.cardPaymentLink?.trim() || undefined,
        paymentNotice: form.paymentNotice?.trim() || undefined,
      };

      await updateDoc(doc(db, 'users', user.uid), {
        payoutInfo: cleanedForm,
        updatedAt: getISODateString(),
      });

      await logWorkActivity({
        db,
        actorId: user.uid,
        actorRole: role || 'agent',
        actorEmail: user.email || '',
        activityType: 'payment_settings_updated',
        targetType: 'user',
        targetId: user.uid,
        targetLabel: user.email || '',
        summary: '결제 설정 업데이트',
      });

      setSaveResult('success');
      setLastSaved(getISODateString());
    } catch (err) {
      console.error('결제 설정 저장 실패:', err);
      setSaveResult('error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-black outline-none text-sm transition-colors`;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">결제 설정</h1>
        <p className="text-gray-500">구매자(caster)에게 보여줄 결제수단 정보를 설정하세요.</p>
        {lastSaved && (
          <p className="text-xs text-gray-400 mt-2">마지막 수정: {new Date(lastSaved).toLocaleString()}</p>
        )}
      </div>

      {/* 계좌이체 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold">계좌이체 정보</h3>
            <p className="text-xs text-gray-400">구매자가 입금할 계좌를 입력하세요</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">은행명</label>
            <input type="text" value={form.bankName || ''} onChange={e => updateField('bankName', e.target.value)}
              className={inputClass('bankName')} placeholder="예: 국민은행" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">계좌번호</label>
            <input type="text" value={form.accountNumber || ''} onChange={e => updateField('accountNumber', e.target.value)}
              className={inputClass('accountNumber')} placeholder="예: 123-456-789012" />
            {errors.accountNumber && <p className="text-xs text-red-500 mt-1">{errors.accountNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">예금주</label>
            <input type="text" value={form.accountHolder || ''} onChange={e => updateField('accountHolder', e.target.value)}
              className={inputClass('accountHolder')} placeholder="예: 홍길동" />
          </div>
        </div>
      </div>

      {/* 간편결제 링크 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <LinkIcon size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold">간편결제 링크</h3>
            <p className="text-xs text-gray-400">등록된 링크만 구매자에게 노출됩니다</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { key: 'tossPaymentLink' as const, label: '토스 결제 링크', placeholder: 'https://toss.me/...' },
            { key: 'kakaoPayPaymentLink' as const, label: '카카오페이 결제 링크', placeholder: 'https://kakaopay.me/...' },
            { key: 'naverPayPaymentLink' as const, label: '네이버페이 결제 링크', placeholder: 'https://...' },
            { key: 'cardPaymentLink' as const, label: '카드 결제 링크', placeholder: 'https://...' },
          ].map(item => (
            <div key={item.key}>
              <label className="block text-sm font-medium text-gray-600 mb-1">{item.label}</label>
              <input type="url" value={form[item.key] || ''} onChange={e => updateField(item.key, e.target.value)}
                className={inputClass(item.key)} placeholder={item.placeholder} />
              {errors[item.key] && <p className="text-xs text-red-500 mt-1">{errors[item.key]}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* 안내문 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <MessageSquare size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-bold">결제 안내 메모</h3>
            <p className="text-xs text-gray-400">구매자에게 함께 보여줄 안내 문구</p>
          </div>
        </div>
        <textarea rows={3} value={form.paymentNotice || ''} onChange={e => updateField('paymentNotice', e.target.value)}
          className={inputClass('paymentNotice')} placeholder="예: 입금 후 카카오톡으로 알려주세요 (오픈채팅: https://...)" />
      </div>

      {/* 저장 버튼 */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
          {saving ? '저장 중...' : '저장'}
        </button>
        {saveResult === 'success' && (
          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <CheckCircle size={16} /> 저장 완료
          </span>
        )}
        {saveResult === 'error' && (
          <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
            <AlertCircle size={16} /> 저장 실패
          </span>
        )}
      </div>
    </div>
  );
};

export default AgentPaymentSettings;
