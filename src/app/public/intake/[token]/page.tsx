"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Input, Textarea, FormField } from "@/components/ui";
import { Sparkles, Upload, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

const STEPS = ["기본 정보", "경력 사항", "포트폴리오", "연락처"];

export default function IntakePage() {
  const params = useParams();
  const token = params.token as string;
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formInfo, setFormInfo] = useState<{ talentName: string; projectName: string } | null>(null);
  const [data, setData] = useState({
    intro: "",
    position: "",
    tagline: "",
    careerItems: [{ period: "", title: "", description: "" }],
    portfolioUrls: [""],
    contactChannels: [{ type: "email", value: "" }],
  });

  useEffect(() => {
    fetch(`/api/public/intake/${token}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setFormInfo({ talentName: d.talent?.nameKo || "방송인", projectName: d.project?.name || "프로젝트" }))
      .catch(() => setError("유효하지 않은 링크이거나 만료된 폼입니다"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/intake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("제출에 실패했습니다. 다시 시도해 주세요.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return <Shell><div className="py-20 text-center text-gray-500">로딩 중...</div></Shell>;
  }
  if (error && !formInfo) {
    return <Shell><div className="py-20 text-center text-red-400">{error}</div></Shell>;
  }
  if (submitted) {
    return (
      <Shell>
        <div className="py-20 text-center">
          <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">제출이 완료되었습니다</h2>
          <p className="text-gray-400">감사합니다. 제출하신 자료는 PR 페이지 제작에 활용됩니다.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="w-full max-w-lg mx-auto">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-800">
            <h1 className="text-lg font-semibold text-white">자료 제출</h1>
            <p className="text-sm text-gray-400 mt-1">
              {formInfo?.talentName}님, PR 페이지 제작을 위해 아래 정보를 입력해 주세요.
            </p>
            {/* Progress */}
            <div className="flex gap-1 mt-4">
              {STEPS.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-white" : "bg-gray-700"}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{step + 1}/{STEPS.length} {STEPS[step]}</p>
          </div>

          <div className="px-6 py-5 min-h-[280px]">
            {step === 0 && (
              <div className="space-y-4">
                <FormField label="포지션" required hint="예: KBS 아나운서">
                  <Input value={data.position} onChange={(e) => setData({ ...data, position: e.target.value })} />
                </FormField>
                <FormField label="한 줄 소개" hint="PR 페이지 상단에 표시됩니다">
                  <Input value={data.tagline} onChange={(e) => setData({ ...data, tagline: e.target.value })} placeholder="신뢰를 전하는 목소리" />
                </FormField>
                <FormField label="자기소개" required>
                  <Textarea value={data.intro} onChange={(e) => setData({ ...data, intro: e.target.value })} rows={4} placeholder="경력과 강점을 자유롭게 작성해 주세요" />
                </FormField>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">경력 항목</span>
                  <Button size="sm" variant="ghost" onClick={() => setData({ ...data, careerItems: [...data.careerItems, { period: "", title: "", description: "" }] })}>+ 추가</Button>
                </div>
                {data.careerItems.map((item, i) => (
                  <div key={i} className="space-y-2 p-3 rounded-lg bg-gray-950 border border-gray-800">
                    <Input placeholder="기간 (2024~현재)" value={item.period} onChange={(e) => { const items = [...data.careerItems]; items[i] = { ...items[i], period: e.target.value }; setData({ ...data, careerItems: items }); }} />
                    <Input placeholder="직책/활동" value={item.title} onChange={(e) => { const items = [...data.careerItems]; items[i] = { ...items[i], title: e.target.value }; setData({ ...data, careerItems: items }); }} />
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-2">포트폴리오 영상/사진 URL을 입력하세요</p>
                {data.portfolioUrls.map((url, i) => (
                  <Input key={i} placeholder="https://youtube.com/..." value={url} onChange={(e) => { const urls = [...data.portfolioUrls]; urls[i] = e.target.value; setData({ ...data, portfolioUrls: urls }); }} />
                ))}
                <Button size="sm" variant="ghost" onClick={() => setData({ ...data, portfolioUrls: [...data.portfolioUrls, ""] })}>+ URL 추가</Button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 mb-2">연락 가능한 채널을 입력하세요</p>
                {data.contactChannels.map((ch, i) => (
                  <div key={i} className="flex gap-2">
                    <select value={ch.type} onChange={(e) => { const chs = [...data.contactChannels]; chs[i] = { ...chs[i], type: e.target.value }; setData({ ...data, contactChannels: chs }); }} className="w-28 h-10 rounded-lg border border-gray-700 bg-gray-950 px-2 text-sm text-white">
                      {["email", "phone", "kakao", "instagram", "youtube"].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Input className="flex-1" value={ch.value} onChange={(e) => { const chs = [...data.contactChannels]; chs[i] = { ...chs[i], value: e.target.value }; setData({ ...data, contactChannels: chs }); }} />
                  </div>
                ))}
                <Button size="sm" variant="ghost" onClick={() => setData({ ...data, contactChannels: [...data.contactChannels, { type: "email", value: "" }] })}>+ 채널 추가</Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} disabled={step === 0}>
              <ChevronLeft size={14} /> 이전
            </Button>
            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                다음 <ChevronRight size={14} />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} loading={submitting}>
                제출하기
              </Button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-center gap-2 py-4 border-b border-gray-800">
        <Sparkles size={18} className="text-white" />
        <span className="text-sm font-semibold text-white">Castfolio</span>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <footer className="py-4 text-center border-t border-gray-800">
        <p className="text-xs text-gray-600">Powered by Castfolio</p>
      </footer>
    </div>
  );
}
