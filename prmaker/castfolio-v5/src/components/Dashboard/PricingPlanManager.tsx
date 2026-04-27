import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { PricingPlan, RevisionPolicy, Talent } from '../../types';
import { Plus, Edit3, Trash2, ChevronUp, ChevronDown, Tag, ToggleLeft, ToggleRight, X, Save, Package } from 'lucide-react';
import { logWorkActivity } from '../../lib/activity';
import { logAuditEvent } from '../../lib/audit';
import { formatKRW, calculateDiscountPercent } from '../../lib/sales';
import { getISODateString } from '../../lib/date';

const EMPTY_REVISION: RevisionPolicy = {
  firstRevisionFree: true,
  includedRevisionCount: 1,
  extraRevisionPrice: 50000,
  notes: '',
};

const EMPTY_FORM = {
  title: '',
  description: '',
  basePrice: 0,
  salePrice: null as number | null,
  badge: '',
  talentId: null as string | null,
  isActive: true,
  revisionPolicy: { ...EMPTY_REVISION },
};

const PricingPlanManager: React.FC = () => {
  const { user, role } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const isOwner = role === 'owner';

  useEffect(() => {
    if (!user) return;
    const plansQ = isOwner
      ? collection(db, 'pricing_plans')
      : query(collection(db, 'pricing_plans'), where('agentId', '==', user.uid));

    const talentsQ = isOwner
      ? collection(db, 'talents')
      : query(collection(db, 'talents'), where('agentId', '==', user.uid));

    const unsubPlans = onSnapshot(plansQ, snap => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as PricingPlan));
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      setPlans(items);
      setLoading(false);
    }, err => {
      console.error('PricingPlans load error:', err);
      setLoading(false);
    });

    const unsubTalents = onSnapshot(talentsQ, snap => {
      setTalents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Talent)));
    });

    return () => { unsubPlans(); unsubTalents(); };
  }, [user, role]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, revisionPolicy: { ...EMPTY_REVISION } });
    setShowForm(true);
  };

  const openEditForm = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setForm({
      title: plan.title,
      description: plan.description,
      basePrice: plan.basePrice,
      salePrice: plan.salePrice ?? null,
      badge: plan.badge || '',
      talentId: plan.talentId ?? null,
      isActive: plan.isActive,
      revisionPolicy: { ...plan.revisionPolicy },
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !form.title.trim() || form.basePrice <= 0) return;
    setSaving(true);
    const now = getISODateString();
    try {
      const planData = {
        agentId: user.uid,
        talentId: form.talentId || null,
        title: form.title.trim(),
        description: form.description.trim(),
        basePrice: form.basePrice,
        salePrice: form.salePrice && form.salePrice > 0 ? form.salePrice : null,
        currency: 'KRW' as const,
        badge: form.badge.trim() || null,
        isActive: form.isActive,
        revisionPolicy: form.revisionPolicy,
        updatedAt: now,
      };

      if (editingId) {
        await updateDoc(doc(db, 'pricing_plans', editingId), planData);
        await logWorkActivity({ db, actorId: user.uid, actorRole: role || 'agent', actorEmail: user.email || '',
          activityType: 'pricing_plan_updated', targetType: 'pricing_plan', targetId: editingId,
          targetLabel: form.title, summary: `판매 메뉴 수정: ${form.title}` });
      } else {
        const ref = await addDoc(collection(db, 'pricing_plans'), {
          ...planData, sortOrder: plans.length, createdAt: now,
        });
        await logWorkActivity({ db, actorId: user.uid, actorRole: role || 'agent', actorEmail: user.email || '',
          activityType: 'pricing_plan_created', targetType: 'pricing_plan', targetId: ref.id,
          targetLabel: form.title, summary: `판매 메뉴 생성: ${form.title}` });
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (plan: PricingPlan) => {
    if (!user || !window.confirm(`"${plan.title}" 메뉴를 삭제하시겠습니까?`)) return;
    try {
      await deleteDoc(doc(db, 'pricing_plans', plan.id));
      await logWorkActivity({ db, actorId: user.uid, actorRole: role || 'agent', actorEmail: user.email || '',
        activityType: 'pricing_plan_deleted', targetType: 'pricing_plan', targetId: plan.id,
        targetLabel: plan.title, summary: `판매 메뉴 삭제: ${plan.title}` });
    } catch (err) { console.error(err); }
  };

  const handleToggle = async (plan: PricingPlan) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'pricing_plans', plan.id), { isActive: !plan.isActive, updatedAt: getISODateString() });
      await logWorkActivity({ db, actorId: user.uid, actorRole: role || 'agent', actorEmail: user.email || '',
        activityType: 'pricing_plan_toggled', targetType: 'pricing_plan', targetId: plan.id,
        targetLabel: plan.title, summary: `판매 메뉴 ${!plan.isActive ? '활성화' : '비활성화'}: ${plan.title}` });
    } catch (err) { console.error(err); }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= plans.length) return;
    try {
      await updateDoc(doc(db, 'pricing_plans', plans[index].id), { sortOrder: newIndex });
      await updateDoc(doc(db, 'pricing_plans', plans[newIndex].id), { sortOrder: index });
    } catch (err) { console.error(err); }
  };

  const getTalentName = (talentId: string | null | undefined) => {
    if (!talentId) return '공통 메뉴';
    const t = talents.find(tt => tt.id === talentId);
    return t ? t.nameKo : '알 수 없음';
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">판매 메뉴</h1>
          <p className="text-gray-500">구매자에게 제공할 가격 메뉴를 관리하세요</p>
        </div>
        <button onClick={openCreateForm} className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
          <Plus size={20} /> 메뉴 추가
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Package size={40} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">판매 메뉴가 없습니다</h3>
          <p className="text-gray-500 mb-6">첫 판매 메뉴를 만들어보세요.</p>
          <button onClick={openCreateForm} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
            메뉴 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan, idx) => (
            <div key={plan.id} className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${plan.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">{plan.title}</h3>
                    {plan.badge && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">{plan.badge}</span>
                    )}
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{getTalentName(plan.talentId)}</span>
                    {!plan.isActive && <span className="text-xs text-red-500 font-medium">비활성</span>}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{plan.description}</p>
                  <div className="flex items-baseline gap-3">
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
                  <div className="mt-2 text-xs text-gray-400">
                    {plan.revisionPolicy.firstRevisionFree && `첫 ${plan.revisionPolicy.includedRevisionCount}회 수정 무료`}
                    {plan.revisionPolicy.extraRevisionPrice > 0 && ` · 추가 수정 ${formatKRW(plan.revisionPolicy.extraRevisionPrice)}`}
                    {plan.revisionPolicy.notes && ` · ${plan.revisionPolicy.notes}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronUp size={14} /></button>
                    <button onClick={() => handleMove(idx, 'down')} disabled={idx === plans.length - 1} className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"><ChevronDown size={14} /></button>
                  </div>
                  <button onClick={() => handleToggle(plan)} className="p-2 hover:bg-gray-100 rounded-lg">
                    {plan.isActive ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-400" />}
                  </button>
                  <button onClick={() => openEditForm(plan)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(plan)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 생성/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingId ? '메뉴 수정' : '새 메뉴 추가'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">메뉴명 *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="예: PR 홈페이지 제작" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none" placeholder="메뉴에 대한 설명을 입력하세요" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">정가 (원) *</label>
                  <input type="number" value={form.basePrice || ''} onChange={e => setForm(p => ({ ...p, basePrice: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="300000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">할인가 (원)</label>
                  <input type="number" value={form.salePrice ?? ''} onChange={e => setForm(p => ({ ...p, salePrice: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="250000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">배지</label>
                  <input type="text" value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="오픈특가" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">대상 방송인</label>
                  <select value={form.talentId || ''} onChange={e => setForm(p => ({ ...p, talentId: e.target.value || null }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none bg-white">
                    <option value="">공통 메뉴 (전체)</option>
                    {talents.map(t => <option key={t.id} value={t.id}>{t.nameKo}</option>)}
                  </select>
                </div>
              </div>

              {/* 수정 정책 */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-gray-600">수정 정책</h4>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.revisionPolicy.firstRevisionFree}
                    onChange={e => setForm(p => ({ ...p, revisionPolicy: { ...p.revisionPolicy, firstRevisionFree: e.target.checked } }))}
                    className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm">첫 수정 무료</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">포함 수정 횟수</label>
                    <input type="number" min={0} value={form.revisionPolicy.includedRevisionCount}
                      onChange={e => setForm(p => ({ ...p, revisionPolicy: { ...p.revisionPolicy, includedRevisionCount: parseInt(e.target.value) || 0 } }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">추가 수정 가격 (원)</label>
                    <input type="number" min={0} value={form.revisionPolicy.extraRevisionPrice}
                      onChange={e => setForm(p => ({ ...p, revisionPolicy: { ...p.revisionPolicy, extraRevisionPrice: parseInt(e.target.value) || 0 } }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">수정 정책 메모</label>
                  <input type="text" value={form.revisionPolicy.notes || ''}
                    onChange={e => setForm(p => ({ ...p, revisionPolicy: { ...p.revisionPolicy, notes: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" placeholder="예: 이미지 교체는 무료" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowForm(false)} className="flex-1 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">취소</button>
                <button onClick={handleSave} disabled={saving || !form.title.trim() || form.basePrice <= 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPlanManager;
