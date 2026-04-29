"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquareQuote, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui";

interface TalentReviewEntryProps {
  talentName?: string;
  previewHref?: string | null;
}

export function TalentReviewEntry({ talentName, previewHref }: TalentReviewEntryProps) {
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen bg-[#f7f4ee] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="inline-flex rounded-2xl bg-[#ece7db] p-3 text-slate-900">
          <MonitorPlay className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-3xl font-black">PR 홈페이지 검토</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          제작된 PR 홈페이지를 확인하고, 수정 요청 또는 최종 승인을 진행할 수 있습니다.
        </p>
        {talentName && (
          <p className="mt-4 rounded-2xl bg-[#f7f4ee] px-4 py-4 text-sm text-slate-700">
            검토 대상 방송인: {talentName}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {previewHref ? (
            <Link
              href={previewHref}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <MonitorPlay className="h-4 w-4" />
              미리보기 확인
            </Link>
          ) : (
            <Button
              className="bg-slate-950 text-white hover:bg-slate-800"
              onClick={() =>
                setMessage("미리보기 연결이 아직 준비되지 않았습니다. 담당 제작자에게 현재 검토 링크 상태를 문의해주세요.")
              }
            >
              <MonitorPlay className="h-4 w-4" />
              미리보기 확인
            </Button>
          )}
          <Button
            variant="outline"
            className="border-black/10 text-slate-900 hover:bg-slate-50"
            onClick={() =>
              setMessage("검토 기능은 현재 준비 중입니다. 담당 제작자를 통해 수정 요청을 전달해주세요.")
            }
          >
            <MessageSquareQuote className="h-4 w-4" />
            수정 요청하기
          </Button>
          <Button
            variant="outline"
            className="border-black/10 text-slate-900 hover:bg-slate-50"
            onClick={() =>
              setMessage("검토 기능은 현재 준비 중입니다. 최종 승인 의사는 담당 제작자를 통해 전달해주세요.")
            }
          >
            <CheckCircle2 className="h-4 w-4" />
            최종 승인하기
          </Button>
        </div>

        <section className="mt-8 rounded-2xl border border-black/10 p-5">
          <h2 className="text-lg font-bold">검토 전 확인 사항</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
            <li>프로필 문구와 경력 정보가 최신 상태인지 확인해주세요.</li>
            <li>사진과 포트폴리오 링크가 원하는 순서로 노출되는지 확인해주세요.</li>
            <li>연락처와 공유용 링크 정보가 최종 공개 기준에 맞는지 검토해주세요.</li>
          </ul>
        </section>

        {message && (
          <div className="mt-6 rounded-2xl bg-[#f7f4ee] px-4 py-4 text-sm leading-7 text-slate-700">{message}</div>
        )}
      </div>
    </div>
  );
}
