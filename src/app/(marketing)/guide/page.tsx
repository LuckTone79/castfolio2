import { Sparkles, Users, FileInput, Palette, Eye, Truck } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { icon: Users, title: "1. 탤런트 등록", desc: "방송인의 기본 정보(이름, 포지션, 연락처)를 등록합니다. 한 계정에서 여러 탤런트를 관리할 수 있습니다.", detail: "대시보드 → 탤런트 → 등록 버튼을 클릭하세요." },
  { icon: FileInput, title: "2. 자료 수집", desc: "인테이크 폼을 생성하고, 방송인에게 링크를 전달합니다. 방송인이 직접 자기소개, 경력, 포트폴리오를 입력합니다.", detail: "프로젝트 → 자료수집 폼 생성 → 토큰 링크 복사 → 카카오톡/이메일로 전송" },
  { icon: Palette, title: "3. 페이지 제작", desc: "빌더에서 7가지 테마 중 하나를 선택하고, 각 섹션을 편집합니다. 한국어/영어/중국어 3개 언어를 동시에 작업할 수 있습니다.", detail: "Hero → Profile → Career → Portfolio → Strength → Contact 순서로 편집" },
  { icon: Eye, title: "4. 검수 & 발행", desc: "미리보기 링크를 생성하여 방송인/클라이언트에게 확인을 요청합니다. 확인이 완료되면 원클릭으로 발행합니다.", detail: "발행 시 QR 코드(PNG/SVG/PDF)가 자동 생성됩니다." },
  { icon: Truck, title: "5. 납품 & 정산", desc: "납품 링크와 QR 코드를 전달합니다. 결제가 확인되면 월간 정산에 자동 포함됩니다.", detail: "매월 1회 정산. 수수료 15%를 제외한 금액이 등록 계좌로 입금됩니다." },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center">
        <h1 className="text-4xl font-bold">이용 가이드</h1>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto">
          Castfolio로 방송인 PR 페이지를 제작하는 전체 과정을 안내합니다
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="space-y-8">
          {STEPS.map(({ icon: Icon, title, desc, detail }, i) => (
            <div key={i} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-white" />
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-gray-800 mt-2" />}
              </div>
              <div className="pb-6">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="text-gray-400 mt-2 leading-relaxed">{desc}</p>
                <p className="text-sm text-gray-500 mt-2 bg-gray-900 rounded-lg px-4 py-2.5 border border-gray-800">
                  💡 {detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/create" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors">
            지금 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
