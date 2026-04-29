"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui";

interface IntakeLinkButtonProps {
  talentId: string;
}

export function IntakeLinkButton({ talentId }: IntakeLinkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/talents/${talentId}/intake-link`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "링크를 생성하지 못했습니다.");
      }

      await navigator.clipboard.writeText(data.intakeUrl);
      setCopied(true);
      setMessage(data.alreadyExisted ? "기존 자료 요청 링크를 복사했습니다." : "새 자료 요청 링크를 생성하고 복사했습니다.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "링크 작업 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <Button size="sm" variant="outline" className="border-gray-700 text-gray-200 hover:bg-gray-800" loading={loading} onClick={handleClick}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "링크 복사됨" : "자료 요청 링크 생성"}
      </Button>
      {message && <p className="text-xs text-gray-500">{message}</p>}
    </div>
  );
}
