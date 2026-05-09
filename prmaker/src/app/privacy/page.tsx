import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Castfolio",
  description: "Castfolio 개인정보처리방침",
  robots: { index: true },
};

export default function PrivacyPage() {
  const updatedAt = "2026년 5월 9일";

  return (
    <div className="min-h-screen bg-[#f7f4ee]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-sm text-slate-900">Castfolio</Link>
          <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-700">이용약관 →</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl border border-black/10 p-8 md:p-12 shadow-sm">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-2">Privacy</p>
          <h1 className="text-2xl font-black text-slate-900 mb-1">개인정보처리방침</h1>
          <p className="text-sm text-slate-400 mb-8">최종 수정일: {updatedAt}</p>

          <div className="prose prose-sm max-w-none text-slate-700 space-y-8">

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">1. 개인정보의 처리 목적</h2>
              <p className="leading-7">Castfolio(운영: Wideget)는 다음의 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-2 leading-7">
                <li><strong>회원 가입 및 관리:</strong> 회원제 서비스 제공, 이용자 식별·인증, 서비스 부정이용 방지</li>
                <li><strong>서비스 제공:</strong> PR 홈페이지 제작·배포, 콘텐츠 제공, 계약서 작성·이행</li>
                <li><strong>정산 및 결제:</strong> 서비스 이용 요금 정산, 세금계산서 발행</li>
                <li><strong>마케팅 및 광고:</strong> 신규 서비스 및 이벤트 안내 (별도 동의 시)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">2. 처리하는 개인정보 항목</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">구분</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">수집 항목</th>
                      <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">보유 기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2">파트너 회원</td>
                      <td className="border border-slate-200 px-3 py-2">이름, 이메일, 전화번호, 사업자 정보</td>
                      <td className="border border-slate-200 px-3 py-2">회원 탈퇴 후 5년</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2">방송인 고객</td>
                      <td className="border border-slate-200 px-3 py-2">이름(한/영), 이메일, 연락처, 방송 경력, 사진</td>
                      <td className="border border-slate-200 px-3 py-2">서비스 종료 후 3년</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-200 px-3 py-2">결제 정보</td>
                      <td className="border border-slate-200 px-3 py-2">결제 수단, 거래 금액, 영수증 정보</td>
                      <td className="border border-slate-200 px-3 py-2">5년(전자상거래법)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">3. 개인정보의 제3자 제공</h2>
              <p className="leading-7">회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-2 leading-7">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">4. 개인정보처리 위탁</h2>
              <p className="leading-7">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-2 leading-7">
                <li><strong>Supabase Inc.</strong>: 데이터베이스 호스팅 및 인증 (미국)</li>
                <li><strong>Vercel Inc.</strong>: 웹 서비스 호스팅 (미국)</li>
                <li><strong>Resend Inc.</strong>: 이메일 발송 (미국)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">5. 정보주체의 권리·의무 및 행사 방법</h2>
              <p className="leading-7">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
              <ul className="list-disc list-inside mt-2 space-y-2 leading-7">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리 정지 요구</li>
              </ul>
              <p className="mt-3 leading-7">권리 행사는 이메일(help@castfolio.com) 또는 서면으로 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">6. 개인정보 보호책임자</h2>
              <div className="p-4 bg-slate-50 rounded-2xl text-sm">
                <p className="font-semibold text-slate-700">개인정보 보호책임자</p>
                <p className="text-slate-500 mt-1">소속: Wideget</p>
                <p className="text-slate-500">이메일: privacy@castfolio.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">7. 쿠키 사용</h2>
              <p className="leading-7">서비스는 로그인 세션 유지 및 언어 설정 저장을 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키 허용 여부를 선택할 수 있으나, 쿠키를 거부할 경우 일부 서비스 이용이 제한될 수 있습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-3">8. 개인정보처리방침 변경</h2>
              <p className="leading-7">본 방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항 시행 7일 전부터 서비스 공지사항을 통해 고지할 것입니다.</p>
              <p className="mt-2 text-slate-500">시행일: 2026년 5월 9일</p>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
