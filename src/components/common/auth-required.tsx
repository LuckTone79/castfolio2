import Link from "next/link";
import { LockKeyhole } from "lucide-react";

interface AuthRequiredProps {
  title?: string;
  description?: string;
}

export function AuthRequired({
  title = "로그인이 필요합니다.",
  description = "파트너 대시보드를 이용하려면 로그인해주세요.",
}: AuthRequiredProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-gray-900 p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-400">{description}</p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
        >
          로그인하기
        </Link>
      </div>
    </div>
  );
}
