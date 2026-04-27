import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSystemPage() {
  await requireAdmin();

  // Fetch system-level stats
  const [userCount, projectCount, pageCount, orderCount] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.project.count(),
    prisma.page.count(),
    prisma.order.count({ where: { status: { in: ["PAID", "DELIVERED", "SETTLED"] } } }),
  ]);

  const envStatus = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">시스템 설정</h1>

      {/* System stats */}
      <section>
        <h2 className="text-lg font-semibold mb-3">현황 요약</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "등록 사용자", value: userCount + "명" },
            { label: "총 프로젝트", value: projectCount + "건" },
            { label: "총 페이지", value: pageCount + "개" },
            { label: "완료 주문", value: orderCount + "건" },
          ].map(s => (
            <div key={s.label} className="bg-white border rounded-xl p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Environment variable status */}
      <section>
        <h2 className="text-lg font-semibold mb-3">환경 변수 상태</h2>
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">변수명</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(envStatus).map(([key, set]) => (
                <tr key={key}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{key}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${set ? "text-green-700" : "text-red-600"}`}>
                      {set ? "✓ 설정됨" : "✗ 미설정"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Default settings */}
      <section>
        <h2 className="text-lg font-semibold mb-3">기본 설정</h2>
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">기본 수수료율</p>
              <p className="text-xs text-gray-500">신규 사용자에게 적용되는 기본 수수료</p>
            </div>
            <p className="text-lg font-bold">15%</p>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">최소 정산 금액</p>
              <p className="text-xs text-gray-500">이 금액 미만은 다음 기간으로 이월</p>
            </div>
            <p className="text-lg font-bold">₩10,000</p>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">정산 주기</p>
              <p className="text-xs text-gray-500">정산 실행 시점</p>
            </div>
            <p className="text-sm font-medium text-gray-700">매월 1일 (전월분)</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">MVP 결제 방식</p>
              <p className="text-xs text-gray-500">현재 지원되는 결제 방식</p>
            </div>
            <p className="text-sm font-medium text-gray-700">오프라인 전용</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          * 설정 변경은 개발자 배포를 통해 이루어집니다. (MVP 단계)
        </p>
      </section>

      {/* Supported themes */}
      <section>
        <h2 className="text-lg font-semibold mb-3">지원 테마</h2>
        <div className="bg-white border rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {["anchor-clean", "prestige-black", "luxe-marble", "fresh-sky", "soft-blush", "natural-green", "warm-coral"].map(t => (
              <span key={t} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-mono">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
