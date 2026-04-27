"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Input, Textarea, FormField, Select } from "@/components/ui";
import { Send } from "lucide-react";

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({ title: "", body: "", channel: "DASHBOARD", targetUserId: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult("");
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setResult("알림이 발송되었습니다");
        setForm({ title: "", body: "", channel: "DASHBOARD", targetUserId: "" });
      } else {
        setResult("발송 실패");
      }
    } catch {
      setResult("네트워크 오류");
    }
    setSending(false);
  };

  return (
    <>
      <PageHeader title="알림 발송" description="사용자에게 알림을 보냅니다" />

      <div className="max-w-lg">
        <form onSubmit={handleSend} className="space-y-4">
          <FormField label="제목" required>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="시스템 점검 안내" />
          </FormField>
          <FormField label="내용" required>
            <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="알림 내용을 입력하세요" rows={4} />
          </FormField>
          <FormField label="채널">
            <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
              <option value="DASHBOARD">대시보드</option>
              <option value="EMAIL">이메일</option>
            </Select>
          </FormField>
          <FormField label="대상 사용자 ID" hint="비워두면 전체 사용자에게 발송">
            <Input value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value })} placeholder="(선택)" />
          </FormField>
          {result && (
            <p className={`text-sm ${result.includes("실패") || result.includes("오류") ? "text-red-400" : "text-emerald-400"}`}>
              {result}
            </p>
          )}
          <Button type="submit" loading={sending}><Send size={14} /> 발송</Button>
        </form>
      </div>
    </>
  );
}
