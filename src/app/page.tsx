import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  FileInput,
  Globe,
  LayoutTemplate,
  Link2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const OPERATING_STRUCTURE = [
  {
    title: "CastFolio 운영자",
    description:
      "플랫폼을 제공하고, 파트너 계정·수수료·정산·전체 페이지 운영 기준을 관리합니다.",
  },
  {
    title: "제작 파트너",
    description:
      "방송인 고객에게 PR 홈페이지 제작 서비스를 판매하고, 자료 수집부터 납품까지 업무를 운영합니다.",
  },
  {
    title: "방송인 고객",
    description:
      "완성된 PR 홈페이지를 검토하고, 방송사·PD·에이전시 제출용으로 활용할 최종 결과물을 받습니다.",
  },
];

const PARTNER_BENEFITS = [
  {
    icon: Users,
    title: "방송인 고객 관리",
    description:
      "고객별 프로필, 자료 제출 여부, 제작 단계, 판매 확정 상태를 한 화면에서 관리합니다.",
  },
  {
    icon: FileInput,
    title: "자료 수집 링크",
    description:
      "방송인 고객에게 로그인 없는 전용 링크를 보내 사진, 경력, 소개, 영상 자료를 빠르게 수집합니다.",
  },
  {
    icon: LayoutTemplate,
    title: "PR 홈페이지 빌더",
    description:
      "7가지 고급 테마를 기반으로 고객 이미지에 맞는 결과물을 제작하고 납품 품질을 표준화합니다.",
  },
  {
    icon: Link2,
    title: "검토 링크 전달",
    description:
      "완성 전 페이지를 고객에게 보내 수정 요청을 받고, 최종 승인 전까지 검토 흐름을 관리합니다.",
  },
  {
    icon: QrCode,
    title: "공개 URL 및 QR 납품",
    description:
      "최종 공개 링크와 QR 카드로 방송국 PD, 에이전시, 행사 담당자에게 바로 공유할 수 있게 합니다.",
  },
  {
    icon: Banknote,
    title: "판매 확정 및 정산",
    description:
      "실제 판매금액을 기준으로 파트너 수익과 플랫폼 수수료를 자동 계산해 정산 흐름을 명확하게 정리합니다.",
  },
];

const SAMPLE_THEMES = [
  {
    name: "Elegant White",
    audience: "신뢰감과 깔끔함이 중요한 아나운서, 리포터 고객에게 적합",
  },
  {
    name: "Classic Black",
    audience: "카리스마와 고급스러운 이미지를 강조해야 하는 MC, 쇼호스트 고객에게 적합",
  },
  {
    name: "Soft Pink",
    audience: "친근하고 부드러운 이미지를 원하는 라이프스타일 쇼호스트 고객에게 적합",
  },
  {
    name: "Sky Blue",
    audience: "밝고 활동적인 이미지를 강조하는 리포터, 행사 MC 고객에게 적합",
  },
];

const WORKFLOW = [
  "방송인 고객 등록",
  "자료 요청 링크 발송",
  "제출 자료 확인 후 빌더 불러오기",
  "PR 홈페이지 제작",
  "검토 링크 전달 및 수정 반영",
  "최종 공개 URL·QR 납품",
  "판매 확정 입력",
  "파트너 정산 내역 관리",
];

const FAQ_ITEMS = [
  {
    question: "CastFolio는 방송인이 직접 사용하는 서비스인가요?",
    answer:
      "아닙니다. CastFolio는 방송인 PR 홈페이지를 제작·판매하는 파트너를 위한 B2B SaaS입니다. 방송인 고객은 파트너가 보낸 자료 제출 링크, 검토 링크, 최종 공개 페이지를 통해 이용합니다.",
  },
  {
    question: "파트너가 판매 가격을 직접 정할 수 있나요?",
    answer:
      "네. 파트너가 방송인 고객에게 제안하는 제작 가격은 자유롭게 설정할 수 있습니다. CastFolio는 판매 확정 금액을 기준으로 플랫폼 수수료를 계산합니다.",
  },
  {
    question: "방송인 고객도 회원가입이 필요한가요?",
    answer:
      "아닙니다. 방송인 고객은 로그인 없이 자료 제출 링크와 검토 링크를 통해 필요한 정보를 입력하고 완성된 페이지를 확인합니다.",
  },
  {
    question: "수수료는 언제 발생하나요?",
    answer:
      "홈페이지를 생성하거나 편집하는 것만으로는 수수료가 발생하지 않습니다. 파트너가 판매 확정을 입력한 시점에만 수수료가 계산됩니다.",
  },
  {
    question: "기본 수수료 구조는 어떻게 되나요?",
    answer:
      "기본 구조는 파트너 수익 85%, CastFolio 플랫폼 수수료 15%입니다. 파트너별 수수료율은 운영 정책에 따라 조정될 수 있습니다.",
  },
  {
    question: "완성된 홈페이지는 어떻게 납품하나요?",
    answer:
      "최종 공개 URL과 QR 카드로 납품할 수 있습니다. 방송인 고객은 그 링크를 방송사 PD, 에이전시, 행사 담당자에게 바로 공유할 수 있습니다.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f4ee] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f6f4ee]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">
              C
            </div>
            <div>
              <p className="text-lg font-black tracking-tight">CastFolio</p>
              <p className="text-xs font-medium text-slate-500">Partner PR Delivery SaaS</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#structure" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
              운영 구조
            </a>
            <a href="#benefits" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
              파트너 기능
            </a>
            <a href="#workflow" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
              업무 흐름
            </a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
              수수료
            </a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/guide"
              className="hidden rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white sm:inline-flex"
            >
              운영 가이드
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              파트너로 시작하기
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#d7d0ff] px-4 py-2 text-sm font-semibold text-[#4338ca]">
                <Sparkles className="h-4 w-4" />
                방송인 PR 홈페이지 제작 대행 파트너용 B2B SaaS
              </div>

              <h1 className="mt-6 text-balance text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                방송인 PR 홈페이지 제작을
                <br />
                수익화하는 파트너용 빌더
              </h1>

              <p className="mt-6 max-w-3xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
                CastFolio는 아나운서, 쇼호스트, MC, 리포터 고객에게 전문 PR 홈페이지를 제작·판매하는
                파트너를 위한 플랫폼입니다. 고객 자료 수집부터 제작, 검토 링크 전달, 최종 납품, 판매
                확정, 수수료 정산까지 하나의 흐름으로 관리하세요.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  파트너로 시작하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  샘플 PR 페이지 보기
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-3 text-sm">
                <span className="rounded-2xl border border-black/10 bg-white px-4 py-2 font-semibold text-slate-700">
                  월정액 없이 시작
                </span>
                <span className="rounded-2xl border border-black/10 bg-white px-4 py-2 font-semibold text-slate-700">
                  판매 확정 시에만 수수료 발생
                </span>
                <span className="rounded-2xl border border-black/10 bg-white px-4 py-2 font-semibold text-slate-700">
                  파트너 수익 85%
                </span>
              </div>
            </div>

            <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
              <div className="rounded-[28px] bg-slate-950 p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/60">Partner workflow</p>
                <div className="mt-6 space-y-4">
                  {[
                    "방송인 고객 등록",
                    "자료 제출 링크 발송",
                    "PR 홈페이지 제작",
                    "검토 링크 전달",
                    "최종 납품 및 판매 확정",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-[#b6ffb0]" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#4338ca] px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Revenue split</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black">85%</p>
                      <p className="text-sm text-white/75">파트너 수익</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black">15%</p>
                      <p className="text-sm text-white/75">플랫폼 수수료</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="structure" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4338ca]">Operating Model</p>
              <h2 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl">
                CastFolio는 이렇게 운영됩니다
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                이 서비스의 직접 고객은 방송인이 아니라 제작 파트너입니다. 방송인 고객은 파트너가 만든
                결과물을 검토하고 활용하는 최종 고객입니다.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {OPERATING_STRUCTURE.map((item, index) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                >
                  <div className="inline-flex rounded-2xl bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Step {index + 1}
                  </div>
                  <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-dashed border-black/15 bg-[#efe9db] px-6 py-6 text-center text-sm font-semibold text-slate-700 sm:text-base">
              CastFolio 운영자 → 제작 파트너 → 방송인 고객 → 방송사·PD·에이전시 제출
            </div>
          </div>
        </section>

        <section id="benefits" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4338ca]">Partner Benefits</p>
              <h2 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl">
                파트너 업무 흐름에 맞춰 기능을 정리했습니다
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                방송인 직접 사용 서비스처럼 보이지 않도록, 기능 설명도 모두 파트너의 실제 운영 기준으로
                재정렬했습니다.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {PARTNER_BENEFITS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border border-black/10 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                >
                  <div className="inline-flex rounded-2xl bg-[#e2dcff] p-3 text-[#4338ca]">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[30px] bg-slate-950 p-8 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">Sample outcomes</p>
              <h2 className="mt-4 text-4xl font-black tracking-tight">고객에게 제안할 수 있는 PR 홈페이지 샘플</h2>
              <p className="mt-4 text-base leading-7 text-white/70">
                방송인 고객의 이미지와 포지션에 맞춰 납품할 수 있는 샘플 결과물입니다. 테마 선택도
                방송인이 아니라 파트너의 제안 도구로 보이도록 정리했습니다.
              </p>
              <Link
                href="/demo"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                샘플 갤러리 전체 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {SAMPLE_THEMES.map((theme) => (
                <article key={theme.name} className="rounded-[28px] border border-black/10 bg-white p-6">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#4338ca]">{theme.name}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{theme.audience}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <BadgeCheck className="h-4 w-4 text-[#4338ca]" />
                    파트너 제안용 샘플
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4338ca]">Workflow</p>
              <h2 className="mt-3 text-balance text-4xl font-black tracking-tight sm:text-5xl">
                실제 업무 흐름도 파트너 기준으로 고정합니다
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {WORKFLOW.map((step, index) => (
                <article key={step} className="rounded-[26px] border border-black/10 bg-white p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="mt-5 text-lg font-extrabold">{step}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-[34px] bg-[#1f1d2b] px-8 py-12 text-white shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:px-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c5beff]">Revenue Policy</p>
                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">파트너 수익 85%</h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/72">
                  홈페이지 생성 자체에는 수수료가 발생하지 않습니다. 방송인 고객에게 최종 납품한 뒤,
                  파트너가 판매 확정을 입력한 건에 대해서만 플랫폼 수수료가 계산됩니다.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white/70">파트너 수익</p>
                    <p className="mt-2 text-2xl font-black">85%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white/70">플랫폼 수수료</p>
                    <p className="mt-2 text-2xl font-black">15%</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white/70">시작 비용</p>
                    <p className="mt-2 text-2xl font-black">월정액 없음</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-3 text-[#c5beff]">
                  <Globe className="h-5 w-5" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em]">Settlement note</p>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-white/75">
                  <li>월정액 없이 시작하고, 실제 판매가 확정된 건만 수수료를 정산합니다.</li>
                  <li>판매금액, 증빙, 메모를 기준으로 파트너 정산 흐름을 관리할 수 있습니다.</li>
                  <li>정산 정책은 운영 설정에 따라 변경될 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4338ca]">FAQ</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">파트너 관점에서 자주 묻는 질문</h2>
            </div>

            <div className="mt-10 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="rounded-[24px] border border-black/10 bg-white p-6">
                  <summary className="cursor-pointer list-none text-lg font-extrabold">{item.question}</summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-[34px] bg-white px-8 py-14 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4338ca]">Start as a partner</p>
            <h2 className="mt-4 text-balance text-4xl font-black tracking-tight sm:text-5xl">
              방송인 고객에게 더 빠르고 더 고급스럽게
              <br />
              PR 홈페이지를 납품하세요
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
              CastFolio는 방송인이 직접 가입하는 서비스가 아니라, 제작 파트너가 결과물을 판매하고
              운영하는 플랫폼입니다. 필요한 간판을 이제 정확한 방향으로 걸어두었습니다.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                파트너로 시작하기
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 rounded-2xl border border-black/10 px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                파트너 운영 가이드 보기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 px-4 py-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>CastFolio</span>
          </div>
          <p>© 2026 CastFolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
