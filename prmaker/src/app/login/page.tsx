"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
  const requestedRedirect = searchParams.get("redirect") || "/dashboard/onboarding";
  const redirect = requestedRedirect.startsWith("/") ? requestedRedirect : "/dashboard/onboarding";
  const callbackError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const oauthErrorMessage = useMemo(() => {
    if (callbackError === "oauth_callback_failed") {
      return "Google 로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
    if (callbackError === "profile_sync_failed") {
      return "로그인 계정 정보를 준비하는 중 문제가 발생했습니다. 운영자에게 문의해 주세요.";
    }
    return "";
  }, [callbackError]);

  const resetFeedback = () => {
    setError("");
    setMessage("");
  };

  const finishPasswordLogin = async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();

    if (!res.ok) {
      const msgMap: Record<string, string> = {
        NO_DB_USER: "등록되지 않은 계정입니다. 관리자에게 문의하세요.",
        SUSPENDED: "계정이 정지되었습니다. 관리자에게 문의하세요.",
        DELETED: "존재하지 않는 계정입니다.",
      };
      setError(msgMap[data.code] ?? "로그인 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    if (data.role === "MASTER_ADMIN") {
      router.push("/admin");
    } else {
      router.push(!data.userType ? "/dashboard/onboarding" : "/dashboard");
    }
    router.refresh();
  };

  const getSupabaseClientSafely = () => {
    try {
      return createClient();
    } catch (clientError) {
      throw new Error(
        clientError instanceof Error && clientError.message === "Missing Supabase environment variables"
          ? "로그인 설정이 아직 완전히 연결되지 않았습니다. 잠시 후 다시 시도해 주세요."
          : "로그인 설정을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    resetFeedback();
    try {
      const supabase = getSupabaseClientSafely();
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) {
        setError(loginError.message === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : loginError.message);
        return;
      }

      await finishPasswordLogin();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    resetFeedback();
    try {
      const supabase = getSupabaseClientSafely();
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/onboarding`,
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      setMessage("인증 메일을 발송했습니다. 메일함을 확인해 주세요.");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setLoading(true);
    resetFeedback();
    try {
      const supabase = getSupabaseClientSafely();
      const { error: forgotError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (forgotError) {
        setError(forgotError.message);
        return;
      }

      setMessage("비밀번호 재설정 메일을 발송했습니다.");
    } catch (forgotError) {
      setError(forgotError instanceof Error ? forgotError.message : "비밀번호 재설정 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setOauthLoading(true);
    resetFeedback();
    try {
      const returnUrl = new URL(`${window.location.origin}/auth/callback`);
      returnUrl.searchParams.set("next", redirect);

      const supabase = getSupabaseClientSafely();
      const { data, error: googleError } = await supabase.auth.signInWithOAuth({
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
        return;
      }

      if (!data?.url) {
        setError("Google 로그인 주소를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
    } catch (googleError) {
      setError(googleError instanceof Error ? googleError.message : "Google 로그인 처리 중 오류가 발생했습니다.");
    } finally {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Sparkles size={28} className="text-violet-300" />
          <span className="text-2xl font-bold tracking-tight">Castfolio</span>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/95 p-6 shadow-2xl">
          <h1 className="mb-1 text-center text-xl font-semibold">
            {mode === "login" && "로그인"}
            {mode === "signup" && "회원가입"}
            {mode === "forgot" && "비밀번호 재설정"}
          </h1>
          <p className="mb-6 text-center text-sm text-gray-400">
            {mode === "login" && "파트너 대시보드에 로그인해 방송인 고객 제작 흐름을 관리하세요."}
            {mode === "signup" && "새 파트너 계정을 만들고 고객 등록부터 납품까지 바로 시작하세요."}
            {mode === "forgot" && "가입한 이메일을 입력해 주세요."}
          </p>

          {message ? (
            <div className="rounded-lg border border-emerald-800 bg-emerald-900/30 p-4 text-center text-sm text-emerald-300">
              {message}
            </div>
          ) : (
            <div className="space-y-4">
              {mode !== "forgot" && (
                <>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-700 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:opacity-60"
                    onClick={handleGoogleLogin}
                    disabled={oauthLoading}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[#4285F4] ring-1 ring-gray-300">
                      G
                    </span>
                    {oauthLoading ? "Google로 이동 중..." : "Google로 계속하기"}
                  </button>
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
                  <input
                    type="email"
                    placeholder="이메일"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-3 pl-9 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
                    required
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-3 pl-9 pr-10 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
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
                  <p className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-300">
                    {error || oauthErrorMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && "처리 중..."}
                  {!loading && mode === "login" && "로그인"}
                  {!loading && mode === "signup" && "가입하기"}
                  {!loading && mode === "forgot" && "재설정 메일 발송"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-5 border-t border-gray-800 pt-4 text-center text-sm">
            {mode === "login" && (
              <>
                <button onClick={() => changeMode("forgot")} className="text-gray-400 transition hover:text-white">
                  비밀번호를 잊으셨나요?
                </button>
                <p className="mt-2 text-gray-500">
                  계정이 없으신가요?{" "}
                  <button onClick={() => changeMode("signup")} className="text-white hover:underline">
                    가입하기
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
              <button onClick={() => changeMode("login")} className="text-gray-400 transition hover:text-white">
                로그인으로 돌아가기
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">© 2026 Castfolio. All rights reserved.</p>
      </div>
    </div>
  );
}
