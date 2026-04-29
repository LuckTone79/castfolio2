"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/app";
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const oauthErrorMessage = useMemo(() => {
    if (callbackError !== "oauth_callback_failed") return "";
    return "Google 로그인 처리 중 오류가 발생했습니다. Supabase와 Google Cloud의 리디렉션 URL 설정을 다시 확인해주세요.";
  }, [callbackError]);

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const handleLogin = async () => {
    setLoading(true);
    resetFeedback();

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      setError(
        loginError.message === "Invalid login credentials"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : loginError.message,
      );
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  const handleSignup = async () => {
    setLoading(true);
    resetFeedback();

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/app` },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setMessage("인증 메일을 발송했습니다. 받은 편지함에서 확인해주세요.");
    setLoading(false);
  };

  const handleForgot = async () => {
    setLoading(true);
    resetFeedback();

    const { error: forgotError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (forgotError) {
      setError(forgotError.message);
      setLoading(false);
      return;
    }

    setMessage("비밀번호 재설정 메일을 발송했습니다.");
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    resetFeedback();

    const returnUrl = new URL(`${window.location.origin}/auth/callback`);
    returnUrl.searchParams.set("next", redirect);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: returnUrl.toString(),
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (googleError) {
      setError(googleError.message);
      setOauthLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "login") handleLogin();
    if (mode === "signup") handleSignup();
    if (mode === "forgot") handleForgot();
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setLoading(false);
    setOauthLoading(false);
    resetFeedback();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center gap-2">
            <Sparkles size={28} className="text-white" />
            <span className="text-2xl font-bold tracking-tight text-white">CastFolio</span>
          </div>
          <p className="text-sm text-gray-500">제작 파트너와 관리자용 로그인</p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
          <h1 className="mb-1 text-center text-xl font-semibold text-white">
            {mode === "login" && "로그인"}
            {mode === "signup" && "파트너 계정 만들기"}
            {mode === "forgot" && "비밀번호 재설정"}
          </h1>
          <p className="mb-6 text-center text-sm text-gray-400">
            {mode === "login" && "파트너 대시보드 또는 관리자 화면으로 이동합니다."}
            {mode === "signup" && "새 파트너 계정을 만들어 CastFolio를 시작하세요."}
            {mode === "forgot" && "가입한 이메일을 입력하면 재설정 링크를 보내드립니다."}
          </p>

          {message ? (
            <div className="rounded-lg border border-emerald-800 bg-emerald-900/30 p-4 text-center text-sm text-emerald-400">
              {message}
            </div>
          ) : (
            <div className="space-y-4">
              {mode !== "forgot" && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full cursor-pointer bg-white text-gray-900 hover:bg-gray-100"
                    onClick={handleGoogleLogin}
                    loading={oauthLoading}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4] ring-1 ring-gray-300">
                      G
                    </span>
                    {oauthLoading ? "Google로 이동 중..." : "Google로 계속하기"}
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span className="text-xs text-gray-500">또는 이메일로 진행</span>
                    <div className="h-px flex-1 bg-gray-800" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="pl-9"
                    required
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pl-9 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}

                {(error || oauthErrorMessage) && (
                  <p className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-400">
                    {error || oauthErrorMessage}
                  </p>
                )}

                <Button type="submit" className="w-full" loading={loading}>
                  {mode === "login" && "로그인"}
                  {mode === "signup" && "계정 만들기"}
                  {mode === "forgot" && "재설정 메일 보내기"}
                </Button>
              </form>
            </div>
          )}

          <div className="mt-5 border-t border-gray-800 pt-4 text-center text-sm">
            {mode === "login" && (
              <>
                <button onClick={() => changeMode("forgot")} className="text-gray-400 transition-colors hover:text-white">
                  비밀번호를 잊으셨나요?
                </button>
                <p className="mt-2 text-gray-500">
                  계정이 없으신가요?{" "}
                  <button onClick={() => changeMode("signup")} className="text-white hover:underline">
                    파트너 계정 만들기
                  </button>
                </p>
              </>
            )}

            {mode === "signup" && (
              <p className="text-gray-500">
                이미 계정이 있으신가요?{" "}
                <button onClick={() => changeMode("login")} className="text-white hover:underline">
                  로그인
                </button>
              </p>
            )}

            {mode === "forgot" && (
              <button onClick={() => changeMode("login")} className="text-gray-400 transition-colors hover:text-white">
                로그인으로 돌아가기
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">© 2026 CastFolio. All rights reserved.</p>
      </div>
    </div>
  );
}
