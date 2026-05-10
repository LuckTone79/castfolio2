/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | Castfolio",
  description: "Castfolio 서비스 이용약관",
  robots: { index: true },
};

export default function TermsPage() {
  const updatedAt = "2026년 5월 9일";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.wideget.net";

  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-sm text-slate-900">Castfolio</Link>
          <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-700">개인정보처리방침 →</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-black/10 p-8 md:p-12 shadow-sm">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-2">Legal</p>
          <h1 className="text-2xl font-black text-slate-900 mb-1">이용약관</h1>
          <p className="text-sm text-slate-400 mb-8">최종 수정일: {updatedAt}</p>

          <div className="prose prose-sm max-w-none text-slate-700 space-y-8">

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제1조 (목적)</h2>
              <p className="leading-7">본 약관은 Wideget(이하 "회사")이 운영하는 Castfolio 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제2조 (정의)</h2>
              <ul className="list-disc list-inside space-y-2 leading-7">
                <li>"서비스"란 방송인 PR 홈페이지 제작·배포 플랫폼 및 관련 부가 서비스를 의미합니다.</li>
                <li>"파트너"란 서비스에 가입하여 PR 홈페이지 제작 업무를 수행하는 사업자 또는 개인을 의미합니다.</li>
                <li>"방송인 고객"이란 파트너로부터 PR 홈페이지 제작 서비스를 의뢰하는 방송인을 의미합니다.</li>
                <li>"콘텐츠"란 파트너 또는 방송인 고객이 서비스에 게시·제출하는 텍스트, 이미지, 영상 등 일체의 자료를 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제3조 (서비스 이용 계약 성립)</h2>
              <p className="leading-7">이용 계약은 파트너가 본 약관에 동의한 후 회사가 정한 방법으로 가입 신청을 완료하고 회사가 이를 승낙함으로써 성립합니다. 회사는 다음 각 호에 해당하는 경우 승낙을 거부할 수 있습니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-1 leading-7">
                <li>허위 정보를 기재한 경우</li>
                <li>이전에 서비스 이용 자격을 상실한 경우</li>
                <li>기타 회사가 정한 기준에 부합하지 않는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제4조 (서비스 이용 요금)</h2>
              <p className="leading-7">서비스 이용에 따른 수수료 및 정산 기준은 서비스 내 안내 페이지에서 확인할 수 있으며, 회사는 사전 공지를 통해 이를 변경할 수 있습니다. 정산은 매월 1일을 기준으로 전월 매출을 집계하여 처리하며, 최소 정산 금액(₩10,000) 미달 시 다음 정산 주기로 이월됩니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제5조 (콘텐츠 책임)</h2>
              <p className="leading-7">파트너 및 방송인 고객이 서비스에 업로드하는 콘텐츠의 저작권 및 기타 지적 재산권은 해당 콘텐츠를 게시한 자에게 귀속됩니다. 파트너는 업로드하는 콘텐츠가 제3자의 권리를 침해하지 않음을 보증하며, 이로 인해 발생하는 분쟁에 대해 회사는 책임을 지지 않습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제6조 (서비스 제공의 제한 및 중단)</h2>
              <p className="leading-7">회사는 시스템 점검·보수, 천재지변, 불가항력적 사유 등으로 서비스 제공을 일시적으로 중단할 수 있습니다. 회사는 이로 인한 손해에 대해 책임을 지지 않으나, 사전 고지가 가능한 경우 미리 공지합니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제7조 (분쟁 해결)</h2>
              <p className="leading-7">본 약관에 관한 분쟁은 대한민국 법률을 준거법으로 하며, 분쟁이 발생한 경우 서울중앙지방법원을 제1심 관할 법원으로 합니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">제8조 (문의)</h2>
              <p className="leading-7">서비스 이용약관에 대한 문의는 아래 연락처로 해주시기 바랍니다.</p>
              <div className="mt-3 p-4 bg-slate-50 rounded-2xl text-sm">
                <p className="font-semibold text-slate-700">Wideget</p>
                <p className="text-slate-500 mt-1">이메일: help@castfolio.com</p>
                <p className="text-slate-500">웹사이트: <a href={appUrl} className="text-purple-600 hover:underline">{appUrl}</a></p>
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
