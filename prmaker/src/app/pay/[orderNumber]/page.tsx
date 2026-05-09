"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

// Load Toss Payments SDK via CDN
function loadTossScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("SSR"));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).TossPayments) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://js.tosspayments.com/v1/payment";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Toss SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

interface OrderInfo {
  orderNumber: string;
  totalAmount: number;
  talentName: string;
  partnerName: string;
  description: string;
  status: string;
}

type PageState = "loading" | "ready" | "processing" | "success" | "fail" | "error" | "already_paid";

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [failMessage, setFailMessage] = useState("");

  // Handle redirect back from Toss (success or fail)
  useEffect(() => {
    const resultParam = searchParams.get("result");
    if (resultParam === "success") {
      const paymentKey = searchParams.get("paymentKey");
      const amount = searchParams.get("amount");
      const orderId = searchParams.get("orderId");
      if (paymentKey && amount && orderId) {
        confirmPayment(paymentKey, Number(amount), orderId);
      }
      return;
    }
    if (resultParam === "fail") {
      setFailMessage(searchParams.get("message") || "결제가 취소되었습니다.");
      setPageState("fail");
      return;
    }

    // Normal page load — fetch order info
    fetch(`/api/orders/pay-info/${orderNumber}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setPageState("error"); return; }
        if (d.status !== "PAYMENT_PENDING") { setPageState("already_paid"); return; }
        setOrder(d);
        setPageState("ready");
      })
      .catch(() => setPageState("error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  const confirmPayment = async (paymentKey: string, amount: number, orderId: string) => {
    setPageState("processing");
    try {
      const res = await fetch("/api/payments/toss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentKey, amount, orderId }),
      });
      if (res.ok) {
        setPageState("success");
      } else {
        const d = await res.json();
        setFailMessage(d.error || "결제 확인에 실패했습니다.");
        setPageState("fail");
      }
    } catch {
      setFailMessage("네트워크 오류가 발생했습니다.");
      setPageState("fail");
    }
  };

  const handlePay = async () => {
    if (!order) return;
    setPageState("processing");

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      setFailMessage("결제 서비스가 현재 준비 중입니다. 담당자에게 문의해주세요.");
      setPageState("fail");
      return;
    }

    try {
      // Load Toss Payments SDK via CDN (no npm dependency needed)
      await loadTossScript();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tossPayments = (window as any).TossPayments(clientKey);

      const appUrl = window.location.origin;
      await tossPayments.requestPayment("카드", {
        amount: order.totalAmount,
        orderId: order.orderNumber,
        orderName: order.description,
        customerName: order.talentName,
        successUrl: `${appUrl}/pay/${order.orderNumber}?result=success`,
        failUrl: `${appUrl}/pay/${order.orderNumber}?result=fail`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "결제를 시작할 수 없습니다.";
      if (message.includes("PAY_PROCESS_CANCELED")) {
        setFailMessage("결제가 취소되었습니다.");
      } else {
        setFailMessage(message);
      }
      setPageState("fail");
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (pageState === "loading" || pageState === "processing") {
    return (
      <Shell>
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500">{pageState === "processing" ? "결제를 처리하고 있습니다…" : "로딩 중…"}</p>
      </Shell>
    );
  }

  if (pageState === "success") {
    return (
      <Shell>
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-black text-slate-900 mb-2">결제가 완료되었습니다</h2>
        <p className="text-sm text-slate-500 leading-7">담당 제작자가 확인 후 PR 홈페이지 제작을 시작합니다.</p>
      </Shell>
    );
  }

  if (pageState === "fail") {
    return (
      <Shell>
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-black text-slate-900 mb-2">결제에 실패했습니다</h2>
        <p className="text-sm text-slate-500 mb-5">{failMessage}</p>
        <button
          onClick={() => setPageState("ready")}
          className="px-5 py-2.5 bg-slate-950 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors"
        >
          다시 시도
        </button>
      </Shell>
    );
  }

  if (pageState === "already_paid") {
    return (
      <Shell>
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-black text-slate-900 mb-2">이미 결제가 완료된 주문입니다</h2>
        <p className="text-sm text-slate-500">담당 제작자에게 문의해주세요.</p>
      </Shell>
    );
  }

  if (pageState === "error" || !order) {
    return (
      <Shell>
        <h2 className="text-xl font-black text-slate-900 mb-2">주문을 찾을 수 없습니다</h2>
        <p className="text-sm text-slate-500">링크가 만료되었거나 잘못된 주소입니다.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-4">결제</p>
      <h2 className="text-xl font-black text-slate-900 mb-1">PR 홈페이지 제작 결제</h2>
      <p className="text-sm text-slate-500 mb-6">{order.talentName}님 · {order.partnerName}</p>

      <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
          <span className="text-slate-600">{order.description}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-slate-900">결제 금액</span>
          <span className="text-xl font-black text-slate-900">₩{order.totalAmount.toLocaleString("ko-KR")}</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-5 leading-5">
        결제 버튼을 누르면 토스페이먼츠 결제창이 열립니다.<br />
        카드, 계좌이체, 카카오페이, 네이버페이 등으로 결제 가능합니다.
      </p>

      <button
        onClick={handlePay}
        className="w-full py-3.5 bg-slate-950 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition-colors"
      >
        ₩{order.totalAmount.toLocaleString("ko-KR")} 결제하기
      </button>

      <p className="text-[10px] text-slate-300 mt-4 text-center">Powered by Toss Payments · Castfolio</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f4ee] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-[32px] border border-black/10 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        {children}
      </div>
    </div>
  );
}
