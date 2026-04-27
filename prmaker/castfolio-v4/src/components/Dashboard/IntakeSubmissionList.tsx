import React, { useEffect, useState, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { Talent, IntakeSubmission, Page } from '../../types';
import { Inbox, CheckCircle, Clock, AlertCircle, Download, RefreshCcw, ArrowLeft, Layout } from 'lucide-react';
import { logAuditEvent } from '../../lib/audit';
import { DATA_LOAD_TIMEOUT_MS } from '../../config';

interface IntakeSubmissionListProps {
  onEditTalent?: (talent: Talent) => void;
}

const IntakeSubmissionList: React.FC<IntakeSubmissionListProps> = ({ onEditTalent }) => {
  const { user, role } = useAuth();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [talentsLoading, setTalentsLoading] = useState(true);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [talentsError, setTalentsError] = useState<string | null>(null);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<{ submission: IntakeSubmission; talent: Talent } | null>(null);
  const mountedRef = useRef(true);

  const isOwner = role === 'owner';
  const combinedLoading = talentsLoading || submissionsLoading;
  const fetchError = talentsError || submissionsError;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // 타임아웃
  useEffect(() => {
    if (!combinedLoading) { setTimeoutReached(false); return; }
    const timer = setTimeout(() => {
      if (mountedRef.current && (talentsLoading || submissionsLoading)) {
        setTimeoutReached(true);
        // 타임아웃 시 로딩 강제 해제
        setTalentsLoading(false);
        setSubmissionsLoading(false);
      }
    }, DATA_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [combinedLoading, talentsLoading, submissionsLoading]);

  useEffect(() => {
    if (!user || !role) {
      setTalentsLoading(false);
      setSubmissionsLoading(false);
      return;
    }

    const talentsQuery = isOwner
      ? collection(db, 'talents')
      : query(collection(db, 'talents'), where('agentId', '==', user.uid));

    const submissionsQuery = isOwner
      ? collection(db, 'intake_submissions')
      : query(collection(db, 'intake_submissions'), where('agentId', '==', user.uid));

    const unsubTalents = onSnapshot(
      talentsQuery,
      (snapshot) => {
        if (!mountedRef.current) return;
        setTalents(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Talent)));
        setTalentsLoading(false);
        setTalentsError(null);
      },
      (err) => {
        console.error('Talents onSnapshot error:', err);
        if (!mountedRef.current) return;
        setTalentsError(`방송인 데이터: ${err.message}`);
        setTalentsLoading(false);
      }
    );

    const unsubSubmissions = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        if (!mountedRef.current) return;
        setSubmissions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as IntakeSubmission)));
        setSubmissionsLoading(false);
        setSubmissionsError(null);
      },
      (err) => {
        console.error('Submissions onSnapshot error:', err);
        if (!mountedRef.current) return;
        setSubmissionsError(`제출 데이터: ${err.message}`);
        setSubmissionsLoading(false);
      }
    );

    return () => { unsubTalents(); unsubSubmissions(); };
  }, [user, role]);

  const handleImportToBuilder = async (submission: IntakeSubmission, talent: Talent) => {
    if (!window.confirm('이 제출 자료를 빌더에 가져오시겠습니까?')) return;
    setImportingId(submission.id);
    try {
      const pagesQuery = query(collection(db, 'pages'), where('talentId', '==', talent.id));
      const pagesSnapshot = await getDocs(pagesQuery);
      if (pagesSnapshot.empty) {
        alert('이 방송인의 페이지가 아직 생성되지 않았습니다. 먼저 방송인 관리에서 PR 페이지를 만들어주세요.');
        setImportingId(null);
        return;
      }
      const pageDoc = pagesSnapshot.docs[0];
      const pageData = pageDoc.data() as Page;
      const newContent = { ...pageData.content };

      // Helper to merge objects, ignoring empty strings
      const mergeIgnoringEmpty = (target: any, source: any) => {
        if (!source) return target;
        const result = { ...target };
        for (const key in source) {
          if (source[key] !== '' && source[key] !== null && source[key] !== undefined) {
            result[key] = source[key];
          }
        }
        return result;
      };

      if (submission.formData.hero) newContent.hero = mergeIgnoringEmpty(newContent.hero, submission.formData.hero);
      if (submission.formData.about) newContent.about = mergeIgnoringEmpty(newContent.about, submission.formData.about);
      
      // For arrays, if the submitted array is empty, keep the existing one
      if (submission.formData.career && submission.formData.career.length > 0) newContent.career = submission.formData.career;
      if (submission.formData.portfolio && submission.formData.portfolio.length > 0) newContent.portfolio = submission.formData.portfolio;
      if (submission.formData.strengths && submission.formData.strengths.length > 0) newContent.strengths = submission.formData.strengths;
      
      if (submission.formData.contact) newContent.contact = mergeIgnoringEmpty(newContent.contact, submission.formData.contact);

      await updateDoc(doc(db, 'pages', pageDoc.id), { content: newContent, updatedAt: new Date().toISOString() });
      await updateDoc(doc(db, 'intake_submissions', submission.id), { status: 'imported', importedAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      if (user) {
        await logAuditEvent({ db, actorId: user.uid, actorEmail: user.email || '', action: 'import_intake_submission', targetType: 'page', targetId: pageDoc.id, targetLabel: talent.nameKo, meta: { submissionId: submission.id } });
      }
      alert('자료를 빌더에 성공적으로 가져왔습니다.');
    } catch (err) {
      console.error(err);
      alert('자료 가져오기에 실패했습니다.');
    } finally {
      setImportingId(null);
    }
  };

  // 데이터 표시용 목록
  const displayItems = talents.map(talent => {
    const talentSubmissions = submissions
      .filter(s => s.talentId === talent.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return {
      talent,
      submission: talentSubmissions[0] || null,
      status: talentSubmissions[0] ? talentSubmissions[0].status : ('pending' as const),
    };
  });

  // 항상 UI 프레임을 보여주고, 내부 내용만 상태별로 분기
  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">자료 수집</h1>
        <p className="text-gray-500">방송인에게 링크를 보내 PR 자료를 받고, 빌더에 반영할 수 있습니다.</p>
      </div>

      {/* 사용 안내 (항상 표시) */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
        <h4 className="font-bold text-indigo-900 text-sm mb-2">사용 방법</h4>
        <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside">
          <li><strong>방송인 관리</strong> 탭에서 방송인을 먼저 등록하세요</li>
          <li>방송인 카드를 클릭 → <strong>"자료 수집 링크 생성"</strong> 클릭</li>
          <li>생성된 링크를 방송인에게 전달 (카톡/이메일 등)</li>
          <li>방송인이 링크에서 자료를 작성하고 제출하면 여기에 표시됩니다</li>
          <li><strong>"빌더로 가져오기"</strong>를 눌러 PR 페이지에 반영하세요</li>
        </ol>
      </div>

      {/* 에러 배너 */}
      {fetchError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">데이터 로드 오류</p>
            <p className="text-red-600 text-xs mt-1">{fetchError}</p>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
            <RefreshCcw size={12} /> 새로고침
          </button>
        </div>
      )}

      {/* 타임아웃 배너 */}
      {timeoutReached && !fetchError && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 text-sm font-medium">응답이 지연되었습니다</p>
            <p className="text-yellow-600 text-xs mt-1">네트워크 또는 권한 문제일 수 있습니다</p>
          </div>
          <button onClick={() => window.location.reload()} className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200">
            <RefreshCcw size={12} /> 새로고침
          </button>
        </div>
      )}

      {/* 메인 테이블 — 로딩 중이어도 프레임은 보여줌 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
              <th className="p-4 font-medium">방송인</th>
              <th className="p-4 font-medium">상태</th>
              <th className="p-4 font-medium">제출 일시</th>
              <th className="p-4 font-medium text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {/* 로딩 중 */}
            {combinedLoading && (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">데이터를 불러오는 중...</p>
                </td>
              </tr>
            )}

            {/* 로딩 완료 + 방송인 없음 */}
            {!combinedLoading && talents.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-1">등록된 방송인이 없습니다</p>
                  <p className="text-gray-400 text-sm">"방송인 관리" 탭에서 먼저 방송인을 추가하세요</p>
                </td>
              </tr>
            )}

            {/* 로딩 완료 + 목록 표시 */}
            {!combinedLoading && displayItems.map(item => (
              <tr key={item.talent.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold">{item.talent.nameKo}</div>
                  <div className="text-xs text-gray-400">{item.talent.position}</div>
                </td>
                <td className="p-4">
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <Clock size={12} /> 미제출
                    </span>
                  )}
                  {item.status === 'submitted' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Inbox size={12} /> 제출됨
                    </span>
                  )}
                  {item.status === 'imported' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle size={12} /> 반영 완료
                    </span>
                  )}
                  {item.status === 'draft' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <Clock size={12} /> 작성 중
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {item.submission?.submittedAt ? new Date(item.submission.submittedAt).toLocaleString() : '-'}
                </td>
                <td className="p-4 text-right">
                  {item.status === 'submitted' && item.submission && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingSubmission({ submission: item.submission!, talent: item.talent })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        보기
                      </button>
                      {onEditTalent && (
                        <button
                          onClick={() => onEditTalent(item.talent)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                        >
                          <Layout size={16} />
                          빌더
                        </button>
                      )}
                      <button
                        onClick={() => handleImportToBuilder(item.submission!, item.talent)}
                        disabled={importingId === item.submission.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        {importingId === item.submission.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        빌더로 가져오기
                      </button>
                    </div>
                  )}
                  {item.status === 'pending' && (
                    <span className="text-sm text-gray-400">링크 전달 필요</span>
                  )}
                  {item.status === 'imported' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingSubmission({ submission: item.submission!, talent: item.talent })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        보기
                      </button>
                      {onEditTalent && (
                        <button
                          onClick={() => onEditTalent(item.talent)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                        >
                          <Layout size={16} />
                          빌더
                        </button>
                      )}
                      <span className="text-sm text-green-500 font-medium">반영 완료</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{viewingSubmission.talent.nameKo}님의 제출 자료</h2>
              <button onClick={() => setViewingSubmission(null)} className="text-gray-400 hover:text-gray-600">
                &times; 닫기
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <div className="space-y-6">
                {Object.entries(viewingSubmission.submission.formData).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  return (
                    <div key={key} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">{key}</h3>
                      {Array.isArray(value) ? (
                        <div className="space-y-4">
                          {value.map((item: any, i: number) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                              {typeof item === 'object' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(item).map(([k, v]) => (
                                    <div key={k}>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase">{k}</p>
                                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{String(v)}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-900">{String(item)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : typeof value === 'object' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {Object.entries(value).map(([k, v]) => (
                            <div key={k}>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{k}</p>
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{String(v)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{String(value)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white">
              <div className="flex gap-2">
                {onEditTalent && (
                  <button 
                    onClick={() => {
                      onEditTalent(viewingSubmission.talent);
                      setViewingSubmission(null);
                    }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <Layout size={18} />
                    빌더로 이동
                  </button>
                )}
              </div>
              <button 
                onClick={() => setViewingSubmission(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntakeSubmissionList;
