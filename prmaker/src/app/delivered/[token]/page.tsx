import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props { params: { token: string } }

export default async function DeliveredPage({ params }: Props) {
  // Token is the previewToken of the page
  const page = await prisma.page.findUnique({
    where: { previewToken: params.token },
    include: {
      project: {
        include: {
          talent: true,
          user: { select: { name: true, email: true, phone: true } },
          orders: {
            where: { status: { in: ["DELIVERED", "SETTLED"] } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      qrAssets: { take: 1 },
    },
  });

  if (!page || page.status !== "PUBLISHED") notFound();

  const order = page.project.orders[0];
  const talent = page.project.talent;
  const agent = page.project.user;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.com";
  const pageUrl = `${appUrl}/p/${page.slug}`;
  const qr = page.qrAssets[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">축하합니다!</h1>
          <p className="text-gray-600 text-lg">
            {talent.nameKo}님의 PR 페이지가 완성되었습니다.
          </p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <h2 className="font-semibold mb-4">🔗 공개 페이지 링크</h2>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
            <a href={pageUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-blue-600 text-sm hover:underline break-all">
              {pageUrl}
            </a>
            <button onClick={() => navigator.clipboard.writeText(pageUrl)}
              className="text-gray-400 hover:text-gray-600 text-xs border px-2 py-1 rounded">
              복사
            </button>
          </div>
          <a href={pageUrl} target="_blank" rel="noopener noreferrer"
            className="mt-3 block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700">
            PR 페이지 보기
          </a>
        </div>

        {qr && (qr.pngUrl || qr.pdfUrl) && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h2 className="font-semibold mb-4">📱 QR 코드 다운로드</h2>
            <div className="flex gap-3">
              {qr.pngUrl && (
                <a href={qr.pngUrl} download className="flex-1 py-2 border border-gray-300 text-center rounded-lg text-sm hover:bg-gray-50">
                  PNG 다운로드
                </a>
              )}
              {qr.svgUrl && (
                <a href={qr.svgUrl} download className="flex-1 py-2 border border-gray-300 text-center rounded-lg text-sm hover:bg-gray-50">
                  SVG 다운로드
                </a>
              )}
              {qr.pdfUrl && (
                <a href={qr.pdfUrl} download className="flex-1 py-2 border border-gray-300 text-center rounded-lg text-sm hover:bg-gray-50">
                  PDF 카드
                </a>
              )}
            </div>
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h2 className="font-semibold mb-3">📋 수정 정책 안내</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 수정 가능 기간: 납품 후 14일 이내</p>
              <p>• 수정 문의 담당자: {agent.name} ({agent.email})</p>
              {agent.phone && <p>• 연락처: {agent.phone}</p>}
            </div>
          </div>
        )}

        <div className="text-center text-sm text-gray-400">
          <p>Powered by Castfolio</p>
        </div>
      </div>
    </div>
  );
}
