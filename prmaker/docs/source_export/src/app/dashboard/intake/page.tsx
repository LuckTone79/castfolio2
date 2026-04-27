"use client";
import { useState, useEffect } from "react";

interface Project {
  id: string;
  name: string;
  talent: { nameKo: string };
}

interface IntakeForm {
  id: string;
  token: string;
  expiresAt: string | null;
  createdAt: string;
  project: { id: string; name: string };
  talent: { nameKo: string };
  submissions: Array<{ status: string; createdAt: string }>;
}

export default function IntakePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [forms, setForms] = useState<IntakeForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/intake").then(r => r.json()),
    ]).then(([projData, formData]) => {
      setProjects(projData.projects || []);
      setForms(formData.forms || []);
      setLoading(false);
    });
  }, []);

  const createForm = async () => {
    if (!selectedProject) return;
    setCreating(true);
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProject, expiresAt: expiresAt || undefined }),
    });
    if (res.ok) {
      const newForm = await res.json();
      const projInfo = projects.find(p => p.id === selectedProject);
      setForms(prev => [{ ...newForm, project: { id: selectedProject, name: projInfo?.name || "" }, talent: { nameKo: projInfo?.talent.nameKo || "" }, submissions: [] }, ...prev]);
      setShowModal(false);
      setSelectedProject("");
      setExpiresAt("");
    }
    setCreating(false);
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/submit/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getSubmissionStatus = (form: IntakeForm) => {
    if (form.submissions.length === 0) return { label: "미제출", color: "bg-gray-100 text-gray-600" };
    const latest = form.submissions[0];
    if (latest.status === "COMPLETE") return { label: "제출 완료", color: "bg-green-100 text-green-700" };
    if (latest.status === "PARTIAL") return { label: "일부 제출", color: "bg-yellow-100 text-yellow-700" };
    return { label: "제출 대기", color: "bg-gray-100 text-gray-600" };
  };

  const isExpired = (expiresAt: string | null) => expiresAt && new Date(expiresAt) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">자료 요청</h1>
          <p className="text-sm text-gray-500 mt-0.5">방송인에게 자료 제출 링크를 발송하세요.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium"
        >
          + 링크 생성
        </button>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
        ⚠️ 카카오톡으로 받은 사진은 자동 압축되어 화질이 낮을 수 있습니다. 가능하면 이메일로 원본을 보내달라고 안내하세요.
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 font-medium mb-1">아직 생성된 자료 요청 링크가 없습니다.</p>
          <p className="text-sm text-gray-400 mb-4">방송인에게 링크를 발송해 자료를 받아보세요.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            링크 생성
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">프로젝트 / 방송인</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">제출 상태</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">만료일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">생성일</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {forms.map(form => {
                const status = getSubmissionStatus(form);
                const expired = isExpired(form.expiresAt);
                return (
                  <tr key={form.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{form.project.name}</p>
                      <p className="text-xs text-gray-500">{form.talent.nameKo}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {form.expiresAt ? (
                        <span className={expired ? "text-red-500" : "text-gray-600"}>
                          {expired ? "⛔ " : ""}{new Date(form.expiresAt).toLocaleDateString("ko-KR")}
                        </span>
                      ) : (
                        <span className="text-gray-400">무제한</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => copyLink(form.token)}
                          className={`px-3 py-1 text-xs border rounded-lg transition-colors ${copiedToken === form.token ? "bg-green-50 border-green-300 text-green-700" : "hover:bg-gray-50 text-gray-600"}`}
                        >
                          {copiedToken === form.token ? "✓ 복사됨" : "링크 복사"}
                        </button>
                        <a
                          href={`/submit/${form.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50 text-gray-600"
                        >
                          미리보기
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">자료 요청 링크 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트 선택 *</label>
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">프로젝트를 선택하세요</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.talent.nameKo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">만료일 (선택)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-gray-400 mt-1">설정하지 않으면 무제한입니다.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setSelectedProject(""); setExpiresAt(""); }}
                className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={createForm}
                disabled={!selectedProject || creating}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {creating ? "생성 중..." : "링크 생성"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
