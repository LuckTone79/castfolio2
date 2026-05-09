"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PRPageRenderer } from "@/components/pr-page/PRPageRenderer";
import { getTheme } from "@/themes";

interface ReviewData {
  submission: Record<string, string>;
  status: string;
  talent: { nameKo: string; nameEn?: string };
  page: {
    draftContent: Record<string, unknown> | null;
    theme: string;
    accentColor: string | null;
    sectionOrder: string[];
    disabledSections: string[];
  } | null;
}

type ReviewAction = "approve" | "revision";
type ActiveTab = "preview" | "data" | "review";

export default function ReviewPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ReviewAction>("approve");
  const [revisionNote, setRevisionNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");

  useEffect(() => {
    fetch(`/api/public/review/${token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (payload) setData(payload);
        // If no page data, default to data tab
        if (!payload?.page?.draftContent) setActiveTab("data");
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
  const hasPage = !!(data.page?.draftContent);
  const TABS: { key: ActiveTab; label: string }[] = [
    ...(hasPage ? [{ key: "preview" as ActiveTab, label: "PR 페이지 미리보기" }] : []),
    { key: "data", label: "제출 자료 확인" },
    { key: "review", label: "검토 의견 남기기" },
  ];

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
    <div className="min-h-screen bg-[#f7f4ee] text-slate-950">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-black/10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-sm">PR 홈페이지 검토</p>
            <p className="text-xs text-slate-500">{data.talent.nameKo}님</p>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? "bg-white shadow text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Quick action button */}
          <button
            onClick={() => setActiveTab("review")}
            className="hidden sm:block px-4 py-2 bg-slate-950 text-white text-xs font-semibold rounded-xl whitespace-nowrap"
          >
            검토 의견 남기기 →
          </button>
        </div>
      </div>

      {/* PR Page Preview Tab */}
      {activeTab === "preview" && hasPage && (() => {
        const pageData = data.page!;
        const draftContent = pageData.draftContent as Record<string, unknown>;
        const locale = "ko";
        const content = (draftContent[locale] || draftContent) as Parameters<typeof PRPageRenderer>[0]["content"];
        const theme = getTheme(pageData.theme || "anchor-clean");
        const sectionOrder = pageData.sectionOrder?.length
          ? pageData.sectionOrder
          : ["hero", "profile", "career", "portfolio", "strength", "contact", "footer"];

        return (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <p className="text-sm font-semibold text-amber-900">실제 PR 홈페이지 미리보기</p>
              <p className="text-xs text-amber-700 mt-0.5">
                현재 제작된 페이지 구성입니다. 확인 후 아래 &apos;검토 의견 남기기&apos; 탭에서 승인 또는 수정 요청을 남겨주세요.
              </p>
            </div>
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-black/10">
              <PRPageRenderer
                content={content}
                theme={theme}
                accentColor={pageData.accentColor ?? undefined}
                talentName={data.talent.nameKo}
                talentNameEn={data.talent.nameEn}
                sectionOrder={sectionOrder}
                disabledSections={pageData.disabledSections || []}
                watermark={true}
                locale={locale}
              />
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setActiveTab("review")}
                className="px-6 py-3 bg-slate-950 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-colors"
              >
                검토 의견 남기기 →
              </button>
            </div>
          </div>
        );
      })()}

      {/* Data Tab */}
      {activeTab === "data" && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white rounded-3xl border border-black/10 p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-2">제출 자료 요약</h2>
            <p className="text-sm text-slate-600 mb-5">
              담당 제작자가 이 자료를 바탕으로 PR 홈페이지를 구성했습니다.
            </p>
            <div className="space-y-5">
              {fields.map((field) =>
                submission[field.key] ? (
                  <div key={field.key} className="border-b border-black/5 pb-4 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{field.label}</p>
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-900">{submission[field.key]}</p>
                  </div>
                ) : null,
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setActiveTab("review")}
              className="px-6 py-3 bg-slate-950 text-white font-semibold rounded-2xl hover:bg-slate-800 transition-colors"
            >
              검토 의견 남기기 →
            </button>
          </div>
        </div>
      )}

      {/* Review Action Tab */}
      {activeTab === "review" && (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-3xl border border-black/10 p-6 shadow-sm">
            <h2 className="text-lg font-bold">검토 의견</h2>
            <p className="text-sm text-slate-500 mt-1">수정 요청 또는 최종 승인을 선택해주세요.</p>
            <div className="mt-5 space-y-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  action === "approve" ? "border-emerald-500 bg-emerald-50" : "border-black/10 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === "approve"}
                  onChange={() => setAction("approve")}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-emerald-700">최종 승인하기</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    현재 구성으로 납품을 진행할 수 있습니다.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                  action === "revision" ? "border-amber-500 bg-amber-50" : "border-black/10 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="action"
                  checked={action === "revision"}
                  onChange={() => setAction("revision")}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-amber-700">수정 요청하기</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    문구, 경력, 이미지, 순서 등 수정이 필요한 내용을 남겨주세요.
                  </p>
                </div>
              </label>
            </div>

            {action === "revision" && (
              <div className="mt-4">
                <textarea
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  rows={5}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm leading-7 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  placeholder="예: 첫 문단 톤을 조금 더 차분하게 바꾸고, 경력 2번의 설명을 줄여주세요."
                />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || (action === "revision" && !revisionNote.trim())}
                className={`rounded-xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-50 transition-colors ${
                  action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {submitting
                  ? "처리 중..."
                  : action === "revision"
                  ? "수정 요청 제출"
                  : "최종 승인 제출"}
              </button>
              <span className="text-xs text-slate-500">담당 제작자가 확인 후 다음 단계로 진행합니다.</span>
            </div>
          </div>
        </div>
      )}
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
