"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface ReviewData {
  submission: Record<string, string>;
  status: string;
}

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"none" | "revision" | "done">("none");
  const [revisionNote, setRevisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch(`/api/public/review/${token}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); setLoading(false); });
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const body = action === "revision"
      ? { action: "REVISION", revisionNote }
      : { action: "APPROVE" };

    const res = await fetch(`/api/public/review/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) setCompleted(true);
    setSubmitting(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-gray-500">유효하지 않은 링크입니다.</div>;

  if (completed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-4xl mb-4">{action === "revision" ? "📝" : "✅"}</p>
        <h1 className="text-xl font-bold mb-2">{action === "revision" ? "수정 요청을 전달했습니다" : "확인 완료되었습니다"}</h1>
        <p className="text-gray-500">담당자가 확인 후 연락드리겠습니다.</p>
      </div>
    </div>
  );

  const sub = data.submission || {};
  const fields = [
    { label: "이름 (한글)", key: "nameKo" },
    { label: "이름 (영문)", key: "nameEn" },
    { label: "한 줄 소개", key: "tagline" },
    { label: "자기소개", key: "intro" },
    { label: "경력 사항", key: "career" },
    { label: "강점/특기", key: "strengths" },
    { label: "방송 영상 URL", key: "videoUrls" },
    { label: "이메일", key: "email" },
    { label: "카카오톡 ID", key: "kakaoId" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">자료 검토</h1>
          <p className="text-gray-500 mt-1">아래 자료를 확인하고 검토 의견을 남겨주세요.</p>
        </div>

        <div className="bg-white rounded-xl border p-6 mb-6 space-y-4">
          {fields.map(f => sub[f.key] ? (
            <div key={f.key}>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">{f.label}</p>
              <p className="text-sm text-gray-900 whitespace-pre-line">{sub[f.key]}</p>
            </div>
          ) : null)}
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="font-semibold">검토 의견</h2>
          <div className="space-y-3">
            <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${action === "none" ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
              <input type="radio" name="action" checked={action === "none"} onChange={() => setAction("none")} className="mt-0.5" />
              <div>
                <p className="font-medium text-green-700">✅ 확인 완료</p>
                <p className="text-sm text-gray-500">자료를 확인했습니다. 이대로 진행해 주세요.</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${action === "revision" ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
              <input type="radio" name="action" checked={action === "revision"} onChange={() => setAction("revision")} className="mt-0.5" />
              <div>
                <p className="font-medium text-orange-700">📝 수정 요청</p>
                <p className="text-sm text-gray-500">일부 내용을 수정하고 싶습니다.</p>
              </div>
            </label>
          </div>

          {action === "revision" && (
            <textarea value={revisionNote} onChange={e => setRevisionNote(e.target.value)} rows={4}
              className="w-full px-3 py-2 border rounded-md text-sm resize-y"
              placeholder="수정하고 싶은 내용을 구체적으로 적어주세요." />
          )}

          <button onClick={handleSubmit} disabled={submitting || (action === "revision" && !revisionNote)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
            {submitting ? "처리 중..." : "제출하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
