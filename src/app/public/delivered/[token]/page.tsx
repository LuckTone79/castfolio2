import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Sparkles, ExternalLink, QrCode, Download } from "lucide-react";

export default async function DeliveredPage({ params }: { params: { token: string } }) {
  const order = await prisma.order.findFirst({
    where: { orderNumber: params.token, status: { in: ["DELIVERED", "SETTLED"] } },
    include: {
      project: {
        include: {
          talent: true,
          page: { select: { slug: true, status: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const talent = order.project.talent;
  const slug = order.project.page?.slug;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-center gap-2 py-4 border-b border-gray-800">
        <Sparkles size={18} className="text-white" />
        <span className="text-sm font-semibold text-white">Castfolio</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-800 flex items-center justify-center mx-auto mb-6">
              <Sparkles size={28} className="text-emerald-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">납품이 완료되었습니다</h1>
            <p className="text-gray-400 mb-6">
              {talent.nameKo}님의 PR 페이지가 성공적으로 제작되었습니다
            </p>

            {slug && (
              <a
                href={`/p/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 transition-colors mb-4"
              >
                <ExternalLink size={16} /> PR 페이지 열기
              </a>
            )}

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-3">QR 코드</p>
              <div className="w-32 h-32 bg-gray-800 rounded-xl mx-auto flex items-center justify-center">
                <QrCode size={48} className="text-gray-600" />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {slug ? `castfolio.com/p/${slug}` : "페이지 URL"}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center border-t border-gray-800">
        <p className="text-xs text-gray-600">Powered by Castfolio</p>
      </footer>
    </div>
  );
}
