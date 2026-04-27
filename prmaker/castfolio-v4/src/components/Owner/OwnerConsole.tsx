import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { UserProfile, Talent, Page, Sale, Settlement, WorkActivityLog, AuditLog } from '../../types';
import { Users, Mic2, FileText, DollarSign, BookOpen, Activity, BarChart3, Shield, AlertCircle, Edit3, Check, X, Percent, ExternalLink, User, Eye } from 'lucide-react';
import { formatKRW } from '../../lib/sales';
import { useToast } from '../Toast';
import { DEFAULT_COMMISSION_RATE } from '../../config';

type OwnerTab = 'overview' | 'users' | 'talents' | 'pages' | 'sales' | 'settlements' | 'activity' | 'audit';

// ─── 독립 로딩 훅 ───
interface CState<T> { data: T[]; loading: boolean; error: string | null; }
function useColl<T>(name: string, on: boolean): CState<T> {
  const [s, setS] = useState<CState<T>>({ data: [], loading: true, error: null });
  useEffect(() => {
    if (!on) { setS({ data: [], loading: false, error: null }); return; }
    const t = setTimeout(() => setS(p => p.loading ? { ...p, loading: false, error: p.error || '응답 시간 초과' } : p), 5000);
    const unsub = onSnapshot(collection(db, name),
      snap => { clearTimeout(t); setS({ data: snap.docs.map(d => ({ id: d.id, ...d.data() } as T)), loading: false, error: null }); },
      err => { clearTimeout(t); setS({ data: [], loading: false, error: `${name}: ${err.message}` }); }
    );
    return () => { clearTimeout(t); unsub(); };
  }, [name, on]);
  return s;
}

const OwnerConsole: React.FC = () => {
  const { role } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');
  const isOwner = role === 'owner';

  const usersState = useColl<UserProfile>('users', isOwner);
  const talentsState = useColl<Talent>('talents', isOwner);
  const pagesState = useColl<Page>('pages', isOwner);
  const salesState = useColl<Sale>('sales', isOwner);
  const settlementsState = useColl<Settlement>('settlements', isOwner);

  const [activities, setActivities] = useState<WorkActivityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);

  // 수수료 편집 상태
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('');
  const [globalRate, setGlobalRate] = useState((DEFAULT_COMMISSION_RATE * 100).toString());
  const [showGlobalEdit, setShowGlobalEdit] = useState(false);
  const [savingRate, setSavingRate] = useState(false);

  // 방송인 상세 모달
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

  useEffect(() => {
    if (!isOwner) return;
    const loadLogs = async () => {
      try { const s = await getDocs(collection(db, 'work_activity_logs')); setActivities(s.docs.map(d => ({ id: d.id, ...d.data() } as WorkActivityLog))); } catch {}
      try { const s = await getDocs(collection(db, 'audit_logs')); setAuditLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog))); } catch {}
      setLogsLoaded(true);
    };
    loadLogs();
  }, [isOwner]);

  if (!isOwner) return <div className="p-8 text-center"><AlertCircle size={40} className="text-red-500 mx-auto mb-4" /><p className="text-red-600 font-bold">접근 권한이 없습니다.</p></div>;

  const users = usersState.data;
  const talents = talentsState.data;
  const pages = pagesState.data;
  const sales = salesState.data;
  const settlements = settlementsState.data;

  const totalGross = sales.reduce((s, v) => s + (v.grossAmount || 0), 0);
  const totalCommission = sales.reduce((s, v) => s + (v.platformCommissionAmount || 0), 0);
  const activeUsers = users.filter(u => u.status === 'active').length;
  const publishedPages = pages.filter(p => p.isPublished).length;
  const allErrors = [usersState.error, talentsState.error, pagesState.error, salesState.error, settlementsState.error].filter(Boolean);

  const getAgentEmail = (agentId: string) => users.find(u => u.uid === agentId)?.email || agentId.slice(0, 8) + '...';
  const getAgentName = (agentId: string) => users.find(u => u.uid === agentId)?.name || getAgentEmail(agentId);
  const getTalentPageSlug = (talentId: string) => pages.find(p => p.talentId === talentId)?.slug;

  // ─── 개별 사용자 수수료 변경 ───
  const handleSaveUserRate = async (userId: string) => {
    const rate = parseFloat(editRate);
    if (isNaN(rate) || rate < 0 || rate > 100) { toast('0~100 사이의 숫자를 입력하세요.', 'error'); return; }
    setSavingRate(true);
    try {
      await updateDoc(doc(db, 'users', userId), { commissionRate: rate / 100, updatedAt: new Date().toISOString() });
      toast(`수수료율이 ${rate}%로 변경되었습니다.`, 'success');
      setEditingUserId(null);
    } catch (err) {
      console.error(err);
      toast('수수료 변경에 실패했습니다.', 'error');
    } finally { setSavingRate(false); }
  };

  // ─── 전체 수수료 일괄 변경 ───
  const handleApplyGlobalRate = async () => {
    const rate = parseFloat(globalRate);
    if (isNaN(rate) || rate < 0 || rate > 100) { toast('0~100 사이의 숫자를 입력하세요.', 'error'); return; }
    setSavingRate(true);
    try {
      const promises = users.map(u => updateDoc(doc(db, 'users', u.uid), { commissionRate: rate / 100, updatedAt: new Date().toISOString() }));
      await Promise.all(promises);
      toast(`전체 사용자 수수료가 ${rate}%로 변경되었습니다. (${users.length}명)`, 'success');
      setShowGlobalEdit(false);
    } catch (err) {
      console.error(err);
      toast('일괄 변경에 실패했습니다.', 'error');
    } finally { setSavingRate(false); }
  };

  const tabs: { id: OwnerTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '개요', icon: <BarChart3 size={16} /> },
    { id: 'users', label: '사용자', icon: <Users size={16} /> },
    { id: 'talents', label: '방송인', icon: <Mic2 size={16} /> },
    { id: 'pages', label: '페이지', icon: <FileText size={16} /> },
    { id: 'sales', label: '매출', icon: <DollarSign size={16} /> },
    { id: 'settlements', label: '정산', icon: <BookOpen size={16} /> },
    { id: 'activity', label: '활동', icon: <Activity size={16} /> },
    { id: 'audit', label: '감사', icon: <Shield size={16} /> },
  ];

  const th = "p-3 font-medium text-gray-500 bg-gray-50 border-b text-left text-sm";
  const td = "p-3 border-b border-gray-50";

  const renderSection = (state: CState<unknown>, children: React.ReactNode) => {
    if (state.loading) return <div className="p-12 flex justify-center"><div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" /></div>;
    if (state.error) return <div className="p-8 text-center bg-red-50 rounded-2xl"><AlertCircle size={24} className="text-red-400 mx-auto mb-2" /><p className="text-red-600 text-sm">{state.error}</p></div>;
    return children;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Owner Console</h1>
      <p className="text-gray-500 mb-6">플랫폼 전체 현황</p>

      {allErrors.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm font-medium">일부 데이터를 불러오지 못했습니다.</p>
          <p className="text-yellow-600 text-xs mt-1">{allErrors.join(' / ')}</p>
        </div>
      )}

      {/* 탭 */}
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === t.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Overview ═══ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: '전체 사용자', v: usersState.loading ? '...' : users.length, s: usersState.loading ? '' : `활성 ${activeUsers}명` },
            { l: '전체 방송인', v: talentsState.loading ? '...' : talents.length },
            { l: '전체 페이지', v: pagesState.loading ? '...' : pages.length, s: pagesState.loading ? '' : `게시 ${publishedPages}개` },
            { l: '전체 매출', v: salesState.loading ? '...' : formatKRW(totalGross) },
            { l: '플랫폼 수수료', v: salesState.loading ? '...' : formatKRW(totalCommission) },
            { l: '정산 건수', v: settlementsState.loading ? '...' : `${settlements.length}건` },
            { l: '활동 로그', v: logsLoaded ? `${activities.length}건` : '...' },
            { l: '감사 로그', v: logsLoaded ? `${auditLogs.length}건` : '...' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-gray-400 font-medium mb-1">{item.l}</p>
              <p className="text-2xl font-black">{item.v}</p>
              {item.s && <p className="text-xs text-gray-400 mt-1">{item.s}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ═══ Users — 수수료 변경 기능 추가 ═══ */}
      {activeTab === 'users' && renderSection(usersState, (
        <div>
          {/* 전체 수수료 일괄 변경 버튼 */}
          <div className="mb-4 flex items-center gap-3">
            {!showGlobalEdit ? (
              <button onClick={() => setShowGlobalEdit(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                <Percent size={16} /> 전체 수수료 일괄 변경
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
                <span className="text-sm font-medium text-indigo-700">전체 수수료:</span>
                <input type="number" min={0} max={100} step={1} value={globalRate}
                  onChange={e => setGlobalRate(e.target.value)}
                  className="w-20 px-3 py-1.5 rounded-lg border border-indigo-200 text-sm text-center font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-sm text-indigo-600 font-bold">%</span>
                <button onClick={handleApplyGlobalRate} disabled={savingRate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                  {savingRate ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={14} />}
                  {users.length}명 전체 적용
                </button>
                <button onClick={() => setShowGlobalEdit(false)} className="p-1.5 hover:bg-indigo-100 rounded-lg"><X size={14} className="text-indigo-400" /></button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
            <table className="w-full text-sm"><thead><tr>
              <th className={th}>이메일</th><th className={th}>이름</th><th className={th}>역할</th><th className={th}>상태</th>
              <th className={th}>수수료율</th><th className={th}>방송인 수</th><th className={th}>가입일</th>
            </tr></thead><tbody>
              {users.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-400">사용자 없음</td></tr> :
                users.map(u => {
                  const userTalentCount = talents.filter(t => t.agentId === u.uid).length;
                  const currentRate = u.commissionRate ? (u.commissionRate * 100).toFixed(0) : '15';
                  const isEditing = editingUserId === u.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-gray-50/50">
                      <td className={td}>{u.email}</td>
                      <td className={td}>{u.name || '-'}</td>
                      <td className={td}><span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                      <td className={td}><span className={`px-2 py-0.5 rounded text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                      <td className={td}>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input type="number" min={0} max={100} step={1} value={editRate}
                              onChange={e => setEditRate(e.target.value)} autoFocus
                              className="w-16 px-2 py-1 rounded border border-gray-300 text-sm text-center font-bold outline-none focus:ring-2 focus:ring-black" />
                            <span className="text-xs text-gray-500">%</span>
                            <button onClick={() => handleSaveUserRate(u.uid)} disabled={savingRate}
                              className="p-1 hover:bg-green-100 rounded text-green-600"><Check size={14} /></button>
                            <button onClick={() => setEditingUserId(null)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400"><X size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingUserId(u.uid); setEditRate(currentRate); }}
                            className="flex items-center gap-1.5 group">
                            <span className="font-bold">{currentRate}%</span>
                            <Edit3 size={12} className="text-gray-300 group-hover:text-gray-600" />
                          </button>
                        )}
                      </td>
                      <td className={td}>
                        <span className={`font-bold ${userTalentCount > 0 ? 'text-black' : 'text-gray-300'}`}>{userTalentCount}명</span>
                      </td>
                      <td className={`${td} text-gray-400 text-xs`}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  );
                })}
            </tbody></table>
          </div>
        </div>
      ))}

      {/* ═══ Talents — 담당자 표시 + 클릭 상세 ═══ */}
      {activeTab === 'talents' && renderSection(talentsState, (
        <div>
          <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
            <table className="w-full text-sm"><thead><tr>
              <th className={th}>이름</th><th className={th}>직책</th><th className={th}>담당 에이전트</th>
              <th className={th}>페이지</th><th className={th}>상태</th><th className={th}>생성일</th>
            </tr></thead><tbody>
              {talents.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-400">방송인 없음</td></tr> :
                talents.map(t => {
                  const slug = getTalentPageSlug(t.id);
                  const page = pages.find(p => p.talentId === t.id);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className={td}>
                        <button onClick={() => setSelectedTalent(t)} className="text-left group">
                          <span className="font-bold group-hover:text-indigo-600 group-hover:underline transition-colors">{t.nameKo}</span>
                          <span className="text-gray-400 text-xs ml-1">{t.nameEn}</span>
                        </button>
                      </td>
                      <td className={td}>{t.position}</td>
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {getAgentName(t.agentId)[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-xs font-medium">{getAgentName(t.agentId)}</p>
                            <p className="text-xs text-gray-400">{getAgentEmail(t.agentId)}</p>
                          </div>
                        </div>
                      </td>
                      <td className={td}>
                        {page ? (
                          <span className={`px-2 py-0.5 rounded text-xs ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {page.isPublished ? '게시됨' : '미게시'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">없음</span>
                        )}
                      </td>
                      <td className={td}><span className={`px-2 py-0.5 rounded text-xs ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.status}</span></td>
                      <td className={`${td} text-gray-400 text-xs`}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
            </tbody></table>
          </div>
        </div>
      ))}

      {/* ═══ 방송인 상세 모달 ═══ */}
      {selectedTalent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedTalent(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black">{selectedTalent.nameKo}</h2>
                <p className="text-gray-400">{selectedTalent.nameEn}</p>
              </div>
              <button onClick={() => setSelectedTalent(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
            </div>

            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">직책</p>
                  <p className="font-bold">{selectedTalent.position || '-'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">상태</p>
                  <p className="font-bold">{selectedTalent.status}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">담당 에이전트</p>
                  <p className="font-bold text-sm">{getAgentName(selectedTalent.agentId)}</p>
                  <p className="text-xs text-gray-400">{getAgentEmail(selectedTalent.agentId)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">생성일</p>
                  <p className="font-bold">{new Date(selectedTalent.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {(selectedTalent.email || selectedTalent.phone) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">연락처</p>
                  {selectedTalent.email && <p className="text-sm">{selectedTalent.email}</p>}
                  {selectedTalent.phone && <p className="text-sm">{selectedTalent.phone}</p>}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(() => {
                const slug = getTalentPageSlug(selectedTalent.id);
                const page = pages.find(p => p.talentId === selectedTalent.id);
                return (
                  <>
                    {slug && page?.isPublished && (
                      <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-black text-white py-3.5 rounded-2xl font-bold hover:bg-gray-800 transition-colors">
                        <Eye size={18} /> PR 홈페이지 보기
                      </a>
                    )}
                    {slug && (
                      <a href={`/checkout/${slug}`} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3.5 rounded-2xl font-bold hover:bg-indigo-100 transition-colors">
                        <ExternalLink size={18} /> 구매 페이지 열기
                      </a>
                    )}
                    {!slug && (
                      <p className="text-center text-gray-400 text-sm py-3">아직 PR 페이지가 생성되지 않았습니다</p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Pages ═══ */}
      {activeTab === 'pages' && renderSection(pagesState, (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm"><thead><tr>
            <th className={th}>Slug</th><th className={th}>방송인</th><th className={th}>담당자</th><th className={th}>상태</th><th className={th}>조회수</th><th className={th}>게시일</th>
          </tr></thead><tbody>
            {pages.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-400">페이지 없음</td></tr> :
              pages.map(p => {
                const talent = talents.find(t => t.id === p.talentId);
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className={`${td} font-mono text-sm`}>
                      {p.isPublished ? (
                        <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">/p/{p.slug}</a>
                      ) : <span className="text-gray-400">/p/{p.slug}</span>}
                    </td>
                    <td className={td}>{talent ? <span className="font-bold">{talent.nameKo}</span> : <span className="text-gray-300">-</span>}</td>
                    <td className={`${td} text-xs`}>{getAgentEmail(p.agentId)}</td>
                    <td className={td}><span className={`px-2 py-0.5 rounded text-xs ${p.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                    <td className={td}>{p.viewsCount || 0}</td>
                    <td className={`${td} text-gray-400 text-xs`}>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '-'}</td>
                  </tr>
                );
              })}
          </tbody></table>
        </div>
      ))}

      {/* ═══ Sales ═══ */}
      {activeTab === 'sales' && renderSection(salesState, (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm"><thead><tr>
            <th className={th}>일시</th><th className={th}>담당자</th><th className={th}>매출</th><th className={th}>수수료</th><th className={th}>정산금</th><th className={th}>결제</th><th className={th}>상태</th>
          </tr></thead><tbody>
            {sales.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-gray-400">매출 기록 없음</td></tr> :
              sales.map(s => (<tr key={s.id} className="hover:bg-gray-50/50">
                <td className={`${td} text-xs text-gray-400`}>{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className={`${td} text-xs`}>{getAgentEmail(s.agentId)}</td>
                <td className={`${td} font-bold`}>{formatKRW(s.grossAmount || 0)}</td>
                <td className={`${td} text-red-500`}>{formatKRW(s.platformCommissionAmount || 0)}</td>
                <td className={td}>{formatKRW(s.agentPayoutAmount || 0)}</td>
                <td className={td}>{s.paymentMethod || '-'}</td>
                <td className={td}><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s.paymentStatus || '-'}</span></td>
              </tr>))}
          </tbody></table>
        </div>
      ))}

      {/* ═══ Settlements ═══ */}
      {activeTab === 'settlements' && renderSection(settlementsState, (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm"><thead><tr>
            <th className={th}>담당자</th><th className={th}>기간</th><th className={th}>총매출</th><th className={th}>수수료</th><th className={th}>정산금</th><th className={th}>상태</th>
          </tr></thead><tbody>
            {settlements.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-400">정산 기록 없음</td></tr> :
              settlements.map(s => (<tr key={s.id} className="hover:bg-gray-50/50">
                <td className={`${td} text-xs`}>{getAgentEmail(s.agentId)}</td>
                <td className={td}>{s.startDate}~{s.endDate}</td>
                <td className={`${td} font-bold`}>{formatKRW(s.totalGrossAmount || 0)}</td>
                <td className={`${td} text-red-500`}>{formatKRW(s.totalPlatformCommission || 0)}</td>
                <td className={td}>{formatKRW(s.totalAgentPayout || 0)}</td>
                <td className={td}><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{s.status}</span></td>
              </tr>))}
          </tbody></table>
        </div>
      ))}

      {/* ═══ Activity ═══ */}
      {activeTab === 'activity' && (logsLoaded ? (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm"><thead><tr><th className={th}>시간</th><th className={th}>작업자</th><th className={th}>활동</th><th className={th}>요약</th></tr></thead><tbody>
            {activities.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-400">활동 기록 없음</td></tr> :
              activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(a => (<tr key={a.id} className="hover:bg-gray-50/50">
                <td className={`${td} text-xs text-gray-400 whitespace-nowrap`}>{new Date(a.createdAt).toLocaleString()}</td>
                <td className={`${td} text-xs`}>{a.actorEmail}</td>
                <td className={td}><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{a.activityType}</span></td>
                <td className={td}>{a.summary}</td>
              </tr>))}
          </tbody></table>
        </div>
      ) : <div className="p-12 flex justify-center"><div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" /></div>)}

      {/* ═══ Audit ═══ */}
      {activeTab === 'audit' && (logsLoaded ? (
        <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm"><thead><tr><th className={th}>시간</th><th className={th}>작업자</th><th className={th}>액션</th><th className={th}>대상</th><th className={th}>라벨</th></tr></thead><tbody>
            {auditLogs.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-400">감사 기록 없음</td></tr> :
              auditLogs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(a => (<tr key={a.id} className="hover:bg-gray-50/50">
                <td className={`${td} text-xs text-gray-400 whitespace-nowrap`}>{new Date(a.createdAt).toLocaleString()}</td>
                <td className={`${td} text-xs`}>{a.actorEmail}</td>
                <td className={td}><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{a.action}</span></td>
                <td className={td}>{a.targetType}</td>
                <td className={td}>{a.targetLabel}</td>
              </tr>))}
          </tbody></table>
        </div>
      ) : <div className="p-12 flex justify-center"><div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" /></div>)}
    </div>
  );
};

export default OwnerConsole;
