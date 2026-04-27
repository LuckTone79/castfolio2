"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface FormInfo {
  talentName: string;
  customFields?: Record<string, unknown>;
  expiresAt?: string;
}

export default function SubmitPage() {
  const params = useParams();
  const token = params.token as string;

  const [info, setInfo] = useState<FormInfo | null>(null);
  const [expired, setExpired] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nameKo: "", nameEn: "",
    tagline: "", intro: "",
    career: "",
    strengths: "",
    videoUrls: "",
    email: "", kakaoId: "",
    instagram: "", youtube: "",
    other: "",
  });

  useEffect(() => {
    fetch(`/api/public/intake/${token}`)
      .then(r => {
        if (r.status === 410) { setExpired(true); setLoading(false); return null; }
        if (!r.ok) { setExpired(true); setLoading(false); return null; }
        return r.json();
      })
      .then(d => { if (d) setInfo(d); setLoading(false); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/public/intake/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  if (expired) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <p className="text-4xl mb-4">⏰</p>
        <h1 className="text-xl font-bold mb-2">링크가 만료되었습니다</h1>
        <p className="text-gray-500">이 자료 제출 링크는 만료되었습니다. 담당자에게 연락해주세요.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <p className="text-4xl mb-4">✅</p>
        <h1 className="text-xl font-bold mb-2">제출 완료!</h1>
        <p className="text-gray-500">자료가 성공적으로 제출되었습니다. 감사합니다!</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <p className="text-sm text-blue-600 font-medium mb-2">Castfolio</p>
          <h1 className="text-2xl font-bold text-gray-900">자료 제출</h1>
          {info?.talentName && <p className="text-gray-500 mt-1">{info.talentName}님의 PR 페이지 제작을 위한 자료 수집입니다.</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">이름 (한글)</label>
              <input value={form.nameKo} onChange={e => setForm(p => ({ ...p, nameKo: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm" placeholder="홍길동" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">이름 (영문)</label>
              <input value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm" placeholder="Hong Gildong" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">한 줄 소개 <span className="text-gray-400">(30자 이내 권장)</span></label>
            <input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} maxLength={50}
              className="w-full px-3 py-2 border rounded-md text-sm" placeholder="10년 경력의 홈쇼핑 쇼호스트" />
            <p className="text-xs text-gray-400 text-right mt-1">{form.tagline.length}/30</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">자기소개 <span className="text-gray-400">(자유 형식)</span></label>
            <textarea value={form.intro} onChange={e => setForm(p => ({ ...p, intro: e.target.value }))} rows={5}
              className="w-full px-3 py-2 border rounded-md text-sm resize-y"
              placeholder="경력, 강점, 특기 등을 자유롭게 작성해 주세요." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">경력 사항</label>
            <textarea value={form.career} onChange={e => setForm(p => ({ ...p, career: e.target.value }))} rows={4}
              className="w-full px-3 py-2 border rounded-md text-sm resize-y"
              placeholder="2020-현재: OO방송 쇼호스트&#10;2018-2020: XX채널 리포터" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">강점/특기</label>
            <input value={form.strengths} onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md text-sm" placeholder="예: 뷰티 전문, 영어 능통, 고음 발성" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">방송 영상 URL <span className="text-gray-400">(YouTube, 네이버TV — 여러 개면 줄바꿈)</span></label>
            <textarea value={form.videoUrls} onChange={e => setForm(p => ({ ...p, videoUrls: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="https://youtu.be/..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">카카오톡 ID</label>
              <input value={form.kakaoId} onChange={e => setForm(p => ({ ...p, kakaoId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">인스타그램</label>
              <input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md text-sm" placeholder="@username" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">기타 요청사항</label>
            <textarea value={form.other} onChange={e => setForm(p => ({ ...p, other: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border rounded-md text-sm" />
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
            {submitting ? "제출 중..." : "제출하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
