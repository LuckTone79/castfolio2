import Link from "next/link";
import { ShieldAlert } from "lucide-react";

interface AccessDeniedProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export function AccessDenied({
  title = "접근 권한이 없습니다.",
  description = "이 페이지는 허용된 계정만 접근할 수 있습니다.",
  actionHref = "/",
  actionLabel = "홈으로 돌아가기",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-[28px] border border-red-500/20 bg-gray-900 p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-black">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-gray-400">{description}</p>
        <Link
          href={actionHref}
          className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
