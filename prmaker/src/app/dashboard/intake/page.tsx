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

const IconLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);
const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconEye = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

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
    if (form.submissions.length === 0) return { label: "미제출", cls: "badge-gray" };
    const latest = form.submissions[0];
    if (latest.status === "COMPLETE") return { label: "제출 완료", cls: "badge-emerald" };
    if (latest.status === "PARTIAL") return { label: "일부 제출", cls: "badge-amber" };
    return { label: "제출 대기", cls: "badge-gray" };
  };

  const isExpired = (expiresAt: string | null) => expiresAt && new Date(expiresAt) < new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="rounded-full border-2"
          style={{
            width: 24, height: 24,
            borderColor: "var(--accent)",
            borderTopColor: "transparent",
            animation: "spin-slow 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>자료 요청</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>방송인에게 자료 제출 링크를 발송하세요.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
          style={{ background: "var(--accent)" }}
        >
          <IconPlus /> 링크 생성
        </button>
      </div>

      {/* Warning */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs fade-in-1"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#FCD34D" }}
      >
        <svg className="flex-shrink-0 mt-0.5" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        카카오톡으로 받은 사진은 자동 압축되어 화질이 낮을 수 있습니다. 가능하면 이메일로 원본을 보내달라고 안내하세요.
      </div>

      {/* Content */}
      {forms.length === 0 ? (
        <div
          className="rounded-2xl py-20 text-center fade-in-2"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <div
            className="mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ width: 56, height: 56, background: "rgba(124,92,252,0.1)", color: "#7C5CFC" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
            </svg>
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>자료 요청 링크가 없습니다</p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>방송인에게 링크를 발송해 자료를 받아보세요.</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary px-5 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--accent)" }}
          >
            링크 생성
          </button>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden fade-in-2"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["프로젝트 / 방송인", "제출 상태", "만료일", "생성일", ""].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forms.map(form => {
                const status = getSubmissionStatus(form);
                const expired = isExpired(form.expiresAt);
                return (
                  <tr key={form.id}>
                    <td>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{form.project.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{form.talent.nameKo}</p>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      {form.expiresAt ? (
                        <span className="text-xs" style={{ color: expired ? "#FCA5A5" : "var(--text-secondary)" }}>
                          {new Date(form.expiresAt).toLocaleDateString("ko-KR")}
                          {expired && " (만료)"}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>무제한</span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(form.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => copyLink(form.token)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                          style={{
                            background: copiedToken === form.token ? "rgba(16,185,129,0.12)" : "var(--bg-elevated)",
                            color: copiedToken === form.token ? "#6EE7B7" : "var(--text-muted)",
                            border: `1px solid ${copiedToken === form.token ? "rgba(16,185,129,0.25)" : "var(--border-default)"}`,
                          }}
                        >
                          {copiedToken === form.token ? <IconCheck /> : <IconLink />}
                          {copiedToken === form.token ? "복사됨" : "링크 복사"}
                        </button>
                        <a
                          href={`/submit/${form.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                          style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border-default)" }}
                        >
                          <IconEye />
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

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
          >
            <h2 className="font-bold text-base mb-5" style={{ color: "var(--text-primary)" }}>자료 요청 링크 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  프로젝트 선택 <span style={{ color: "#FCA5A5" }}>*</span>
                </label>
                <select
                  value={selectedProject}
                  onChange={e => setSelectedProject(e.target.value)}
                  className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "var(--bg-elevated)" }}
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
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  만료일 <span style={{ color: "var(--text-muted)" }}>(선택)</span>
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  설정하지 않으면 무제한입니다.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setSelectedProject(""); setExpiresAt(""); }}
                className="btn-ghost flex-1 py-2.5 rounded-xl text-sm"
              >
                취소
              </button>
              <button
                onClick={createForm}
                disabled={!selectedProject || creating}
                className="btn-primary flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: "var(--accent)" }}
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
