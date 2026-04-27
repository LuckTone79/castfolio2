"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { CreditCard, Truck, X } from "lucide-react";

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (endpoint: string, key: string) => {
    setLoading(key);
    try {
      const res = await fetch(`/api/orders/${orderId}/${endpoint}`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "작업 실패");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-3">액션</h3>
      <div className="space-y-2">
        {status === "DRAFT" && (
          <Button className="w-full" onClick={() => action("submit", "submit")} loading={loading === "submit"}>
            <CreditCard size={14} /> 결제 요청
          </Button>
        )}
        {status === "PAYMENT_PENDING" && (
          <Button className="w-full" onClick={() => action("confirm-payment", "confirm")} loading={loading === "confirm"}>
            <CreditCard size={14} /> 결제 확인
          </Button>
        )}
        {status === "PAID" && (
          <Button className="w-full" onClick={() => action("deliver", "deliver")} loading={loading === "deliver"}>
            <Truck size={14} /> 납품 처리
          </Button>
        )}
        {(status === "DRAFT" || status === "PAYMENT_PENDING") && (
          <Button variant="danger" className="w-full" size="sm">
            <X size={14} /> 주문 취소
          </Button>
        )}
        {(status === "DELIVERED" || status === "SETTLED") && (
          <p className="text-sm text-gray-500 text-center">처리 완료된 주문입니다</p>
        )}
      </div>
    </div>
  );
}
