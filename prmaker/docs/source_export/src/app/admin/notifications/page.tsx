"use client";
import { useState } from "react";

export default function AdminNotificationsPage() {
  const [targetType, setTargetType] = useState<"all" | "specific">("all");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSend = async () => {
    if (!title || !body) return;
    setSending(true);
    setResult(null);

    const res = await fetch("/api/admin/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType,
        userId: targetType === "specific" ? userId : undefined,
        title,
        body,
        type: "admin_notice",
      }),
    });

    if (res.ok) {
      setResult({ ok: true, message: "공지가 발송되었습니다." });
      setTitle("");
      setBody("");
      setUserId("");
    } else {
      const data = await res.json();
      setResult({ ok: false, message: data.error || "발송 실패" });
    }
    setSending(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">공지 / 알림 발송</h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">수신 대상</label>
          <div className="flex gap-3">
            <button
              onClick={() => setTargetType("all")}
              className={`flex-1 py-2 border rounded-lg text-sm ${targetType === "all" ? "bg-blue-50 border-blue-400 text-blue-700 font-medium" : "hover:bg-gray-50"}`}
            >
              전체 사용자
            </button>
            <button
              onClick={() => setTargetType("specific")}
              className={`flex-1 py-2 border rounded-lg text-sm ${targetType === "specific" ? "bg-blue-50 border-blue-400 text-blue-700 font-medium" : "hover:bg-gray-50"}`}
            >
              특정 사용자
            </button>
          </div>
        </div>

        {targetType === "specific" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사용자 ID</label>
            <input
              value={userId}
              onChange={e => setUserId(e.target.value)}
              placeholder="User ID를 입력하세요"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="공지 제목"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용 *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="공지 내용"
            rows={4}
            className="w-full px-3 py-2 border rounded-lg text-sm resize-y"
          />
        </div>

        {result && (
          <div className={`px-4 py-3 rounded-lg text-sm ${result.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {result.message}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={!title || !body || sending || (targetType === "specific" && !userId)}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {sending ? "발송 중..." : "공지 발송"}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">📢 발송 채널</p>
        <p>대시보드 알림으로 발송됩니다. 이메일 발송을 원하면 RESEND_API_KEY가 설정되어 있어야 합니다.</p>
      </div>
    </div>
  );
}
