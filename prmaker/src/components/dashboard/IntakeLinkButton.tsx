"use client";

import { useState } from "react";

export function IntakeLinkButton({ talentId }: { talentId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/talents/${talentId}/intake-link`, { method: "POST" });
      const data = (await response.json()) as { intakeUrl?: string; error?: string; alreadyExisted?: boolean };
      if (!response.ok || !data.intakeUrl) {
        throw new Error(data.error || "자료 요청 링크를 생성하지 못했습니다.");
      }

      await navigator.clipboard.writeText(data.intakeUrl);
      setMessage(data.alreadyExisted ? "기존 자료 요청 링크를 복사했습니다." : "새 자료 요청 링크를 만들고 복사했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "자료 요청 링크 처리 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-xs font-medium"
        style={{ color: "#A78BFA" }}
      >
        {loading ? "링크 준비 중..." : "자료 요청 링크"}
      </button>
      {message && <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{message}</p>}
    </div>
  );
}
