import Link from "next/link";
import { PauseCircle } from "lucide-react";

interface SuspendedAccountProps {
  compact?: boolean;
}

export function SuspendedAccount({ compact = false }: SuspendedAccountProps) {
  if (compact) {
    return (
      <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
        <div className="flex items-start gap-3">
          <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold">계정이 일시 정지되었습니다.</p>
            <p className="mt-1 leading-6 text-amber-100/80">
              서비스 이용 재개를 위해 CastFolio 운영자에게 문의해주세요. 현재는 읽기 중심으로만 확인할 수
              있으며 쓰기 작업은 제한됩니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-[28px] border border-amber-500/20 bg-gray-900 p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300">
          <PauseCircle className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-black">계정이 일시 정지되었습니다.</h1>
        <p className="mt-3 text-sm leading-7 text-gray-400">
          서비스 이용 재개를 위해 CastFolio 운영자에게 문의해주세요.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
