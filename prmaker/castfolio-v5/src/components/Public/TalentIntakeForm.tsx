import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Talent, PageContent, Language } from '../../types';
import { compressImageToDataUrl } from '../../lib/storage';
import { CheckCircle, AlertCircle, Upload, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../lib/i18n';

interface TalentIntakeFormProps {
  token: string;
}

const TalentIntakeForm: React.FC<TalentIntakeFormProps> = ({ token }) => {
  const { language, setLanguage } = useLanguage();
  const t = (key: string) => getTranslation(language, key);
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<PageContent>>({
    hero: { nameKo: '', nameEn: '', tagline: '', photoUrl: '' },
    about: { bio: '', profilePhotoUrl: '' },
    career: [],
    portfolio: [],
    strengths: [],
    contact: { email: '', phone: '', instagram: '', youtube: '' }
  });

  useEffect(() => {
    const fetchTalent = async () => {
      try {
        const q = query(collection(db, 'talents'), where('intakeToken', '==', token));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError(t('invalidLink'));
          setLoading(false);
          return;
        }

        setTalent({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Talent);
        
        // Load draft from localStorage
        const draft = localStorage.getItem(`intake-draft-${token}`);
        if (draft) {
          setFormData(JSON.parse(draft));
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(t('dataLoadError'));
        setLoading(false);
      }
    };

    fetchTalent();
  }, [token]);

  // Auto-save to localStorage
  useEffect(() => {
    if (talent && !success) {
      const timeout = setTimeout(() => {
        localStorage.setItem(`intake-draft-${token}`, JSON.stringify(formData));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [formData, talent, token, success]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'hero' | 'about') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageToDataUrl(file, 1200, 0.8);
      if (field === 'hero') {
        setFormData(prev => ({ ...prev, hero: { ...prev.hero!, photoUrl: dataUrl } }));
      } else {
        setFormData(prev => ({ ...prev, about: { ...prev.about!, profilePhotoUrl: dataUrl } }));
      }
    } catch (err) {
      alert(t('imageUploadFailed'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!talent || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'intake_submissions'), {
        talentId: talent.id,
        agentId: talent.agentId,
        token,
        status: 'submitted',
        formData,
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setSuccess(true);
      localStorage.removeItem(`intake-draft-${token}`);
    } catch (err) {
      console.error(err);
      alert(t('submissionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('error')}</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t('submissionComplete')}</h1>
          <p className="text-gray-500 mb-6">{t('submissionSuccessDesc')}</p>
        </motion.div>
      </div>
    );
  }

  const languages: { code: Language; label: string }[] = [
    { code: 'ko', label: '한' }, { code: 'ja', label: '日' }, { code: 'zh', label: '中' }, { code: 'vi', label: 'VN' }, { code: 'en', label: 'EN' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-black p-8 text-white relative">
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl">
            {languages.map(lang => (
              <button key={lang.code} type="button" onClick={() => setLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${language === lang.code ? 'bg-white text-black shadow-md' : 'text-gray-300 hover:text-white hover:bg-white/20'}`}>
                {lang.label}
              </button>
            ))}
          </div>
          <div className="text-center mt-6">
            <h1 className="text-3xl font-bold mb-2">{talent?.nameKo}{t('prMaterialSubmission')}</h1>
            <p className="text-gray-400">{t('prMaterialDesc')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Hero Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{t('basicInfoHero')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tagline')}</label>
                <input 
                  type="text" 
                  value={formData.hero?.tagline || ''}
                  onChange={e => setFormData(prev => ({ ...prev, hero: { ...prev.hero!, tagline: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                  placeholder={t('taglinePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('heroBgImage')}</label>
                <div className="flex items-center gap-4">
                  {formData.hero?.photoUrl && (
                    <img src={formData.hero.photoUrl} alt="Hero" className="w-24 h-24 object-cover rounded-xl" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                    <Upload size={18} />
                    <span>{t('imageUpload')}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'hero')} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{t('aboutMeSection')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('aboutContent')}</label>
                <textarea 
                  rows={5}
                  value={formData.about?.bio || ''}
                  onChange={e => setFormData(prev => ({ ...prev, about: { ...prev.about!, bio: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none resize-none"
                  placeholder={t('aboutPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profileImage')}</label>
                <div className="flex items-center gap-4">
                  {formData.about?.profilePhotoUrl && (
                    <img src={formData.about.profilePhotoUrl} alt="Profile" className="w-24 h-24 object-cover rounded-xl" />
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer transition-colors">
                    <Upload size={18} />
                    <span>{t('imageUpload')}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'about')} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Career Section */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">{t('keyCareer')}</h2>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, career: [...(prev.career || []), { id: Date.now().toString(), title: '', role: '', period: '', description: '' }] }))}
                className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800"
              >
                <Plus size={16} /> {t('add')}
              </button>
            </div>
            <div className="space-y-6">
              {formData.career?.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-2xl relative group">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, career: prev.career?.filter(c => c.id !== item.id) }))}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={e => {
                        const newCareer = [...(formData.career || [])];
                        newCareer[index].title = e.target.value;
                        setFormData(prev => ({ ...prev, career: newCareer }));
                      }}
                      placeholder={t('programName')}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none"
                    />
                    <input 
                      type="text" 
                      value={item.role || ''}
                      onChange={e => {
                        const newCareer = [...(formData.career || [])];
                        newCareer[index].role = e.target.value;
                        setFormData(prev => ({ ...prev, career: newCareer }));
                      }}
                      placeholder={t('formRole')}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={item.period}
                    onChange={e => {
                      const newCareer = [...(formData.career || [])];
                      newCareer[index].period = e.target.value;
                      setFormData(prev => ({ ...prev, career: newCareer }));
                    }}
                    placeholder={t('formPeriod')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none mb-4"
                  />
                  <textarea 
                    value={item.description}
                    onChange={e => {
                      const newCareer = [...(formData.career || [])];
                      newCareer[index].description = e.target.value;
                      setFormData(prev => ({ ...prev, career: newCareer }));
                    }}
                    placeholder={t('detailedDesc')}
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none resize-none"
                  />
                </div>
              ))}
              {(!formData.career || formData.career.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-4">{t('noCareerRegistered')}</p>
              )}
            </div>
          </section>

          {/* Portfolio Section */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">{t('portfolio')}</h2>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, portfolio: [...(prev.portfolio || []), { id: Date.now().toString(), title: '', type: 'image', url: '', description: '' }] }))}
                className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800"
              >
                <Plus size={16} /> {t('add')}
              </button>
            </div>
            <div className="space-y-6">
              {formData.portfolio?.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-2xl relative group">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, portfolio: prev.portfolio?.filter(p => p.id !== item.id) }))}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pr-8">
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={e => {
                        const newPortfolio = [...(formData.portfolio || [])];
                        newPortfolio[index].title = e.target.value;
                        setFormData(prev => ({ ...prev, portfolio: newPortfolio }));
                      }}
                      placeholder={t('portfolioTitle')}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none"
                    />
                    <select
                      value={item.type}
                      onChange={e => {
                        const newPortfolio = [...(formData.portfolio || [])];
                        newPortfolio[index].type = e.target.value as 'image' | 'video';
                        setFormData(prev => ({ ...prev, portfolio: newPortfolio }));
                      }}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none bg-white"
                    >
                      <option value="image">{t('formImage')}</option>
                      <option value="video">{t('formVideo')}</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    {item.type === 'image' ? (
                      <div className="flex items-center gap-4">
                        {item.url && <img src={item.url} alt="Portfolio" className="w-16 h-16 object-cover rounded-xl" />}
                        <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors text-sm">
                          <Upload size={16} />
                          <span>{t('imageUpload')}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const dataUrl = await compressImageToDataUrl(file, 1200, 0.8);
                                const newPortfolio = [...(formData.portfolio || [])];
                                newPortfolio[index].url = dataUrl;
                                setFormData(prev => ({ ...prev, portfolio: newPortfolio }));
                              } catch (err) {
                                alert(t('imageUploadFailed'));
                              }
                            }} 
                          />
                        </label>
                      </div>
                    ) : (
                      <input 
                        type="url" 
                        value={item.url}
                        onChange={e => {
                          const newPortfolio = [...(formData.portfolio || [])];
                          newPortfolio[index].url = e.target.value;
                          setFormData(prev => ({ ...prev, portfolio: newPortfolio }));
                        }}
                        placeholder={t('formVideoUrl')}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none"
                      />
                    )}
                  </div>
                  <textarea 
                    value={item.description || ''}
                    onChange={e => {
                      const newPortfolio = [...(formData.portfolio || [])];
                      newPortfolio[index].description = e.target.value;
                      setFormData(prev => ({ ...prev, portfolio: newPortfolio }));
                    }}
                    placeholder={t('detailedDescOptional')}
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none resize-none"
                  />
                </div>
              ))}
              {(!formData.portfolio || formData.portfolio.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-4">{t('noPortfolioRegistered')}</p>
              )}
            </div>
          </section>

          {/* Strengths Section */}
          <section>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-bold">{t('keyStrengths')}</h2>
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, strengths: [...(formData.strengths || []), { id: Date.now().toString(), title: '', description: '', icon: 'Star' }] }))}
                className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800"
              >
                <Plus size={16} /> {t('add')}
              </button>
            </div>
            <div className="space-y-6">
              {formData.strengths?.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-2xl relative group">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, strengths: prev.strengths?.filter(s => s.id !== item.id) }))}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                  <input 
                    type="text" 
                    value={item.title}
                    onChange={e => {
                      const newStrengths = [...(formData.strengths || [])];
                      newStrengths[index].title = e.target.value;
                      setFormData(prev => ({ ...prev, strengths: newStrengths }));
                    }}
                    placeholder={t('strengthKeyword')}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none mb-4 pr-8"
                  />
                  <textarea 
                    value={item.description}
                    onChange={e => {
                      const newStrengths = [...(formData.strengths || [])];
                      newStrengths[index].description = e.target.value;
                      setFormData(prev => ({ ...prev, strengths: newStrengths }));
                    }}
                    placeholder={t('detailedDesc')}
                    rows={3}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 outline-none resize-none"
                  />
                </div>
              ))}
              {(!formData.strengths || formData.strengths.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-4">{t('noStrengthsRegistered')}</p>
              )}
            </div>
          </section>

          {/* Contact Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">{t('contactInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('formEmail')}</label>
                <input 
                  type="email" 
                  value={formData.contact?.email || ''}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact!, email: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('contactNumber')}</label>
                <input 
                  type="text" 
                  value={formData.contact?.phone || ''}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact!, phone: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('formInstagramUrl')}</label>
                <input 
                  type="url" 
                  value={formData.contact?.instagram || ''}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact!, instagram: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('formYoutubeUrl')}</label>
                <input 
                  type="url" 
                  value={formData.contact?.youtube || ''}
                  onChange={e => setFormData(prev => ({ ...prev, contact: { ...prev.contact!, youtube: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
            </div>
          </section>

          <div className="pt-8 border-t">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                t('submitData')
              )}
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              {t('autoSaveNotice')}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TalentIntakeForm;
