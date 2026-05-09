"use client";

import { useState } from "react";

export function PublishedPageLinkButton({ slug }: { slug: string }) {
  const [message, setMessage] = useState("");

  const handleClick = async () => {
    try {
      const link = `${window.location.origin}/p/${slug}`;
      await navigator.clipboard.writeText(link);
      setMessage("게시 링크를 복사했습니다.");
      window.setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage("게시 링크 복사에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button onClick={handleClick} className="text-xs font-medium" style={{ color: "#34D399" }}>
        게시 링크 복사
      </button>
      {message && <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{message}</p>}
    </div>
  );
}
