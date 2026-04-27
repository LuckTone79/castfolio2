"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Input, Textarea, FormField } from "@/components/ui";

export default function NewPricingPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "", basePrice: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("패키지명을 입력하세요"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, basePrice: Number(form.basePrice) || 0 }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error || "생성 실패");
      setLoading(false);
      return;
    }
    router.push("/dashboard/pricing");
  };

  return (
    <>
      <PageHeader
        title="패키지 생성"
        breadcrumbs={[
          { label: "상품 관리", href: "/dashboard/pricing" },
          { label: "새 패키지" },
        ]}
      />
      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="패키지명" required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Standard PR 패키지" />
          </FormField>
          <FormField label="설명">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="패키지에 포함되는 항목을 설명하세요" />
          </FormField>
          <FormField label="기본 가격 (원)" required>
            <Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} placeholder="150000" />
          </FormField>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.back()}>취소</Button>
            <Button type="submit" loading={loading}>생성</Button>
          </div>
        </form>
      </div>
    </>
  );
}
