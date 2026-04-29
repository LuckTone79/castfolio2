"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { IntakeSubmissionRecord } from "@/types/intake";

type StatusFilter = "all" | "requested" | "submitted" | "imported";
type ImportMode = "fill_empty" | "overwrite";

const FILTERS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "requested", label: "요청됨" },
  { key: "submitted", label: "제출됨" },
  { key: "imported", label: "불러오기 완료" },
];

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

function statusLabel(status: IntakeSubmissionRecord["workflowStatus"]) {
  switch (status) {
    case "requested":
      return "요청됨";
    case "submitted":
      return "제출됨";
    case "imported":
      return "불러오기 완료";
    default:
      return "-";
  }
}

export function IntakeSubmissionList() {
  const [forms, setForms] = useState<IntakeSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IntakeSubmissionRecord | null>(null);
  const [confirmImport, setConfirmImport] = useState<IntakeSubmissionRecord | null>(null);
  const [importing, setImporting] = useState(false);
  const [feedback, setFeedback] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/intake");
      const data = (await response.json()) as { forms?: IntakeSubmissionRecord[]; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "자료 수집 목록을 불러오지 못했습니다.");
      }
      setForms(data.forms || []);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "자료 수집 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return forms.filter((form) => {
      const matchesFilter = filter === "all" ? true : form.workflowStatus === filter;
      const matchesQuery =
        normalized.length === 0 ||
        form.talentName.toLowerCase().includes(normalized) ||
        form.projectName.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [filter, forms, query]);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("자료 제출 링크를 복사했습니다.");
    } catch {
      setFeedback("링크를 자동으로 복사하지 못했습니다. 직접 복사해주세요.");
    }
  };

  const importToBuilder = async (mode: ImportMode) => {
    if (!confirmImport) return;
    setImporting(true);
    setFeedback("");

    try {
      const response = await fetch(`/api/intake/${confirmImport.formId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = (await response.json()) as { projectId?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Builder 불러오기에 실패했습니다.");
      }

      setFeedback("제출 자료를 Builder 초안에 반영했습니다.");
      setConfirmImport(null);
      await load();

      if (data.projectId) {
        window.location.href = `/dashboard/builder/${data.projectId}`;
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Builder 불러오기 중 문제가 발생했습니다.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5 fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text-primary)" }}>자료 수집 관리</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            자료 요청 링크와 제출 현황을 확인하고 Builder로 바로 불러오세요.
          </p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="고객명 또는 프로젝트 검색"
          className="w-full md:w-72 rounded-xl border px-3 py-2 text-sm"
          style={{ background: "var(--bg-elevated)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
            style={{
              background: filter === item.key ? "var(--text-primary)" : "var(--bg-surface)",
              color: filter === item.key ? "var(--bg-base)" : "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl py-20 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }}>
          제출 목록을 불러오는 중입니다.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl py-20 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }}>
          아직 제출된 자료가 없습니다. 방송인 고객에게 자료 요청 링크를 보내면 이곳에서 제출 현황을 확인할 수 있습니다.
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
          <table className="w-full table-dark">
            <thead>
              <tr>
                {["방송인 고객명", "포지션", "제출 상태", "제출일", "불러오기 상태", "액션"].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((form) => (
                <tr key={form.id}>
                  <td>
                    <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{form.talentName}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{form.projectName}</p>
                  </td>
                  <td>{form.position || "-"}</td>
                  <td>{statusLabel(form.workflowStatus)}</td>
                  <td>{formatDate(form.submittedAt)}</td>
                  <td>{form.workflowStatus === "imported" ? "불러오기 완료" : "대기 중"}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <button onClick={() => copyLink(form.intakeUrl)} style={{ color: "#A78BFA" }}>링크 복사</button>
                      <button onClick={() => setSelected(form)} style={{ color: "var(--text-secondary)" }}>제출 자료 보기</button>
                      <Link href={`/dashboard/builder/${form.projectId}`} style={{ color: "var(--text-secondary)" }}>
                        Builder 열기
                      </Link>
                      {form.latestPayload && (
                        <button onClick={() => setConfirmImport(form)} style={{ color: "#C4B5FD" }}>
                          Builder로 불러오기
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>제출 자료 미리보기</h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{selected.talentName} · {selected.projectName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-sm" style={{ color: "var(--text-muted)" }}>닫기</button>
            </div>

            {selected.latestPayload ? (
              <div className="mt-6 grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
                <section className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>기본 정보</h3>
                  <div className="mt-3 grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
                    {selected.latestPayload.basic.heroPhotoUrl ? (
                      <img src={selected.latestPayload.basic.heroPhotoUrl} alt="대표 사진" className="h-28 w-28 rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-2xl text-xs" style={{ background: "var(--bg-surface)", color: "var(--text-muted)" }}>대표 사진 없음</div>
                    )}
                    <div className="space-y-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <p>이름: {selected.latestPayload.basic.nameKo || "-"}</p>
                      <p>영문 이름: {selected.latestPayload.basic.nameEn || "-"}</p>
                      <p>포지션: {selected.latestPayload.basic.position || "-"}</p>
                      <p>태그라인: {selected.latestPayload.basic.tagline || "-"}</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>자기소개</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
                    {selected.latestPayload.about.bio || "-"}
                  </p>
                </section>

                <section className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>경력</h3>
                  <div className="mt-3 space-y-3">
                    {selected.latestPayload.career.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>등록된 경력이 없습니다.</p>
                    ) : (
                      selected.latestPayload.career.map((item) => (
                        <div key={item.id} className="rounded-lg p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.period || "기간 미입력"} · {item.title || "활동명 미입력"}</p>
                          {item.description && <p className="mt-2 whitespace-pre-wrap text-sm" style={{ color: "var(--text-secondary)" }}>{item.description}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>포트폴리오</h3>
                  <div className="mt-3 space-y-3">
                    {selected.latestPayload.portfolio.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>등록된 포트폴리오가 없습니다.</p>
                    ) : (
                      selected.latestPayload.portfolio.map((item) => (
                        <div key={item.id} className="rounded-lg p-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.type === "image" ? "이미지" : "영상"} · {item.title || "제목 미입력"}</p>
                          {item.description && <p className="mt-2 whitespace-pre-wrap text-sm" style={{ color: "var(--text-secondary)" }}>{item.description}</p>}
                          {item.type === "image" && item.url ? (
                            <img src={item.url} alt={item.title || "포트폴리오 이미지"} className="mt-3 h-28 rounded-xl object-cover" />
                          ) : (
                            <p className="mt-2 break-all text-sm" style={{ color: "var(--text-secondary)" }}>{item.url || "-"}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="rounded-xl p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>연락처 / SNS</h3>
                  <div className="mt-3 grid gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <p>이메일: {selected.latestPayload.contact.email || "-"}</p>
                    <p>전화번호: {selected.latestPayload.contact.phone || "-"}</p>
                    <p>카카오 오픈채팅: {selected.latestPayload.contact.kakaoOpenChat || "-"}</p>
                    <p>인스타그램: {selected.latestPayload.contact.instagram || "-"}</p>
                    <p>유튜브: {selected.latestPayload.contact.youtube || "-"}</p>
                    <p>틱톡: {selected.latestPayload.contact.tiktok || "-"}</p>
                    <p>블로그: {selected.latestPayload.contact.blog || "-"}</p>
                  </div>
                </section>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setConfirmImport(selected);
                      setSelected(null);
                    }}
                    className="btn-primary px-4 py-2 rounded-xl text-sm"
                    style={{ background: "var(--accent)" }}
                  >
                    Builder로 불러오기
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>아직 제출된 자료가 없습니다.</p>
            )}
          </div>
        </div>
      )}

      {confirmImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}>
            <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Builder로 불러오기</h2>
            <p className="mt-3 text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              {confirmImport.hasExistingContent
                ? "기존 페이지 내용이 있습니다. 제출 자료를 불러오면 일부 내용이 덮어쓰기 될 수 있습니다."
                : "제출 자료를 Builder 초안으로 반영합니다. 필요한 항목부터 빠르게 채워집니다."}
            </p>
            <div className="mt-6 grid gap-3">
              <button
                onClick={() => importToBuilder("fill_empty")}
                disabled={importing}
                className="btn-primary px-4 py-3 rounded-xl text-sm"
                style={{ background: "var(--accent)" }}
              >
                {importing ? "불러오는 중..." : "비어 있는 항목만 채우기"}
              </button>
              <button
                onClick={() => importToBuilder("overwrite")}
                disabled={importing}
                className="btn-ghost px-4 py-3 rounded-xl text-sm"
              >
                제출 자료로 덮어쓰기
              </button>
              <button onClick={() => setConfirmImport(null)} className="text-sm" style={{ color: "var(--text-muted)" }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
