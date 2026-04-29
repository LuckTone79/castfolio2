"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Monitor, Smartphone, Sparkles } from "lucide-react";
import { Button, Modal } from "@/components/ui";

const THEMES = [
  {
    id: "elegant-white",
    name: "Elegant White",
    description: "신뢰감과 깔끔함이 중요한 아나운서, 리포터 고객에게 제안하기 좋은 테마",
    color: "#f4efe7",
    accent: "#5f4b32",
  },
  {
    id: "classic-black",
    name: "Classic Black",
    description: "카리스마와 고급스러운 이미지를 강조해야 하는 MC, 쇼호스트 고객에게 적합",
    color: "#111111",
    accent: "#d4b36a",
  },
  {
    id: "soft-pink",
    name: "Soft Pink",
    description: "친근하고 부드러운 이미지를 원하는 라이프스타일 쇼호스트 고객에게 적합",
    color: "#f8d8df",
    accent: "#8b4b62",
  },
  {
    id: "sky-blue",
    name: "Sky Blue",
    description: "밝고 활동적인 이미지를 강조하는 리포터, 행사 MC 고객에게 어울리는 테마",
    color: "#d9ecff",
    accent: "#205493",
  },
  {
    id: "marble-luxe",
    name: "Marble Luxe",
    description: "프리미엄·럭셔리 이미지를 원하는 쇼호스트, 브랜드 MC 고객에게 적합",
    color: "#e7e1d8",
    accent: "#44342c",
  },
  {
    id: "natural-green",
    name: "Natural Green",
    description: "편안하고 신뢰감 있는 이미지를 원하는 교양·라이프스타일 방송인 고객에게 적합",
    color: "#dbe8d7",
    accent: "#31553a",
  },
  {
    id: "warm-coral",
    name: "Warm Coral",
    description: "에너지 있고 트렌디한 이미지를 원하는 젊은 MC, 쇼호스트 고객에게 적합",
    color: "#ffd4c7",
    accent: "#8e3c23",
  },
];

export default function DemoPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const activeTheme = THEMES.find((theme) => theme.id === preview) ?? null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="border-b border-white/10 px-6 pb-14 pt-20 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Sample Gallery</p>
          <h1 className="mt-4 text-balance text-4xl font-black sm:text-5xl">
            고객에게 제안할 수 있는 PR 홈페이지 샘플
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-gray-400 sm:text-lg">
            아나운서, 쇼호스트, MC, 리포터 등 방송인 고객의 이미지에 맞춰 제안할 수 있는 7가지 전문
            테마입니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {THEMES.map((theme) => (
            <article
              key={theme.id}
              className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/5 transition hover:border-white/20"
            >
              <div className="relative h-52" style={{ background: theme.color }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className="mb-3 h-16 w-16 rounded-full border-2"
                    style={{ borderColor: theme.accent, backgroundColor: `${theme.accent}15` }}
                  />
                  <div className="mb-2 h-2 w-28 rounded-full" style={{ background: theme.accent }} />
                  <div className="h-1.5 w-16 rounded-full bg-black/20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition group-hover:opacity-100 bg-black/50 text-white hover:bg-black/60"
                    onClick={() => setPreview(theme.id)}
                  >
                    <Eye className="h-4 w-4" />
                    샘플 보기
                  </Button>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: theme.accent }} />
                  <h2 className="text-base font-bold text-white">{theme.name}</h2>
                </div>
                <p className="text-sm leading-7 text-gray-400">{theme.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-100"
          >
            <Sparkles className="h-4 w-4" />
            파트너로 시작하기
          </Link>
        </div>
      </section>

      <Modal open={!!preview} onClose={() => setPreview(null)} title="샘플 미리보기" size="xl">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setDevice("desktop")}
            className={`rounded p-1.5 ${device === "desktop" ? "bg-gray-800 text-white" : "text-gray-500"}`}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`rounded p-1.5 ${device === "mobile" ? "bg-gray-800 text-white" : "text-gray-500"}`}
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <span className="ml-2 text-sm text-gray-400">{activeTheme?.name}</span>
        </div>

        <div
          className={`mx-auto flex min-h-[420px] items-center justify-center rounded-xl border border-gray-800 bg-gray-950 ${
            device === "mobile" ? "w-[375px]" : "w-full"
          }`}
        >
          <div className="max-w-md px-8 text-center">
            <p className="text-lg font-semibold text-white">{activeTheme?.name}</p>
            <p className="mt-3 text-sm leading-7 text-gray-400">{activeTheme?.description}</p>
            <p className="mt-5 text-xs uppercase tracking-[0.2em] text-gray-500">
              실제 결과물 페이지는 /p/:slug 공개 화면으로 납품됩니다
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
