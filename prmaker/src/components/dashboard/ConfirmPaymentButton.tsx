"use client";

import { useState } from "react";

interface ConfirmPaymentButtonProps {
  orderId: string;
  orderNumber: string;
  onConfirmed?: () => void;
}

export function ConfirmPaymentButton({ orderId, orderNumber, onConfirmed }: ConfirmPaymentButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("OFFLINE_TRANSFER");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [proofUrl, setProofUrl] = useState("");
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod, paidAt, proofUrl: proofUrl || null }),
      });
      if (res.ok) {
        setDone(true);
        setOpen(false);
        onConfirmed?.();
      } else {
        const err = await res.json();
        alert(err.error || "결제 확인 처리 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <span className="text-xs font-medium" style={{ color: "#34D399" }}>
        ✓ 결제 확인됨
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
        style={{ background: "rgba(52,211,153,0.12)", color: "#34D399" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(52,211,153,0.22)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(52,211,153,0.12)"; }}
      >
        결제 확인
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>결제 확인</h3>
            <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>주문번호: {orderNumber}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>결제 수단</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                >
                  <option value="OFFLINE_TRANSFER">계좌이체</option>
                  <option value="ONLINE_CARD">카드 (온라인)</option>
                  <option value="ONLINE_TRANSFER">계좌이체 (온라인)</option>
                  <option value="ONLINE_KAKAO">카카오페이</option>
                  <option value="ONLINE_NAVER">네이버페이</option>
                  <option value="OFFLINE_CASH">현금</option>
                  <option value="OFFLINE_OTHER">기타 오프라인</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>결제일</label>
                <input
                  type="date"
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  증빙 URL <span style={{ color: "var(--text-muted)" }}>(선택)</span>
                </label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="이체 확인증 URL 등"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg text-sm transition-colors"
                style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-colors"
                style={{ background: loading ? "rgba(52,211,153,0.3)" : "#059669", color: "white" }}
              >
                {loading ? "처리 중..." : "결제 확인"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
