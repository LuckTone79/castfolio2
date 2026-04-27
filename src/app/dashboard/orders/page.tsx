"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, EmptyState, Select } from "@/components/ui";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  project?: { name: string; talent: { nameKo: string } };
}

const STATUS_COLOR: Record<string, "gray" | "yellow" | "green" | "blue" | "red"> = {
  DRAFT: "gray", PAYMENT_PENDING: "yellow", PAID: "green", DELIVERED: "blue", SETTLED: "green",
  CANCELLED: "red", DISPUTED: "red", REFUNDED: "red",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders || d)).finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => statusFilter === "ALL" || o.status === statusFilter);

  return (
    <>
      <PageHeader title="주문" description="주문과 결제를 관리합니다" />

      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
          <option value="ALL">전체 상태</option>
          <option value="DRAFT">초안</option>
          <option value="PAYMENT_PENDING">결제 대기</option>
          <option value="PAID">결제 완료</option>
          <option value="DELIVERED">납품 완료</option>
          <option value="CANCELLED">취소</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-gray-800 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="주문이 없습니다" description="견적서가 승인되면 주문이 생성됩니다" />
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">주문번호</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">프로젝트</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">금액</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-800/50 cursor-pointer transition-colors" onClick={() => router.push(`/dashboard/orders/${o.id}`)}>
                  <td className="px-5 py-3 text-sm font-mono text-white">{o.orderNumber}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-white">{o.project?.name || "-"}</p>
                    <p className="text-xs text-gray-500">{o.project?.talent?.nameKo}</p>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-white">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-5 py-3"><Badge color={STATUS_COLOR[o.status] || "gray"}>{o.status}</Badge></td>
                  <td className="px-5 py-3 text-sm text-gray-400">{new Date(o.createdAt).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
