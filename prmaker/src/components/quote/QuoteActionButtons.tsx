"use client";

import { useState } from "react";

interface QuoteActionButtonsProps {
  token: string;
  quoteStatus: string;
  talentName: string;
  totalAmount: string; // formatted
}

export function QuoteActionButtons({ token, quoteStatus, talentName, totalAmount }: QuoteActionButtonsProps) {
  const [status, setStatus] = useState(quoteStatus);
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleAction = async (action: "ACCEPT" | "REJECT") => {
    setLoading(action === "ACCEPT" ? "accept" : "reject");
    try {
      const res = await fetch(`/api/public/quote/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(action === "ACCEPT" ? "ACCEPTED" : "REJECTED");
        setShowRejectConfirm(false);
      } else {
        alert(data.error || "처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(null);
    }
  };

  if (status === "ACCEPTED") {
    return (
      <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-bold text-emerald-800 text-lg">견적서를 수락했습니다</p>
        <p className="text-sm text-emerald-700 mt-2">
          담당자가 결제 방법을 안내해드릴 예정입니다. 잠시 기다려주세요.
        </p>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center">
        <p className="text-3xl mb-2">↩️</p>
        <p className="font-bold text-slate-700 text-lg">견적서를 거절했습니다</p>
        <p className="text-sm text-slate-500 mt-2">
          담당자에게 문의하시면 새로운 견적을 받아보실 수 있습니다.
        </p>
      </div>
    );
  }

  if (status !== "SENT") {
    return null; // 이미 처리된 견적서
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
        <h3 className="font-bold text-emerald-900 mb-1">이 견적서를 수락하시겠습니까?</h3>
        <p className="text-sm text-emerald-800 mb-4">
          <strong>{talentName}</strong>님의 PR 페이지 제작 견적서 · 합계 <strong>{totalAmount}</strong>
        </p>
        <button
          onClick={() => handleAction("ACCEPT")}
          disabled={loading !== null}
          className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors text-sm"
        >
          {loading === "accept" ? "처리 중..." : "✓ 견적 수락하기"}
        </button>
      </div>

      {!showRejectConfirm ? (
        <button
          onClick={() => setShowRejectConfirm(true)}
          className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          견적을 거절하고 싶어요
        </button>
      ) : (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
          <p className="text-sm font-semibold text-red-800 mb-3">정말 이 견적서를 거절하시겠습니까?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRejectConfirm(false)}
              className="flex-1 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => handleAction("REJECT")}
              disabled={loading !== null}
              className="flex-1 py-2.5 text-sm bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {loading === "reject" ? "처리 중..." : "거절하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
