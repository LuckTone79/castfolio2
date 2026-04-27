"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Badge, EmptyState, Select, Input } from "@/components/ui";
import { FileText, Plus, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Quote {
  id: string;
  status: string;
  totalAmount: number;
  message: string | null;
  validUntil: string | null;
  createdAt: string;
  project?: { name: string; talent: { nameKo: string } };
}

const STATUS_COLOR: Record<string, "gray" | "blue" | "green" | "yellow" | "red"> = {
  DRAFT: "gray", SENT: "blue", ACCEPTED: "green", EXPIRED: "yellow", REJECTED: "red", SUPERSEDED: "gray",
};

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/quotes").then((r) => r.json()).then((d) => setQuotes(d.quotes || d)).finally(() => setLoading(false));
  }, []);

  const filtered = quotes.filter((q) => statusFilter === "ALL" || q.status === statusFilter);

  return (
    <>
      <PageHeader
        title="견적서"
        description="발송된 견적서를 관리합니다"
        actions={<Button onClick={() => router.push("/dashboard/quotes/new")}><Plus size={16} /> 견적서 작성</Button>}
      />

      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
          <option value="ALL">전체</option>
          <option value="DRAFT">초안</option>
          <option value="SENT">발송됨</option>
          <option value="ACCEPTED">승인됨</option>
          <option value="EXPIRED">만료</option>
          <option value="REJECTED">거절됨</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-gray-800 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="견적서가 없습니다" description="패키지를 선택하여 견적서를 작성하세요" actionLabel="견적서 작성" onAction={() => router.push("/dashboard/quotes/new")} />
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">프로젝트</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">금액</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-gray-800/50 cursor-pointer transition-colors" onClick={() => router.push(`/dashboard/quotes/${q.id}`)}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-white">{q.project?.name || "-"}</p>
                    <p className="text-xs text-gray-500">{q.project?.talent?.nameKo}</p>
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-white">{formatCurrency(q.totalAmount)}</td>
                  <td className="px-5 py-3"><Badge color={STATUS_COLOR[q.status] || "gray"}>{q.status}</Badge></td>
                  <td className="px-5 py-3 text-sm text-gray-400">{new Date(q.createdAt).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
