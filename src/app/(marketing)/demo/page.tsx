"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { Eye, Sparkles, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";

const THEMES = [
  { id: "anchor-clean", name: "Anchor Clean", desc: "깔끔한 뉴스 앵커 스타일", color: "#1a1a2e", accent: "#e94560" },
  { id: "warm-natural", name: "Warm Natural", desc: "따뜻한 내추럴 톤", color: "#2d2d2d", accent: "#f4a261" },
  { id: "modern-mono", name: "Modern Mono", desc: "모던 모노톤 미니멀", color: "#0d1117", accent: "#58a6ff" },
  { id: "classic-gold", name: "Classic Gold", desc: "클래식 골드 포멀", color: "#1c1c1c", accent: "#ffd700" },
  { id: "fresh-pastel", name: "Fresh Pastel", desc: "프레시 파스텔 톤", color: "#1e1e2e", accent: "#cba6f7" },
  { id: "bold-dynamic", name: "Bold Dynamic", desc: "볼드 다이나믹 액티브", color: "#0f0f0f", accent: "#ff6b6b" },
  { id: "elegant-dark", name: "Elegant Dark", desc: "엘레건트 다크 무드", color: "#0a0a0a", accent: "#c0c0c0" },
  { id: "curated-atelier", name: "Curated Atelier", desc: "웜 크림 톤의 에디토리얼 레이아웃", color: "#fdf9f4", accent: "#460609" },
];

export default function DemoPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="pt-20 pb-12 px-6 text-center">
        <h1 className="text-4xl font-bold">테마 갤러리</h1>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto">
          7가지 프리미엄 테마로 방송인의 개성을 표현하세요
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {THEMES.map((theme) => (
            <div
              key={theme.id}
              className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden hover:border-gray-700 transition-colors group"
            >
              {/* Preview area */}
              <div className="h-44 relative" style={{ background: theme.color }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 mb-3" style={{ borderColor: theme.accent }} />
                  <div className="w-24 h-2 rounded-full mb-2" style={{ background: theme.accent }} />
                  <div className="w-16 h-1.5 rounded-full bg-gray-600" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white"
                    onClick={() => setPreview(theme.id)}
                  >
                    <Eye size={14} /> 미리보기
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
                  <h3 className="text-sm font-semibold text-white">{theme.name}</h3>
                </div>
                <p className="text-xs text-gray-500">{theme.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors">
            <Sparkles size={16} /> 무료로 시작하기
          </Link>
        </div>
      </section>

      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title="테마 미리보기" size="xl">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setDevice("desktop")} className={`p-1.5 rounded ${device === "desktop" ? "bg-gray-800 text-white" : "text-gray-500"}`}><Monitor size={16} /></button>
          <button onClick={() => setDevice("mobile")} className={`p-1.5 rounded ${device === "mobile" ? "bg-gray-800 text-white" : "text-gray-500"}`}><Smartphone size={16} /></button>
          <span className="text-sm text-gray-400 ml-2">{THEMES.find((t) => t.id === preview)?.name}</span>
        </div>
        <div className={`bg-gray-950 rounded-xl border border-gray-800 mx-auto min-h-[400px] flex items-center justify-center ${device === "mobile" ? "w-[375px]" : "w-full"}`}>
          <p className="text-gray-500 text-sm">테마 미리보기 (실제 콘텐츠로 채워집니다)</p>
        </div>
      </Modal>
    </div>
  );
}
