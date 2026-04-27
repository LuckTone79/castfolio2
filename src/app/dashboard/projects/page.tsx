"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Input, Badge, EmptyState, Modal, FormField, Select } from "@/components/ui";
import { FolderKanban, Plus, Search } from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: string;
  talent: { nameKo: string };
  page?: { status: string; slug?: string } | null;
  updatedAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: "blue" | "yellow" | "purple" | "green" | "gray" }> = {
  NEW: { label: "신규", color: "blue" },
  COLLECTING_MATERIALS: { label: "자료수집", color: "yellow" },
  DRAFTING: { label: "제작중", color: "purple" },
  UNDER_REVIEW: { label: "검수중", color: "yellow" },
  READY_FOR_DELIVERY: { label: "납품준비", color: "green" },
  DELIVERED: { label: "납품완료", color: "green" },
  CLOSED: { label: "완료", color: "gray" },
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects || data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const filtered = projects
    .filter((p) => statusFilter === "ALL" || p.status === statusFilter)
    .filter((p) =>
      p.name.includes(search) || p.talent.nameKo.includes(search),
    );

  return (
    <>
      <PageHeader
        title="프로젝트"
        description="PR 페이지 제작 프로젝트를 관리합니다"
        actions={<Button onClick={() => setShowCreate(true)}><Plus size={16} /> 프로젝트 생성</Button>}
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="프로젝트, 탤런트 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
          <option value="ALL">전체 상태</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </Select>
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="프로젝트가 없습니다"
          description="탤런트의 PR 페이지를 만들기 위해 프로젝트를 생성하세요"
          actionLabel="프로젝트 생성"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const s = STATUS_MAP[p.status] || { label: p.status, color: "gray" as const };
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/dashboard/projects/${p.id}`)}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-700 hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{p.talent.nameKo}</p>
                  </div>
                  <Badge color={s.color}>{s.label}</Badge>
                </div>
                {p.page && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                    <span className="text-xs text-gray-500">페이지:</span>
                    <Badge color={p.page.status === "PUBLISHED" ? "green" : "gray"}>
                      {p.page.status === "PUBLISHED" ? "발행됨" : p.page.status}
                    </Badge>
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-2">
                  {new Date(p.updatedAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchProjects(); }}
      />
    </>
  );
}

function CreateProjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [talents, setTalents] = useState<{ id: string; nameKo: string }[]>([]);
  const [form, setForm] = useState({ name: "", talentId: "", purpose: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/talents").then((r) => r.json()).then((d) => setTalents(d.talents || d));
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.talentId) { setError("프로젝트명과 탤런트를 선택하세요"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/projects", {
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
    setLoading(false);
    onCreated();
  };

  return (
    <Modal open={open} onClose={onClose} title="프로젝트 생성" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="프로젝트명" required>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="홍길동 PR 페이지"
          />
        </FormField>
        <FormField label="탤런트" required>
          <Select value={form.talentId} onChange={(e) => setForm({ ...form, talentId: e.target.value })}>
            <option value="">탤런트 선택</option>
            {talents.map((t) => (
              <option key={t.id} value={t.id}>{t.nameKo}</option>
            ))}
          </Select>
        </FormField>
        <FormField label="제작 목적" hint="캐스팅용, 이벤트용 등">
          <Input
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="캐스팅 디렉터 배포용"
          />
        </FormField>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>취소</Button>
          <Button type="submit" loading={loading}>생성</Button>
        </div>
      </form>
    </Modal>
  );
}
