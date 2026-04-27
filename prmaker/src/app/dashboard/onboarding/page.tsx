"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["시작", "사업자 유형", "상품 선택", "완료"];

const DEFAULT_PACKAGES = [
  {
    name: "기본형 PR 페이지",
    price: 300000,
    description: "기본 구성의 PR 페이지",
    features: ["7가지 테마 선택", "기본 섹션 구성", "PDF 출력"],
  },
  {
    name: "프리미엄 PR 페이지",
    price: 500000,
    description: "프리미엄 구성, 다국어 지원",
    features: ["7가지 테마 선택", "고급 섹션 구성", "다국어 지원 (한·영)", "QR 코드 생성"],
    recommended: true,
  },
  {
    name: "다국어 PR 페이지",
    price: 700000,
    description: "한/영/중 완전 지원 풀옵션",
    features: ["7가지 테마 선택", "전체 섹션 구성", "3개 언어 완전 지원", "QR + PDF 명함"],
  },
];

const USER_TYPES = [
  { value: "INDIVIDUAL",      label: "개인",      desc: "사업자등록증 미보유 개인 활동" },
  { value: "SOLE_PROPRIETOR", label: "개인사업자", desc: "사업자등록증 보유 개인" },
  { value: "CORPORATION",     label: "법인",       desc: "법인 등록된 사업체" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState("");
  const [selectedPackages, setSelectedPackages] = useState<number[]>([0, 1, 2]);
  const [loading, setLoading] = useState(false);

  const togglePackage = (i: number) => {
    setSelectedPackages(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleComplete = async () => {
    if (!userType || selectedPackages.length === 0) return;
    setLoading(true);
    await fetch("/api/users/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userType,
        packages: selectedPackages.map(i => DEFAULT_PACKAGES[i]),
      }),
    });
    router.push("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 dot-grid"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 400,
          background: "radial-gradient(ellipse, rgba(124,92,252,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="rounded-xl flex items-center justify-center font-bold text-white"
            style={{
              width: 32, height: 32,
              background: "linear-gradient(135deg, #7C5CFC, #5A3FD8)",
              boxShadow: "0 4px 16px rgba(124,92,252,0.4)",
            }}
          >
            C
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Castfolio</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    width: 28,
                    height: 28,
                    background: i < step
                      ? "var(--accent)"
                      : i === step
                        ? "rgba(124,92,252,0.15)"
                        : "var(--bg-elevated)",
                    color: i <= step ? (i < step ? "white" : "#A78BFA") : "var(--text-muted)",
                    border: i === step ? "1px solid rgba(124,92,252,0.4)" : "1px solid transparent",
                  }}
                >
                  {i < step ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : i + 1}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-1.5"
                  style={{
                    width: 28,
                    height: 1,
                    background: i < step ? "var(--accent)" : "var(--border-default)",
                    transition: "background 0.3s",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          {/* Step 0 — Welcome */}
          {step === 0 && (
            <div className="text-center fade-in">
              <div
                className="mx-auto mb-5 rounded-2xl flex items-center justify-center"
                style={{
                  width: 64, height: 64,
                  background: "linear-gradient(135deg, rgba(124,92,252,0.2), rgba(90,63,216,0.1))",
                  color: "#A78BFA",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 className="font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>
                Castfolio에 오신 것을 환영합니다!
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                방송인 PR 페이지 제작 플랫폼입니다.<br />
                시작하기 전에 몇 가지 설정이 필요합니다.
              </p>
              <div
                className="rounded-xl p-4 mb-6 text-left"
                style={{ background: "var(--bg-elevated)" }}
              >
                {["사업자 유형 설정 (정산에 필요)", "기본 상품 선택 (언제든 수정 가능)"].map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, background: "rgba(124,92,252,0.2)", color: "#A78BFA" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{t}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                className="btn-primary w-full py-3 rounded-xl text-sm"
                style={{ background: "var(--accent)" }}
              >
                시작하기 →
              </button>
            </div>
          )}

          {/* Step 1 — User type */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                사업자 유형을 선택해주세요
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                정산 및 세금계산서 발행에 사용됩니다.
              </p>
              <div className="space-y-2.5 mb-6">
                {USER_TYPES.map(opt => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: userType === opt.value ? "rgba(124,92,252,0.1)" : "var(--bg-elevated)",
                      border: `1px solid ${userType === opt.value ? "rgba(124,92,252,0.4)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <div
                      className="rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all"
                      style={{
                        width: 18,
                        height: 18,
                        borderColor: userType === opt.value ? "#7C5CFC" : "var(--border-strong)",
                        background: userType === opt.value ? "#7C5CFC" : "transparent",
                      }}
                    >
                      {userType === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="userType"
                      value={opt.value}
                      checked={userType === opt.value}
                      onChange={e => setUserType(e.target.value)}
                      className="hidden"
                    />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {opt.label}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(0)}
                  className="btn-ghost flex-1 py-3 rounded-xl text-sm"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!userType}
                  className="btn-primary flex-1 py-3 rounded-xl text-sm"
                  style={{ background: userType ? "var(--accent)" : "var(--accent-dim)" }}
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Packages */}
          {step === 2 && (
            <div className="fade-in">
              <h2 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                기본 상품을 선택해주세요
              </h2>
              <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                최소 1개 이상 선택해야 합니다. 나중에 수정 가능합니다.
              </p>
              <div className="space-y-3 mb-6">
                {DEFAULT_PACKAGES.map((pkg, i) => (
                  <label
                    key={i}
                    className="block p-4 rounded-xl cursor-pointer transition-all relative"
                    style={{
                      background: selectedPackages.includes(i) ? "rgba(124,92,252,0.08)" : "var(--bg-elevated)",
                      border: `1px solid ${selectedPackages.includes(i) ? "rgba(124,92,252,0.35)" : "var(--border-subtle)"}`,
                    }}
                  >
                    {pkg.recommended && (
                      <span
                        className="absolute -top-2 right-4 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--accent)", color: "white" }}
                      >
                        추천
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={selectedPackages.includes(i)}
                      onChange={() => togglePackage(i)}
                      className="hidden"
                    />
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="rounded flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            width: 18, height: 18,
                            background: selectedPackages.includes(i) ? "#7C5CFC" : "transparent",
                            border: `1.5px solid ${selectedPackages.includes(i) ? "#7C5CFC" : "var(--border-strong)"}`,
                          }}
                        >
                          {selectedPackages.includes(i) && (
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {pkg.name}
                        </p>
                      </div>
                      <span className="font-bold text-sm" style={{ color: "#FCD34D" }}>
                        ₩{pkg.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="pl-7 space-y-1">
                      {pkg.features.map(f => (
                        <div key={f} className="flex items-center gap-1.5">
                          <span style={{ color: "var(--accent-emerald)", fontSize: "0.6rem" }}>●</span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 py-3 rounded-xl text-sm">
                  이전
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedPackages.length === 0}
                  className="btn-primary flex-1 py-3 rounded-xl text-sm"
                  style={{ background: selectedPackages.length > 0 ? "var(--accent)" : "var(--accent-dim)" }}
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Complete */}
          {step === 3 && (
            <div className="text-center fade-in">
              <div
                className="mx-auto mb-5 rounded-2xl flex items-center justify-center"
                style={{
                  width: 64, height: 64,
                  background: "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))",
                  color: "#6EE7B7",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="16 8 10 14 7 11"/>
                </svg>
              </div>
              <h2 className="font-bold text-xl mb-2" style={{ color: "var(--text-primary)" }}>
                설정이 완료되었습니다!
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                이제 방송인 PR 페이지를 제작할 수 있습니다.<br />
                대시보드에서 첫 방송인을 등록해보세요.
              </p>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl text-sm"
                style={{ background: loading ? "var(--accent-dim)" : "var(--accent)" }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                    </svg>
                    처리 중...
                  </span>
                ) : "대시보드로 이동 →"}
              </button>
            </div>
          )}
        </div>

        {/* Step label */}
        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          {step + 1} / {STEPS.length} · {STEPS[step]}
        </p>
      </div>
    </div>
  );
}
