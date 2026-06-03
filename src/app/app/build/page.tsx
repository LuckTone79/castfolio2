"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Input, FormField } from "@/components/ui";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Plus,
  Search,
  SquarePen,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Talent {
  id: string;
  nameKo: string;
  nameEn: string;
  position: string;
}

type Mode = "existing" | "new";
type Step = 1 | 2;

export default function QuickBuildPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<Mode>("existing");

  // Talent state
  const [talents, setTalents] = useState<Talent[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Talent | null>(null);
  const [newTalent, setNewTalent] = useState({ nameKo: "", nameEn: "", position: "" });

  // Project state
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 기존 고객 목록 로드
  useEffect(() => {
    fetch("/api/talents")
      .then((r) => r.json())
      .then((d) => setTalents(d.talents || []));
  }, []);

  // 프로젝트명 자동 제안
  useEffect(() => {
    const name = mode === "existing" ? selected?.nameKo : newTalent.nameKo;
    if (name) setProjectName(`${name} PR 페이지`);
  }, [selected, newTalent.nameKo, mode]);

  const filteredTalents = talents.filter(
    (t) => t.nameKo.includes(search) || t.position?.includes(search),
  );

  const canProceed =
    mode === "existing"
      ? !!selected
      : !!newTalent.nameKo && !!newTalent.nameEn && !!newTalent.position;

  const handleStart = async () => {
    if (!projectName.trim()) {
      setError("프로젝트명을 입력하세요");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/build/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talentId: mode === "existing" ? selected?.id : undefined,
          newTalent: mode === "new" ? newTalent : undefined,
          projectName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "생성에 실패했습니다");
      }

      const { projectId } = await res.json();
      router.push(`/app/builder/${projectId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다");
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="PR 홈페이지 직접 제작"
        description="자료가 이미 준비된 경우 고객 등록과 프로젝트 생성을 한 번에 처리하고 바로 빌더를 시작합니다."
      />

      <div className="mx-auto max-w-lg space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <StepBadge num={1} active={step === 1} done={step > 1} label="방송인 선택" />
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-700" />
          <StepBadge num={2} active={step === 2} done={false} label="프로젝트 생성 및 시작" />
        </div>

        {/* ── Step 1: 방송인 선택 ── */}
        {step === 1 && (
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            {/* Mode 탭 */}
            <div className="flex overflow-hidden rounded-xl border border-gray-800">
              <ModeTab
                active={mode === "existing"}
                onClick={() => { setMode("existing"); setSelected(null); }}
                label="기존 고객 선택"
              />
              <ModeTab
                active={mode === "new"}
                onClick={() => { setMode("new"); setSelected(null); }}
                label="신규 고객 등록"
                icon={<Plus className="h-3.5 w-3.5" />}
              />
            </div>

            {/* 기존 고객 검색 */}
            {mode === "existing" && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="이름 또는 포지션으로 검색"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-60 space-y-1.5 overflow-y-auto">
                  {filteredTalents.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500">
                      {search ? "검색 결과가 없습니다" : "등록된 고객이 없습니다"}
                    </p>
                  ) : (
                    filteredTalents.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          selected?.id === t.id
                            ? "border-white/20 bg-gray-800 text-white"
                            : "border-gray-800 text-gray-300 hover:bg-gray-800/50",
                        )}
                      >
                        {selected?.id === t.id ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Users className="h-4 w-4 shrink-0 text-gray-500" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{t.nameKo}</p>
                          <p className="truncate text-xs text-gray-500">{t.position}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 신규 고객 등록 폼 */}
            {mode === "new" && (
              <div className="space-y-4">
                <FormField label="이름 (한글)" required>
                  <Input
                    value={newTalent.nameKo}
                    onChange={(e) => setNewTalent({ ...newTalent, nameKo: e.target.value })}
                    placeholder="홍길동"
                  />
                </FormField>
                <FormField label="이름 (영문)" required>
                  <Input
                    value={newTalent.nameEn}
                    onChange={(e) => setNewTalent({ ...newTalent, nameEn: e.target.value })}
                    placeholder="Gildong Hong"
                  />
                </FormField>
                <FormField label="포지션" required>
                  <Input
                    value={newTalent.position}
                    onChange={(e) => setNewTalent({ ...newTalent, position: e.target.value })}
                    placeholder="아나운서 / 쇼호스트 / MC"
                  />
                </FormField>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!canProceed}
              onClick={() => setStep(2)}
            >
              다음
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── Step 2: 프로젝트 생성 및 시작 ── */}
        {step === 2 && (
          <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            {/* 선택된 방송인 요약 */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-950 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">선택된 방송인</p>
                <p className="text-sm font-semibold text-white">
                  {mode === "existing" ? selected?.nameKo : newTalent.nameKo}
                </p>
                <p className="text-xs text-gray-400">
                  {mode === "existing" ? selected?.position : newTalent.position}
                  {mode === "new" && (
                    <span className="ml-2 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                      신규
                    </span>
                  )}
                </p>
              </div>
            </div>

            <FormField label="프로젝트명" hint="나중에 수정 가능합니다">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="홍길동 PR 페이지"
              />
            </FormField>

            {/* 직접 제작 모드 안내 */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="text-xs font-semibold text-emerald-400">직접 제작 모드</p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                자료 수집 단계를 건너뛰고 빌더가 바로 시작됩니다. 파트너가 직접 모든 내용을 입력합니다.
              </p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)} disabled={loading}>
                뒤로
              </Button>
              <Button className="flex-1" onClick={handleStart} loading={loading}>
                <SquarePen className="h-4 w-4" />
                빌더 시작
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Sub-components ── */

function StepBadge({
  num, active, done, label,
}: {
  num: number; active: boolean; done: boolean; label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
          done
            ? "bg-emerald-600 text-white"
            : active
              ? "bg-white text-gray-950"
              : "bg-gray-800 text-gray-500",
        )}
      >
        {done ? "✓" : num}
      </div>
      <span className={cn("text-sm", active ? "font-medium text-white" : "text-gray-500")}>
        {label}
      </span>
    </div>
  );
}

function ModeTab({
  active, onClick, label, icon,
}: {
  active: boolean; onClick: () => void; label: string; icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
