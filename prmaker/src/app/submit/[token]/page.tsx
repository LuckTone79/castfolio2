"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createEmptyIntakePayload, normalizeIntakePayload } from "@/lib/intake";
import { compressImageToDataUrl } from "@/lib/storage";
import { sanitizeText, validateImageFile, validateUrl, validateVideoUrl } from "@/lib/validators";
import type { IntakePayload } from "@/types/intake";

type DraftStatus = "idle" | "saving" | "saved";
type Errors = Record<string, string>;

export default function SubmitPage() {
  const params = useParams();
  const token = params.token as string;
  const draftKey = `castfolio-intake-draft-${token}`;
  const draftTimer = useRef<number | undefined>(undefined);

  const [payload, setPayload] = useState<IntakePayload>(createEmptyIntakePayload());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [showRestore, setShowRestore] = useState(false);
  const [restoreData, setRestoreData] = useState<IntakePayload | null>(null);
  const [contextInfo, setContextInfo] = useState<{ talentName: string; projectName: string } | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch(`/api/public/intake/${token}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            response.status === 410
              ? "자료 제출 링크가 만료되었습니다. 담당 제작자에게 새 링크를 요청해주세요."
              : "자료 제출 링크를 찾을 수 없습니다. 담당 제작자에게 새 링크를 요청해주세요.",
          );
        }

        setContextInfo({
          talentName: data.talentName || "",
          projectName: data.projectName || "",
        });

        const remotePayload = (data.latestSubmission as IntakePayload | null) ?? createEmptyIntakePayload(data.talentName || "", data.talentNameEn || "");
        setPayload(remotePayload);

        const localDraft = window.localStorage.getItem(draftKey);
        if (localDraft) {
          try {
            setRestoreData(JSON.parse(localDraft) as IntakePayload);
            setShowRestore(true);
          } catch {
            window.localStorage.removeItem(draftKey);
          }
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "제출 화면을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [draftKey, token]);

  useEffect(() => {
    if (loading || submitted) return;
    setDraftStatus("saving");
    window.clearTimeout(draftTimer.current);
    draftTimer.current = window.setTimeout(() => {
      const snapshot: IntakePayload = {
        ...payload,
        meta: {
          ...payload.meta,
          draftSavedAt: new Date().toISOString(),
        },
      };
      window.localStorage.setItem(draftKey, JSON.stringify(snapshot));
      setDraftStatus("saved");
    }, 450);

    return () => window.clearTimeout(draftTimer.current);
  }, [draftKey, loading, payload, submitted]);

  const progress = useMemo(() => {
    let completed = 0;
    if (payload.basic.nameKo || payload.basic.nameEn) completed += 1;
    if (payload.about.bio.length >= 20) completed += 1;
    if (payload.career.length > 0 || payload.portfolio.length > 0) completed += 1;
    if (payload.contact.email || payload.contact.phone || payload.contact.instagram || payload.contact.kakaoOpenChat) completed += 1;
    return `${completed}/4`;
  }, [payload]);

  const updatePayload = (updater: (current: IntakePayload) => IntakePayload) => {
    setPayload((current) => updater(current));
  };

  const handleImageChange = async (file: File | null, apply: (dataUrl: string) => void, fieldKey: string) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFieldErrors((current) => ({ ...current, [fieldKey]: validation.error || "이미지를 확인해주세요." }));
      return;
    }

    setFieldErrors((current) => ({ ...current, [fieldKey]: "" }));
    const dataUrl = await compressImageToDataUrl(file);
    apply(dataUrl);
  };

  const validate = () => {
    const nextErrors: Errors = {};

    if (!sanitizeText(payload.basic.nameKo) && !sanitizeText(payload.basic.nameEn)) {
      nextErrors["basic.nameKo"] = "이름 또는 영문 이름 중 하나는 입력해주세요.";
    }
    if (!sanitizeText(payload.basic.position)) nextErrors["basic.position"] = "포지션을 입력해주세요.";
    if (!sanitizeText(payload.basic.tagline)) nextErrors["basic.tagline"] = "한 줄 태그라인을 입력해주세요.";
    if (sanitizeText(payload.about.bio).length < 20) nextErrors["about.bio"] = "자기소개는 20자 이상 작성해주세요.";

    const hasContact =
      sanitizeText(payload.contact.email) ||
      sanitizeText(payload.contact.phone) ||
      sanitizeText(payload.contact.instagram) ||
      sanitizeText(payload.contact.kakaoOpenChat);
    if (!hasContact) nextErrors.contact = "이메일, 전화번호, 인스타그램, 카카오 오픈채팅 중 하나 이상 입력해주세요.";

    payload.portfolio.forEach((item, index) => {
      if (item.type === "video" && !validateVideoUrl(item.url)) {
        nextErrors[`portfolio.${index}.url`] = "영상 URL은 YouTube, Vimeo, mp4 형식으로 입력해주세요.";
      }
      if (item.type === "image" && item.url && !item.url.startsWith("data:") && !validateUrl(item.url)) {
        nextErrors[`portfolio.${index}.url`] = "이미지 URL 형식이 올바르지 않습니다.";
      }
    });

    if (payload.contact.blog && !validateUrl(payload.contact.blog)) nextErrors["contact.blog"] = "블로그 URL 형식이 올바르지 않습니다.";
    if (payload.contact.youtube && !validateUrl(payload.contact.youtube)) nextErrors["contact.youtube"] = "유튜브 URL 형식이 올바르지 않습니다.";

    setFieldErrors(nextErrors);
    setError(Object.keys(nextErrors).length > 0 ? "확인이 필요한 항목이 있습니다." : "");
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setError("");

    try {
      const normalized = normalizeIntakePayload(payload);
      const response = await fetch(`/api/public/intake/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "제출 처리 중 문제가 발생했습니다.");
      }

      window.localStorage.removeItem(draftKey);
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "제출 처리 중 문제가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ScreenMessage title="제출 화면을 준비하는 중입니다." body="" />;
  }

  if (error && !contextInfo) {
    return (
      <ScreenMessage
        title="자료 제출 링크를 찾을 수 없습니다."
        body={error}
      />
    );
  }

  if (submitted) {
    return (
      <ScreenMessage
        title="자료 제출이 완료되었습니다."
        body="전달해주신 자료는 담당 제작자가 확인한 뒤 전문 PR 홈페이지 제작에 사용합니다."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ee] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-black">PR 홈페이지 제작 자료 제출</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          담당 제작자가 보내드린 자료 제출 링크입니다. 입력하신 정보는 전문 PR 홈페이지 제작을 위해 사용됩니다.
        </p>

        {contextInfo && (
          <div className="mt-5 rounded-2xl bg-[#f7f4ee] px-4 py-4 text-sm text-slate-700">
            <p>대상 방송인: {contextInfo.talentName}</p>
            <p className="mt-1">제작 프로젝트: {contextInfo.projectName}</p>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 px-4 py-3 text-sm text-slate-600">
          <span>1. 기본 정보 입력</span>
          <span>2. 소개/경력/포트폴리오 입력</span>
          <span>3. 연락처 입력</span>
          <span>4. 제출 완료</span>
          <span className="ml-auto font-semibold text-slate-900">진행률 {progress}</span>
        </div>

        {showRestore && restoreData && (
          <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-50 px-4 py-4">
            <p className="text-sm font-semibold text-amber-900">이전에 작성 중이던 자료가 있습니다. 이어서 작성하시겠습니까?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm text-white"
                onClick={() => {
                  setPayload(restoreData);
                  setShowRestore(false);
                }}
              >
                이어서 작성
              </button>
              <button
                className="rounded-xl border border-black/10 px-4 py-2 text-sm text-slate-900"
                onClick={() => {
                  window.localStorage.removeItem(draftKey);
                  setShowRestore(false);
                }}
              >
                새로 작성
              </button>
            </div>
          </div>
        )}

        {error && <div className="mt-6 rounded-2xl bg-red-50 px-4 py-4 text-sm text-red-700">{error}</div>}

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-black/10 p-5">
            <h2 className="text-lg font-bold">A. 기본 정보</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="이름" error={fieldErrors["basic.nameKo"]}>
                <input className="field" value={payload.basic.nameKo} onChange={(event) => updatePayload((current) => ({ ...current, basic: { ...current.basic, nameKo: event.target.value } }))} />
              </Field>
              <Field label="영문 이름">
                <input className="field" value={payload.basic.nameEn} onChange={(event) => updatePayload((current) => ({ ...current, basic: { ...current.basic, nameEn: event.target.value } }))} />
              </Field>
              <Field label="포지션" error={fieldErrors["basic.position"]}>
                <input className="field" value={payload.basic.position} onChange={(event) => updatePayload((current) => ({ ...current, basic: { ...current.basic, position: event.target.value } }))} />
              </Field>
              <Field label="한 줄 태그라인" error={fieldErrors["basic.tagline"]}>
                <input className="field" value={payload.basic.tagline} onChange={(event) => updatePayload((current) => ({ ...current, basic: { ...current.basic, tagline: event.target.value } }))} />
              </Field>
            </div>
            <div className="mt-4">
              <ImageField
                label="대표 사진 업로드"
                imageUrl={payload.basic.heroPhotoUrl}
                error={fieldErrors["basic.heroPhotoUrl"]}
                onFileChange={(file) =>
                  handleImageChange(
                    file,
                    (dataUrl) => updatePayload((current) => ({ ...current, basic: { ...current.basic, heroPhotoUrl: dataUrl } })),
                    "basic.heroPhotoUrl",
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-black/10 p-5">
            <h2 className="text-lg font-bold">B. 자기소개</h2>
            <div className="mt-4">
              <ImageField
                label="프로필 사진 업로드"
                imageUrl={payload.about.profilePhotoUrl}
                error={fieldErrors["about.profilePhotoUrl"]}
                onFileChange={(file) =>
                  handleImageChange(
                    file,
                    (dataUrl) => updatePayload((current) => ({ ...current, about: { ...current.about, profilePhotoUrl: dataUrl } })),
                    "about.profilePhotoUrl",
                  )
                }
              />
            </div>
            <div className="mt-4">
              <Field label="자기소개" error={fieldErrors["about.bio"]}>
                <textarea className="field min-h-[140px]" value={payload.about.bio} onChange={(event) => updatePayload((current) => ({ ...current, about: { ...current.about, bio: event.target.value } }))} />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="출생연도">
                <input className="field" value={payload.about.birthYear} onChange={(event) => updatePayload((current) => ({ ...current, about: { ...current.about, birthYear: event.target.value } }))} />
              </Field>
              <Field label="키">
                <input className="field" value={payload.about.height} onChange={(event) => updatePayload((current) => ({ ...current, about: { ...current.about, height: event.target.value } }))} />
              </Field>
              <Field label="학력">
                <input className="field" value={payload.about.education} onChange={(event) => updatePayload((current) => ({ ...current, about: { ...current.about, education: event.target.value } }))} />
              </Field>
            </div>
          </section>

          <DynamicCareerSection payload={payload} updatePayload={updatePayload} handleImageChange={handleImageChange} />
          <DynamicPortfolioSection payload={payload} updatePayload={updatePayload} handleImageChange={handleImageChange} fieldErrors={fieldErrors} />
          <DynamicStrengthSection payload={payload} updatePayload={updatePayload} />

          <section className="rounded-2xl border border-black/10 p-5">
            <h2 className="text-lg font-bold">F. 연락처 / SNS</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="이메일"><input className="field" value={payload.contact.email} onChange={(event) => updatePayload((current) => ({ ...current, contact: { ...current.contact, email: event.target.value } }))} /></Field>
              <Field label="전화번호"><input className="field" value={payload.contact.phone} onChange={(event) => updatePayload((current) => ({ ...current, contact: { ...current.contact, phone: event.target.value } }))} /></Field>
              <Field label="카카오 오픈채팅"><input className="field" value={payload.contact.kakaoOpenChat} onChange={(event) => updatePayload((current) => ({ ...current, contact: { ...current.contact, kakaoOpenChat: event.target.value } }))} /></Field>
              <Field label="인스타그램"><input className="field" value={payload.contact.instagram} onChange={(event) => updatePayload((current) => ({ ...current, contact: { ...current.contact, instagram: event.target.value } }))} /></Field>
              <Field label="유튜브" error={fieldErrors["contact.youtube"]}><input className="field" value={payload.contact.youtube} onChange={(event) => updatePayload((current) => ({ ...current, contact: { ...current.contact, youtube: event.target.value } }))} /></Field>
              <Field label="틱톡"><input className="field" value={payload.contact.tiktok} onChange={(event) => updatePayload((current) => ({ ...current, contact: { ...current.contact, tiktok: event.target.value } }))} /></Field>
              <Field label="블로그" error={fieldErrors["contact.blog"]}><input className="field" value={payload.contact.blog} onChange={(event) => updatePayload((current) => ({ ...current, contact: { ...current.contact, blog: event.target.value } }))} /></Field>
            </div>
            {fieldErrors.contact && <p className="mt-3 text-sm text-red-600">{fieldErrors.contact}</p>}
          </section>
        </div>

        <div className="mt-8 rounded-2xl bg-[#f7f4ee] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {draftStatus === "saving" ? "임시저장 중" : draftStatus === "saved" ? "임시저장 완료" : "입력 중"}
            </p>
            <button className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "제출 중..." : "제출하기"}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .field {
          width: 100%;
          border: 1px solid rgba(15, 23, 42, 0.12);
          border-radius: 14px;
          padding: 0.75rem 0.9rem;
          font-size: 0.95rem;
          background: white;
        }
      `}</style>
    </div>
  );
}

function ScreenMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-[#f7f4ee] px-4 py-10 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-2xl font-black">{title}</h1>
        {body && <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-900">{label}</p>
      {children}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function ImageField({
  label,
  imageUrl,
  error,
  onFileChange,
}: {
  label: string;
  imageUrl: string;
  error?: string;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-900">{label}</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
          이미지 선택
          <input type="file" accept="image/*" className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
        </label>
        {imageUrl && <img src={imageUrl} alt={label} className="h-20 w-20 rounded-2xl object-cover" />}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function DynamicCareerSection({
  payload,
  updatePayload,
  handleImageChange,
}: {
  payload: IntakePayload;
  updatePayload: (updater: (current: IntakePayload) => IntakePayload) => void;
  handleImageChange: (file: File | null, apply: (dataUrl: string) => void, fieldKey: string) => Promise<void>;
}) {
  return (
    <section className="rounded-2xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">C. 경력</h2>
        <button
          className="rounded-xl border border-black/10 px-4 py-2 text-sm text-slate-900"
          onClick={() =>
            updatePayload((current) => ({
              ...current,
              career: [...current.career, { id: crypto.randomUUID(), period: "", title: "", description: "", thumbnail: "" }],
            }))
          }
        >
          경력 추가
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {payload.career.length === 0 ? (
          <p className="text-sm text-slate-500">경력 항목을 추가해 방송 진행 이력을 알려주세요.</p>
        ) : (
          payload.career.map((item) => (
            <div key={item.id} className="rounded-2xl bg-[#f7f4ee] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="기간"><input className="field" value={item.period} onChange={(event) => updatePayload((current) => ({ ...current, career: current.career.map((career) => (career.id === item.id ? { ...career, period: event.target.value } : career)) }))} /></Field>
                <Field label="활동명"><input className="field" value={item.title} onChange={(event) => updatePayload((current) => ({ ...current, career: current.career.map((career) => (career.id === item.id ? { ...career, title: event.target.value } : career)) }))} /></Field>
              </div>
              <div className="mt-4">
                <Field label="상세 설명"><textarea className="field min-h-[110px]" value={item.description} onChange={(event) => updatePayload((current) => ({ ...current, career: current.career.map((career) => (career.id === item.id ? { ...career, description: event.target.value } : career)) }))} /></Field>
              </div>
              <div className="mt-4">
                <ImageField
                  label="관련 이미지 업로드"
                  imageUrl={item.thumbnail || ""}
                  onFileChange={(file) =>
                    handleImageChange(
                      file,
                      (dataUrl) => updatePayload((current) => ({ ...current, career: current.career.map((career) => (career.id === item.id ? { ...career, thumbnail: dataUrl } : career)) })),
                      `career.${item.id}.thumbnail`,
                    )
                  }
                />
              </div>
              <button
                className="mt-4 text-sm text-slate-600"
                onClick={() => updatePayload((current) => ({ ...current, career: current.career.filter((career) => career.id !== item.id) }))}
              >
                경력 삭제
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DynamicPortfolioSection({
  payload,
  updatePayload,
  handleImageChange,
  fieldErrors,
}: {
  payload: IntakePayload;
  updatePayload: (updater: (current: IntakePayload) => IntakePayload) => void;
  handleImageChange: (file: File | null, apply: (dataUrl: string) => void, fieldKey: string) => Promise<void>;
  fieldErrors: Errors;
}) {
  return (
    <section className="rounded-2xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">D. 포트폴리오</h2>
        <button
          className="rounded-xl border border-black/10 px-4 py-2 text-sm text-slate-900"
          onClick={() =>
            updatePayload((current) => ({
              ...current,
              portfolio: [...current.portfolio, { id: crypto.randomUUID(), type: "image", title: "", url: "", thumbnail: "", description: "" }],
            }))
          }
        >
          포트폴리오 추가
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {payload.portfolio.length === 0 ? (
          <p className="text-sm text-slate-500">이미지 또는 영상 포트폴리오를 추가해주세요.</p>
        ) : (
          payload.portfolio.map((item, index) => (
            <div key={item.id} className="rounded-2xl bg-[#f7f4ee] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="유형">
                  <select className="field" value={item.type} onChange={(event) => updatePayload((current) => ({ ...current, portfolio: current.portfolio.map((portfolio) => (portfolio.id === item.id ? { ...portfolio, type: event.target.value as "image" | "video", url: "", thumbnail: "" } : portfolio)) }))}>
                    <option value="image">image</option>
                    <option value="video">video</option>
                  </select>
                </Field>
                <Field label="제목"><input className="field" value={item.title} onChange={(event) => updatePayload((current) => ({ ...current, portfolio: current.portfolio.map((portfolio) => (portfolio.id === item.id ? { ...portfolio, title: event.target.value } : portfolio)) }))} /></Field>
              </div>
              <div className="mt-4">
                {item.type === "image" ? (
                  <ImageField
                    label="이미지 업로드"
                    imageUrl={item.url}
                    error={fieldErrors[`portfolio.${index}.url`]}
                    onFileChange={(file) =>
                      handleImageChange(
                        file,
                        (dataUrl) => updatePayload((current) => ({ ...current, portfolio: current.portfolio.map((portfolio) => (portfolio.id === item.id ? { ...portfolio, url: dataUrl, thumbnail: dataUrl } : portfolio)) })),
                        `portfolio.${index}.url`,
                      )
                    }
                  />
                ) : (
                  <Field label="영상 URL" error={fieldErrors[`portfolio.${index}.url`]}>
                    <input className="field" value={item.url} placeholder="https://youtube.com/... 또는 https://vimeo.com/..." onChange={(event) => updatePayload((current) => ({ ...current, portfolio: current.portfolio.map((portfolio) => (portfolio.id === item.id ? { ...portfolio, url: event.target.value } : portfolio)) }))} />
                  </Field>
                )}
              </div>
              <div className="mt-4">
                <Field label="설명"><textarea className="field min-h-[100px]" value={item.description || ""} onChange={(event) => updatePayload((current) => ({ ...current, portfolio: current.portfolio.map((portfolio) => (portfolio.id === item.id ? { ...portfolio, description: event.target.value } : portfolio)) }))} /></Field>
              </div>
              <button
                className="mt-4 text-sm text-slate-600"
                onClick={() => updatePayload((current) => ({ ...current, portfolio: current.portfolio.filter((portfolio) => portfolio.id !== item.id) }))}
              >
                포트폴리오 삭제
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function DynamicStrengthSection({
  payload,
  updatePayload,
}: {
  payload: IntakePayload;
  updatePayload: (updater: (current: IntakePayload) => IntakePayload) => void;
}) {
  return (
    <section className="rounded-2xl border border-black/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">E. 강점</h2>
        <button
          className="rounded-xl border border-black/10 px-4 py-2 text-sm text-slate-900"
          onClick={() => updatePayload((current) => ({ ...current, strengths: [...current.strengths, { id: crypto.randomUUID(), title: "", description: "", icon: "" }] }))}
        >
          강점 추가
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {payload.strengths.length === 0 ? (
          <p className="text-sm text-slate-500">강점 항목을 추가해 전문성을 알려주세요.</p>
        ) : (
          payload.strengths.map((item) => (
            <div key={item.id} className="rounded-2xl bg-[#f7f4ee] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="강점 제목"><input className="field" value={item.title} onChange={(event) => updatePayload((current) => ({ ...current, strengths: current.strengths.map((strength) => (strength.id === item.id ? { ...strength, title: event.target.value } : strength)) }))} /></Field>
                <Field label="아이콘"><input className="field" value={item.icon || ""} onChange={(event) => updatePayload((current) => ({ ...current, strengths: current.strengths.map((strength) => (strength.id === item.id ? { ...strength, icon: event.target.value } : strength)) }))} /></Field>
              </div>
              <div className="mt-4">
                <Field label="설명"><textarea className="field min-h-[100px]" value={item.description} onChange={(event) => updatePayload((current) => ({ ...current, strengths: current.strengths.map((strength) => (strength.id === item.id ? { ...strength, description: event.target.value } : strength)) }))} /></Field>
              </div>
              <button className="mt-4 text-sm text-slate-600" onClick={() => updatePayload((current) => ({ ...current, strengths: current.strengths.filter((strength) => strength.id !== item.id) }))}>
                강점 삭제
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
