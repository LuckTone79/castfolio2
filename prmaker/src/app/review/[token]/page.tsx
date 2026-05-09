"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface ReviewData {
  submission: Record<string, string>;
  status: string;
}

type ReviewAction = "approve" | "revision";

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ReviewAction>("approve");
  const [revisionNote, setRevisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch(`/api/public/review/${token}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (payload) setData(payload);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    const body =
      action === "revision"
        ? { action: "REVISION", revisionNote }
        : { action: "APPROVE" };

    const response = await fetch(`/api/public/review/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) setCompleted(true);
    setSubmitting(false);
  };

  if (loading) {
    return <ReviewShell title="PR 홈페이지 검토 화면을 준비하는 중입니다." body="" />;
  }

  if (!data) {
    return (
      <ReviewShell
        title="검토 링크를 찾을 수 없습니다."
        body="주소가 잘못되었거나 더 이상 사용할 수 없는 링크입니다. 담당 제작자에게 새 링크를 요청해주세요."
      />
    );
  }

  if (completed) {
    return (
      <ReviewShell
        title={action === "revision" ? "수정 요청이 전달되었습니다." : "최종 확인이 완료되었습니다."}
        body={
          action === "revision"
            ? "담당 제작자가 요청 내용을 확인한 뒤 수정 흐름을 이어갑니다."
            : "담당 제작자가 확인 후 최종 납품 절차를 이어갑니다."
        }
      />
    );
  }

  const submission = data.submission || {};
  const fields = [
    { label: "이름", key: "nameKo" },
    { label: "영문 이름", key: "nameEn" },
    { label: "한 줄 태그라인", key: "tagline" },
    { label: "자기소개", key: "intro" },
    { label: "경력 사항", key: "career" },
    { label: "강점 / 특기", key: "strengths" },
    { label: "방송 영상 URL", key: "videoUrls" },
    { label: "이메일", key: "email" },
    { label: "카카오톡 ID", key: "kakaoId" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ee] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="rounded-2xl bg-[#f7f4ee] px-4 py-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">PR 홈페이지 검토</p>
          <p className="mt-1 leading-6">
            제작된 PR 홈페이지 구성을 확인하고, 수정 요청 또는 최종 승인을 진행할 수 있습니다.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { title: "미리보기 확인", desc: "제작된 정보와 문구 구성을 확인합니다." },
            { title: "수정 요청하기", desc: "수정이 필요한 내용을 구체적으로 남깁니다." },
            { title: "최종 승인하기", desc: "이대로 납품 진행이 가능하면 확인합니다." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/10 p-4">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-black/10 p-6">
          <h2 className="text-lg font-bold">제출 자료 요약</h2>
          <p className="mt-2 text-sm text-slate-600">
            담당 제작자가 이 자료를 바탕으로 PR 홈페이지를 구성했습니다. 검토 전에 핵심 항목을 한 번 더 확인해주세요.
          </p>

          <div className="mt-5 space-y-4">
            {fields.map((field) =>
              submission[field.key] ? (
                <div key={field.key}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{field.label}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-900">{submission[field.key]}</p>
                </div>
              ) : null,
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-black/10 p-6">
          <h2 className="text-lg font-bold">검토 의견</h2>
          <div className="mt-4 space-y-3">
            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${action === "approve" ? "border-emerald-500 bg-emerald-50" : "border-black/10"}`}>
              <input type="radio" name="action" checked={action === "approve"} onChange={() => setAction("approve")} className="mt-1" />
              <div>
                <p className="font-semibold text-emerald-700">최종 승인하기</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">현재 구성으로 납품을 진행할 수 있습니다.</p>
              </div>
            </label>

            <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${action === "revision" ? "border-amber-500 bg-amber-50" : "border-black/10"}`}>
              <input type="radio" name="action" checked={action === "revision"} onChange={() => setAction("revision")} className="mt-1" />
              <div>
                <p className="font-semibold text-amber-700">수정 요청하기</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">문구, 경력, 이미지, 순서 등 수정이 필요한 내용을 남겨주세요.</p>
              </div>
            </label>
          </div>

          {action === "revision" && (
            <div className="mt-4">
              <textarea
                value={revisionNote}
                onChange={(event) => setRevisionNote(event.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm leading-7 outline-none"
                placeholder="예: 첫 문단 톤을 조금 더 차분하게 바꾸고, 경력 2번의 설명을 줄여주세요."
              />
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || (action === "revision" && !revisionNote.trim())}
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "처리 중..." : action === "revision" ? "수정 요청 제출" : "최종 승인 제출"}
            </button>
            <span className="self-center text-xs text-slate-500">담당 제작자가 확인 후 다음 단계로 진행합니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewShell({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-[#f7f4ee] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-black">{title}</h1>
        {body && <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>}
      </div>
    </div>
  );
}
