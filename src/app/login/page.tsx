"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";

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
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : err.message);
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  };

  const handleSignup = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setMessage("인증 메일을 발송했습니다. 이메일을 확인해 주세요.");
    setLoading(false);
  };

  const handleForgot = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setMessage("비밀번호 재설정 메일을 발송했습니다.");
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") handleLogin();
    else if (mode === "signup") handleSignup();
    else handleForgot();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles size={28} className="text-white" />
          <span className="text-2xl font-bold text-white tracking-tight">Castfolio</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white text-center mb-1">
            {mode === "login" && "로그인"}
            {mode === "signup" && "회원가입"}
            {mode === "forgot" && "비밀번호 재설정"}
          </h2>
          <p className="text-sm text-gray-400 text-center mb-6">
            {mode === "login" && "계정에 로그인하여 시작하세요"}
            {mode === "signup" && "새 계정을 만들어 시작하세요"}
            {mode === "forgot" && "가입한 이메일을 입력하세요"}
          </p>

          {message ? (
            <div className="rounded-lg bg-emerald-900/30 border border-emerald-800 p-4 text-sm text-emerald-400 text-center">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" className="w-full" loading={loading}>
                {mode === "login" && "로그인"}
                {mode === "signup" && "가입하기"}
                {mode === "forgot" && "재설정 메일 발송"}
              </Button>
            </form>
          )}

          {/* Mode Switcher */}
          <div className="mt-5 pt-4 border-t border-gray-800 text-center text-sm">
            {mode === "login" && (
              <>
                <button onClick={() => { setMode("forgot"); setError(""); setMessage(""); }} className="text-gray-400 hover:text-white transition-colors">
                  비밀번호를 잊으셨나요?
                </button>
                <p className="mt-2 text-gray-500">
                  계정이 없으신가요?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); setMessage(""); }} className="text-white hover:underline">
                    가입하기
                  </button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-gray-500">
                이미 계정이 있으신가요?{" "}
                <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-white hover:underline">
                  로그인
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); setError(""); setMessage(""); }} className="text-gray-400 hover:text-white transition-colors">
                ← 로그인으로 돌아가기
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6">
          © 2026 Castfolio. All rights reserved.
        </p>
      </div>
    </div>
  );
}
