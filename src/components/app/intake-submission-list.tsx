"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, ExternalLink, FileDown, Filter, Link2, Search } from "lucide-react";
import { Button, Input, Modal } from "@/components/ui";
import type { IntakeSubmissionRecord } from "@/types/intake";

type StatusFilter = "all" | "requested" | "submitted" | "imported";
type ImportMode = "fill_empty" | "overwrite";

const FILTER_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "전체" },
  { key: "requested", label: "요청됨" },
  { key: "submitted", label: "제출됨" },
  { key: "imported", label: "불러오기 완료" },
];

function formatWorkflowStatus(status: IntakeSubmissionRecord["workflowStatus"]) {
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

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
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
    return forms.filter((form) => {
      const statusMatch = filter === "all" ? true : form.workflowStatus === filter;
      const normalizedQuery = query.trim().toLowerCase();
      const queryMatch =
        normalizedQuery.length === 0 ||
        form.talentName.toLowerCase().includes(normalizedQuery) ||
        form.projectName.toLowerCase().includes(normalizedQuery);
      return statusMatch && queryMatch;
    });
  }, [filter, forms, query]);

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("자료 제출 링크를 복사했습니다.");
    } catch {
      setFeedback("브라우저에서 링크 복사를 허용하지 않았습니다. 링크를 직접 복사해주세요.");
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
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        projectId?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Builder로 자료를 불러오지 못했습니다.");
      }

      setFeedback("제출 자료를 Builder 초안으로 반영했습니다.");
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
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === item.key ? "bg-white text-gray-950" : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Filter className="mr-1 inline h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="고객명 또는 프로젝트명 검색"
            className="pl-9"
          />
        </div>
      </div>

      {feedback && (
        <div className="mb-4 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-300">
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 px-6 py-12 text-center text-sm text-gray-500">
          제출 목록을 불러오는 중입니다.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 px-6 py-12 text-center text-sm text-gray-500">
          아직 제출된 자료가 없습니다. 방송인 고객에게 자료 요청 링크를 보내면 이곳에서 제출 현황을
          확인할 수 있습니다.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900">
          <table className="min-w-[980px] w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">방송인 고객명</th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">포지션</th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">자료 요청 상태</th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">제출 상태</th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">제출일</th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">불러오기 상태</th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((form) => (
                <tr key={form.id} className="align-top transition hover:bg-gray-800/30">
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-white">{form.talentName}</p>
                    <p className="mt-1 text-xs text-gray-500">{form.projectName}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300">{form.position || "-"}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">요청 링크 생성됨</td>
                  <td className="px-4 py-4 text-sm text-gray-300">{formatWorkflowStatus(form.workflowStatus)}</td>
                  <td className="px-4 py-4 text-sm text-gray-400">{formatDate(form.submittedAt)}</td>
                  <td className="px-4 py-4 text-sm text-gray-300">
                    {form.workflowStatus === "imported" ? "불러오기 완료" : "대기 중"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-200 hover:bg-gray-800"
                        onClick={() => copyLink(form.intakeUrl)}
                      >
                        <Link2 className="h-4 w-4" />
                        링크 복사
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-200 hover:bg-gray-800"
                        onClick={() => setSelected(form)}
                      >
                        <Eye className="h-4 w-4" />
                        제출 자료 보기
                      </Button>
                      <Link href={`/app/builder/${form.talentId}`}>
                        <Button size="sm" variant="outline" className="border-gray-700 text-gray-200 hover:bg-gray-800">
                          <ExternalLink className="h-4 w-4" />
                          Builder 열기
                        </Button>
                      </Link>
                      {form.latestPayload && (
                        <Button
                          size="sm"
                          className="bg-white text-gray-950 hover:bg-gray-100"
                          onClick={() => setConfirmImport(form)}
                        >
                          <FileDown className="h-4 w-4" />
                          Builder로 불러오기
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={selected !== null} onClose={() => setSelected(null)} title="제출 자료 미리보기" size="xl">
        {selected?.latestPayload ? (
          <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1 text-sm text-gray-300">
            <section className="grid gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:grid-cols-[120px_minmax(0,1fr)]">
              {selected.latestPayload.basic.heroPhotoUrl ? (
                <img
                  src={selected.latestPayload.basic.heroPhotoUrl}
                  alt={`${selected.talentName} 대표 사진`}
                  className="h-28 w-28 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gray-900 text-xs text-gray-500">
                  대표 사진 없음
                </div>
              )}
              <div>
                <h3 className="text-base font-semibold text-white">기본 정보</h3>
                <p className="mt-2">이름: {selected.latestPayload.basic.nameKo || "-"}</p>
                <p className="mt-1">영문 이름: {selected.latestPayload.basic.nameEn || "-"}</p>
                <p className="mt-1">포지션: {selected.latestPayload.basic.position || "-"}</p>
                <p className="mt-1">태그라인: {selected.latestPayload.basic.tagline || "-"}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
              <h3 className="text-base font-semibold text-white">자기소개</h3>
              {selected.latestPayload.about.profilePhotoUrl && (
                <img
                  src={selected.latestPayload.about.profilePhotoUrl}
                  alt={`${selected.talentName} 프로필 사진`}
                  className="mt-3 h-24 w-24 rounded-2xl object-cover"
                />
              )}
              <p className="mt-3 whitespace-pre-wrap leading-7">{selected.latestPayload.about.bio || "-"}</p>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
              <h3 className="text-base font-semibold text-white">경력</h3>
              <div className="mt-3 space-y-3">
                {selected.latestPayload.career.length === 0 ? (
                  <p className="text-gray-500">등록된 경력이 없습니다.</p>
                ) : (
                  selected.latestPayload.career.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                      <p className="font-medium text-white">
                        {item.period || "기간 미입력"} · {item.title || "활동명 미입력"}
                      </p>
                      {item.description && <p className="mt-2 whitespace-pre-wrap text-gray-400">{item.description}</p>}
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.title || "경력 이미지"}
                          className="mt-3 h-24 w-24 rounded-xl object-cover"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
              <h3 className="text-base font-semibold text-white">포트폴리오</h3>
              <div className="mt-3 space-y-3">
                {selected.latestPayload.portfolio.length === 0 ? (
                  <p className="text-gray-500">등록된 포트폴리오가 없습니다.</p>
                ) : (
                  selected.latestPayload.portfolio.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                      <p className="font-medium text-white">
                        {item.type === "image" ? "이미지" : "영상"} · {item.title || "제목 미입력"}
                      </p>
                      {item.description && <p className="mt-2 whitespace-pre-wrap text-gray-400">{item.description}</p>}
                      {item.type === "image" && item.url ? (
                        <img src={item.url} alt={item.title || "포트폴리오 이미지"} className="mt-3 h-28 rounded-xl object-cover" />
                      ) : (
                        <p className="mt-2 break-all text-gray-400">{item.url || "-"}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
              <h3 className="text-base font-semibold text-white">강점</h3>
              <div className="mt-3 space-y-3">
                {selected.latestPayload.strengths.length === 0 ? (
                  <p className="text-gray-500">등록된 강점이 없습니다.</p>
                ) : (
                  selected.latestPayload.strengths.map((item) => (
                    <div key={item.id} className="rounded-xl border border-gray-800 bg-gray-900 p-3">
                      <p className="font-medium text-white">{item.title || "강점 제목 미입력"}</p>
                      <p className="mt-2 whitespace-pre-wrap text-gray-400">{item.description || "-"}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
              <h3 className="text-base font-semibold text-white">연락처 / SNS</h3>
              <div className="mt-3 grid gap-2 text-gray-400">
                <p>이메일: {selected.latestPayload.contact.email || "-"}</p>
                <p>전화번호: {selected.latestPayload.contact.phone || "-"}</p>
                <p>카카오 오픈채팅: {selected.latestPayload.contact.kakaoOpenChat || "-"}</p>
                <p>인스타그램: {selected.latestPayload.contact.instagram || "-"}</p>
                <p>유튜브: {selected.latestPayload.contact.youtube || "-"}</p>
                <p>틱톡: {selected.latestPayload.contact.tiktok || "-"}</p>
                <p>블로그: {selected.latestPayload.contact.blog || "-"}</p>
              </div>
            </section>

            <div className="pt-2">
              <Button
                className="bg-white text-gray-950 hover:bg-gray-100"
                onClick={() => {
                  setConfirmImport(selected);
                  setSelected(null);
                }}
              >
                <FileDown className="h-4 w-4" />
                Builder로 불러오기
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">아직 제출된 자료가 없습니다.</p>
        )}
      </Modal>

      <Modal open={confirmImport !== null} onClose={() => setConfirmImport(null)} title="Builder로 불러오기" size="lg">
        <div className="space-y-4 text-sm text-gray-300">
          <p>
            {confirmImport?.hasExistingContent
              ? "기존 페이지 내용이 있습니다. 제출 자료를 불러오면 일부 내용이 덮어쓰기 될 수 있습니다."
              : "제출 자료를 Builder 초안으로 반영합니다. 필요한 항목부터 빠르게 채워집니다."}
          </p>
          <div className="grid gap-3">
            <Button
              className="bg-white text-gray-950 hover:bg-gray-100"
              loading={importing}
              onClick={() => importToBuilder("fill_empty")}
            >
              비어 있는 항목만 채우기
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-gray-200 hover:bg-gray-800"
              loading={importing}
              onClick={() => importToBuilder("overwrite")}
            >
              제출 자료로 덮어쓰기
            </Button>
            <Button
              variant="ghost"
              className="text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={() => setConfirmImport(null)}
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
