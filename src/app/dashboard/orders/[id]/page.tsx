import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Stepper } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderActions } from "./actions";

const ORDER_STEPS = ["생성", "결제 대기", "결제 완료", "납품"];
const STATUS_TO_STEP: Record<string, number> = {
  DRAFT: 0, PAYMENT_PENDING: 1, PAID: 2, DELIVERED: 3, SETTLED: 3, CANCELLED: 0,
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const order = await prisma.order.findFirst({
    where: { id: params.id, userId: user.id },
    include: {
      lineItems: true,
      project: { include: { talent: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  return (
    <>
      <PageHeader
        title={`주문 ${order.orderNumber}`}
        breadcrumbs={[
          { label: "주문", href: "/dashboard/orders" },
          { label: order.orderNumber },
        ]}
      />

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 mb-6">
        <Stepper steps={ORDER_STEPS} current={STATUS_TO_STEP[order.status] ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items */}
          <div className="rounded-xl border border-gray-800 bg-gray-900">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-base font-semibold text-white">주문 항목</h3>
            </div>
            <div className="divide-y divide-gray-800">
              {order.lineItems.map((li) => (
                <div key={li.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-white">{li.description}</span>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(li.amount.toString())} × {li.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800 bg-gray-950 rounded-b-xl">
              <span className="text-sm font-medium text-gray-400">합계</span>
              <span className="text-lg font-bold text-white">{formatCurrency(order.totalAmount.toString())}</span>
            </div>
          </div>

          {/* Payments */}
          {order.payments.length > 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-base font-semibold text-white">결제 기록</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {order.payments.map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-white">{pay.method}</p>
                      <p className="text-xs text-gray-500">{formatDate(pay.createdAt)}</p>
                    </div>
                    <span className="text-sm font-medium text-white">{formatCurrency(pay.amount.toString())}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-3">주문 정보</h3>
            <dl className="space-y-2.5">
              <Row label="상태"><Badge color={order.status === "PAID" ? "green" : "yellow"}>{order.status}</Badge></Row>
              <Row label="탤런트">{order.project.talent.nameKo}</Row>
              <Row label="프로젝트">{order.project.name}</Row>
              <Row label="수수료율">{order.commissionRate.toString()}%</Row>
              <Row label="수수료">{formatCurrency(order.commissionAmount.toString())}</Row>
              <Row label="정산액">{formatCurrency(order.userAmount.toString())}</Row>
              <Row label="결제 방법">{order.paymentMethod || "-"}</Row>
              <Row label="생성일">{formatDate(order.createdAt)}</Row>
              {order.paidAt && <Row label="결제일">{formatDate(order.paidAt)}</Row>}
              {order.deliveredAt && <Row label="납품일">{formatDate(order.deliveredAt)}</Row>}
            </dl>
          </div>

          <OrderActions orderId={order.id} status={order.status} />
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-white">{children}</dd>
    </div>
  );
}
