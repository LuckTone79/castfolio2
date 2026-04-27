"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Input, Avatar, Badge, EmptyState, Modal, FormField } from "@/components/ui";
import { Users, Plus, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface Talent {
  id: string;
  nameKo: string;
  nameEn: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  _count?: { projects: number };
}

export default function TalentsPage() {
  const router = useRouter();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchTalents = async () => {
    const res = await fetch("/api/talents");
    if (res.ok) {
      const data = await res.json();
      setTalents(data.talents || data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTalents(); }, []);

  const filtered = talents.filter(
    (t) =>
      t.nameKo.includes(search) ||
      (t.nameEn && t.nameEn.toLowerCase().includes(search.toLowerCase())) ||
      (t.position && t.position.includes(search)),
  );

  return (
    <>
      <PageHeader
        title="탤런트"
        description="방송인 프로필을 관리합니다"
        actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> 탤런트 등록</Button>}
      />

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="이름, 포지션 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="탤런트가 없습니다"
          description="첫 번째 탤런트를 등록하고 PR 페이지를 만들어 보세요"
          actionLabel="탤런트 등록"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">포지션</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">연락처</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">프로젝트</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/dashboard/talents/${t.id}`)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.nameKo} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-white">{t.nameKo}</p>
                        {t.nameEn && <p className="text-xs text-gray-500">{t.nameEn}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-300">{t.position || "-"}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{t.email || t.phone || "-"}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{t._count?.projects ?? 0}개</td>
                  <td className="px-5 py-3">
                    <Badge color={t.status === "ACTIVE" ? "green" : "gray"}>
                      {t.status === "ACTIVE" ? "활성" : "비활성"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <MoreVertical size={16} className="text-gray-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <CreateTalentModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchTalents(); }}
      />
    </>
  );
}

function CreateTalentModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ nameKo: "", nameEn: "", position: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameKo.trim()) { setError("한글 이름은 필수입니다"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/talents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "생성 실패");
      setLoading(false);
      return;
    }
    setForm({ nameKo: "", nameEn: "", position: "", email: "", phone: "" });
    setLoading(false);
    onCreated();
  };

  return (
    <Modal open={open} onClose={onClose} title="탤런트 등록" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="한글 이름" required>
          <Input value={form.nameKo} onChange={(e) => setForm({ ...form, nameKo: e.target.value })} placeholder="홍길동" />
        </FormField>
        <FormField label="영문 이름">
          <Input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Hong Gil-dong" />
        </FormField>
        <FormField label="포지션" hint="예: 아나운서, MC, 리포터">
          <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="아나운서" />
        </FormField>
        <FormField label="이메일">
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="talent@email.com" />
        </FormField>
        <FormField label="전화번호">
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="010-0000-0000" />
        </FormField>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>취소</Button>
          <Button type="submit" loading={loading}>등록</Button>
        </div>
      </form>
    </Modal>
  );
}
