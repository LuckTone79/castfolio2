"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SendButton({ quoteId }: { quoteId: string }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSend = async () => {
    setSending(true);
    setError("");
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send" }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "발송 중 오류가 발생했습니다.");
      setSending(false);
    }
  };

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        onClick={handleSend}
        disabled={sending}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {sending ? "발송 중..." : "견적서 발송"}
      </button>
    </div>
  );
}
