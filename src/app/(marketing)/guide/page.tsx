import Link from "next/link";
import { ArrowRight, CheckCircle2, FileInput, Globe, LayoutTemplate, QrCode, ReceiptText, Users } from "lucide-react";

const GUIDE_STEPS = [
  {
    icon: Users,
    title: "1. 방송인 고객 등록하기",
    description:
      "고객 이름, 포지션, 기본 연락처를 등록해 파트너 업무의 시작점을 만듭니다. 한 계정 안에서 여러 고객을 동시에 관리할 수 있도록 기준 정보를 먼저 정리합니다.",
  },
  {
    icon: FileInput,
    title: "2. 자료 요청 링크 보내기",
    description:
      "로그인 없는 자료 제출 링크를 생성해 고객에게 전달합니다. 사진, 자기소개, 경력, 포트폴리오, 연락처를 한 번에 받는 것이 핵심입니다.",
  },
  {
    icon: CheckCircle2,
    title: "3. 제출된 자료 확인하기",
    description:
      "고객이 보낸 자료를 확인하고 누락된 항목이 있는지 점검합니다. 확인이 끝나면 빌더로 불러와 제작 단계로 넘기면 됩니다.",
  },
  {
    icon: LayoutTemplate,
    title: "4. PR 홈페이지 제작하기",
    description:
      "고객 이미지와 포지션에 맞는 테마를 선택하고 섹션 순서, 문구, 사진, 영상 요소를 조정합니다. 결과물은 파트너가 납품하는 상업용 홈페이지라는 점이 기준입니다.",
  },
  {
    icon: Globe,
    title: "5. 검토 링크 전달하기",
    description:
      "완성 전 검토 링크를 보내 고객이 품질을 확인하고 수정 요청을 남길 수 있게 합니다. 이 단계에서는 구매 전 판단에 필요한 신뢰감과 완성도가 중요합니다.",
  },
  {
    icon: CheckCircle2,
    title: "6. 수정 요청 반영하기",
    description:
      "고객 피드백을 반영해 표현, 경력 정리, 이미지 구성을 다듬습니다. 파트너는 이 단계를 통해 결과물의 완성도와 납품 만족도를 함께 관리합니다.",
  },
  {
    icon: QrCode,
    title: "7. 최종 공개 URL과 QR 납품하기",
    description:
      "최종 공개 링크와 QR 카드로 납품합니다. 고객은 해당 페이지를 방송사 PD, 에이전시, 행사 담당자에게 바로 공유할 수 있습니다.",
  },
  {
    icon: ReceiptText,
    title: "8. 판매 확정 입력하기",
    description:
      "실제 결제가 확인되면 판매금액과 메모, 증빙 정보를 입력해 판매를 확정합니다. 이 시점부터만 플랫폼 수수료가 계산됩니다.",
  },
  {
    icon: ReceiptText,
    title: "9. 정산 내역 확인하기",
    description:
      "판매 확정 금액 기준으로 파트너 수익과 플랫폼 수수료를 확인합니다. 정산 정책은 운영 설정에 따라 달라질 수 있으므로 내역을 주기적으로 점검합니다.",
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="border-b border-white/10 px-6 pb-16 pt-20 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-300">Partner Manual</p>
          <h1 className="mt-4 text-balance text-4xl font-black sm:text-5xl">파트너 운영 가이드</h1>
          <p className="mt-4 text-base leading-8 text-gray-400 sm:text-lg">
            방송인 고객 등록부터 자료 수집, 홈페이지 제작, 검토, 납품, 판매 확정까지 CastFolio의 전체
            업무 흐름을 안내합니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-6">
          {GUIDE_STEPS.map(({ icon: Icon, title, description }, index) => (
            <article key={title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-violet-200">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Step {index + 1}</p>
                  <h2 className="mt-2 text-2xl font-black">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-gray-300">{description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[28px] border border-violet-400/20 bg-violet-400/10 p-6">
          <p className="text-sm font-semibold text-violet-100">
            핵심 원칙: CastFolio의 직접 고객은 방송인이 아니라 제작 파트너입니다. 방송인 고객은 링크를 통해
            자료를 제출하고 결과물을 검토하는 최종 고객으로 이해하면 전체 운영 흐름이 훨씬 명확해집니다.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-gray-950 transition hover:bg-gray-100"
          >
            파트너로 시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
