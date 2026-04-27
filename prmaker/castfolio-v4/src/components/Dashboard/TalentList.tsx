import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, writeBatch, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { Talent } from '../../types';
import { Plus, Users, Layout, Clock, AlertCircle, Trash2, Link as LinkIcon, Copy, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logAuditEvent } from '../../lib/audit';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../lib/i18n';
import { useToast } from '../Toast';

interface TalentListProps {
  onSelectTalent: (talent: Talent) => void;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const TalentList: React.FC<TalentListProps> = ({ onSelectTalent }) => {
  const { user, role } = useAuth();
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = (key: string) => getTranslation(language, key);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTalent, setNewTalent] = useState({ nameKo: '', nameEn: '', position: '', email: '', phone: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFirestoreError = (err: any, operation: OperationType, path: string) => {
    const errInfo = {
      error: err instanceof Error ? err.message : String(err),
      operationType: operation,
      path,
      userId: user?.uid,
      role
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    setError(`Error ${operation}ing ${path}: ${errInfo.error}`);
  };

  useEffect(() => {
    if (!user || !role) return;
    
    // Admins see all talents, agents see only their own
    const q = role === 'owner' 
      ? collection(db, 'talents')
      : query(collection(db, 'talents'), where('agentId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTalents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Talent)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'talents');
    });
    return unsubscribe;
  }, [user, role]);

  const handleAddTalent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const talentData = {
        ...newTalent,
        agentId: user.uid,
        status: 'draft' as const,
        createdAt: new Date().toISOString(),
      };
      
      console.log('Creating talent:', talentData);
      const docRef = await addDoc(collection(db, 'talents'), talentData);
      console.log('Talent created with ID:', docRef.id);
      
      // Automatically select the new talent to move to the next step (Builder)
      onSelectTalent({ id: docRef.id, ...talentData } as Talent);
      
      setShowAddModal(false);
      setNewTalent({ nameKo: '', nameEn: '', position: '', email: '', phone: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'talents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [selectedTalentForMenu, setSelectedTalentForMenu] = useState<Talent | null>(null);
  const [selectedTalentPage, setSelectedTalentPage] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  useEffect(() => {
    if (!selectedTalentForMenu || !user) {
      setSelectedTalentPage(null);
      return;
    }
    const fetchPage = async () => {
      try {
        const q = query(collection(db, 'pages'), where('talentId', '==', selectedTalentForMenu.id), where('agentId', '==', user.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setSelectedTalentPage({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        } else {
          setSelectedTalentPage(null);
        }
      } catch (err) {
        console.error('Failed to fetch page for talent:', err);
      }
    };
    fetchPage();
  }, [selectedTalentForMenu, user]);

  const handleGenerateIntakeLink = async (talent: Talent) => {
    try {
      setIsGeneratingLink(true);
      let token = talent.intakeToken;
      
      if (!token) {
        token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await updateDoc(doc(db, 'talents', talent.id), { intakeToken: token });
        
        if (user) {
          await logAuditEvent({
            db,
            actorId: user.uid,
            actorEmail: user.email || '',
            action: 'generate_intake_link',
            targetType: 'talent',
            targetId: talent.id,
            targetLabel: talent.nameKo,
            meta: { token }
          });
        }
        
        // Update local state to reflect the new token immediately
        setSelectedTalentForMenu({ ...talent, intakeToken: token });
      }

      const link = `${window.location.origin}/submit/${token}`;
      await navigator.clipboard.writeText(link);
      toast('링크가 클립보드에 복사되었습니다!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'talents');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleDeleteTalent = async (talent: Talent) => {
    setIsDeleting(true);
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'talents', talent.id));

      try {
        const pagesQuery = query(collection(db, 'pages'), where('talentId', '==', talent.id), where('agentId', '==', user!.uid));
        const pagesSnapshot = await getDocs(pagesQuery);
        pagesSnapshot.forEach((pageDoc) => { batch.delete(pageDoc.ref); });
      } catch (e) { console.warn('Pages query failed:', e); }

      try {
        const salesQuery = query(collection(db, 'sales'), where('talentId', '==', talent.id), where('agentId', '==', user!.uid));
        const salesSnapshot = await getDocs(salesQuery);
        salesSnapshot.forEach((saleDoc) => { batch.delete(saleDoc.ref); });
      } catch (e) { console.warn('Sales query failed:', e); }

      try {
        const intakesQuery = query(collection(db, 'intake_submissions'), where('talentId', '==', talent.id), where('agentId', '==', user!.uid));
        const intakesSnapshot = await getDocs(intakesQuery);
        intakesSnapshot.forEach((intakeDoc) => { batch.delete(intakeDoc.ref); });
      } catch (e) { console.warn('Intakes query failed:', e); }

      await batch.commit();

      if (user) {
        await logAuditEvent({
          db, actorId: user.uid, actorEmail: user.email || '',
          action: 'delete_talent', targetType: 'talent',
          targetId: talent.id, targetLabel: talent.nameKo,
        });
      }
      toast('방송인이 삭제되었습니다.', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      toast('삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setSelectedTalentForMenu(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('myTalents')}</h1>
          <p className="text-gray-500">{t('manageTalentsDesc')}</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
          <span>{t('addNewTalent')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {talents.map((talent) => (
          <motion.div 
            key={talent.id}
            layoutId={talent.id}
            onClick={() => setSelectedTalentForMenu(talent)}
            className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <Users size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                talent.status === 'active' ? 'bg-green-100 text-green-700' : 
                talent.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {t(talent.status === 'draft' ? 'draft' : talent.status === 'active' ? 'published' : 'archived')}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{talent.nameKo}</h3>
            <p className="text-gray-500 text-sm mb-4">{talent.position}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-400 border-t pt-4">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{new Date(talent.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1 group-hover:text-black transition-colors">
                <Layout size={14} />
                <span>{t('manage')}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {talents.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">{t('noTalents')}</h3>
          <p className="text-gray-500 mb-6">{t('addFirstTalent')}</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            {t('addTalent')}
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedTalentForMenu && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <h2 className="text-2xl font-bold mb-2">{selectedTalentForMenu.nameKo}</h2>
              <p className="text-gray-500 mb-8">{selectedTalentForMenu.position}</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    onSelectTalent(selectedTalentForMenu);
                    setSelectedTalentForMenu(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  <Layout size={20} />
                  <span>{t('editPRPage')}</span>
                </button>
                <button 
                  onClick={() => handleGenerateIntakeLink(selectedTalentForMenu)}
                  disabled={isGeneratingLink}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
                >
                  {isGeneratingLink ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /> : <LinkIcon size={20} />}
                  <span>{selectedTalentForMenu.intakeToken ? t('copyIntakeLink') : t('generateIntakeLink')}</span>
                </button>

                {selectedTalentPage?.isPublished && (
                  <>
                    <button 
                      onClick={async () => {
                        const link = `${window.location.origin}/p/${selectedTalentPage.slug}`;
                        await navigator.clipboard.writeText(link);
                        toast('게시된 페이지 링크가 클립보드에 복사되었습니다!', 'success');
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 py-4 rounded-2xl font-bold hover:bg-green-100 transition-all"
                    >
                      <Copy size={20} />
                      <span>게시된 페이지 링크 복사</span>
                    </button>
                    <a 
                      href={`/p/${selectedTalentPage.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-100 transition-all"
                    >
                      <Globe size={20} />
                      <span>게시된 페이지 보기</span>
                    </a>
                  </>
                )}

                {/* 삭제: 2단계 확인 */}
                {!showDeleteConfirm ? (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={20} />
                    <span>{t('deleteTalent')}</span>
                  </button>
                ) : (
                  <div className="w-full bg-red-50 border-2 border-red-200 rounded-2xl p-4 space-y-3">
                    <p className="text-red-700 text-sm font-medium text-center">
                      정말 <strong>{selectedTalentForMenu.nameKo}</strong>을(를) 삭제하시겠습니까?<br />
                      <span className="text-xs text-red-500">PR 페이지, 판매 기록도 함께 삭제됩니다.</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-white"
                      >
                        아니오
                      </button>
                      <button
                        onClick={() => handleDeleteTalent(selectedTalentForMenu)}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {isDeleting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 size={14} />}
                        {isDeleting ? '삭제 중...' : '삭제 확인'}
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => { setSelectedTalentForMenu(null); setShowDeleteConfirm(false); }}
                  className="w-full py-4 text-gray-400 font-medium hover:text-gray-600 transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">{t('addNewTalent')}</h2>
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleAddTalent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameKo')}</label>
                  <input 
                    required
                    type="text" 
                    value={newTalent.nameKo}
                    onChange={e => setNewTalent({...newTalent, nameKo: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                    placeholder={t('placeholderNameKo')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('nameEn')}</label>
                  <input 
                    required
                    type="text" 
                    value={newTalent.nameEn}
                    onChange={e => setNewTalent({...newTalent, nameEn: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                    placeholder={t('placeholderNameEn')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('position')}</label>
                  <input 
                    required
                    type="text" 
                    value={newTalent.position}
                    onChange={e => setNewTalent({...newTalent, position: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                    placeholder={t('placeholderPosition')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                    <input 
                      type="email" 
                      value={newTalent.email}
                      onChange={e => setNewTalent({...newTalent, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      placeholder={t('placeholderEmail')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                    <input 
                      type="text" 
                      value={newTalent.phone}
                      onChange={e => setNewTalent({...newTalent, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                      placeholder={t('placeholderPhone')}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t('createTalent')
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TalentList;
