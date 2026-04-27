import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui";

export default async function SystemPage() {
  await requireAdmin();

  const env = {
    NODE_ENV: process.env.NODE_ENV || "unknown",
    SUPABASE: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    DATABASE: !!process.env.DATABASE_URL,
    RESEND: !!process.env.RESEND_API_KEY,
  };

  return (
    <>
      <PageHeader title="시스템 설정" description="환경 변수 및 시스템 상태를 확인합니다" />

      <div className="max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-400">환경 변수 상태</h3>
        <dl className="space-y-3">
          <EnvRow label="NODE_ENV" value={env.NODE_ENV} />
          <EnvRow label="Supabase" connected={env.SUPABASE} />
          <EnvRow label="Database" connected={env.DATABASE} />
          <EnvRow label="Resend (Email)" connected={env.RESEND} />
        </dl>
      </div>

      <div className="max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 mt-6 space-y-4">
        <h3 className="text-sm font-medium text-gray-400">버전 정보</h3>
        <dl className="space-y-3">
          <Row label="앱 버전" value="1.0.0" />
          <Row label="Next.js" value="14.2.3" />
          <Row label="Prisma" value="5.10.0" />
        </dl>
      </div>
    </>
  );
}

function EnvRow({ label, value, connected }: { label: string; value?: string; connected?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd>
        {value ? (
          <span className="text-sm text-white">{value}</span>
        ) : (
          <Badge color={connected ? "green" : "red"}>
            {connected ? "연결됨" : "미설정"}
          </Badge>
        )}
      </dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm text-white font-mono">{value}</dd>
    </div>
  );
}
