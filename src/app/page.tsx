import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Globe,
  Layers3,
  MonitorSmartphone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    icon: MonitorSmartphone,
    title: "압도적인 첫인상",
    description:
      "방송/행사/기업 소개에 바로 사용할 수 있는 전문형 PR 랜딩으로 첫 화면에서 신뢰를 만듭니다.",
  },
  {
    icon: Layers3,
    title: "전문 테마 시스템",
    description:
      "직무 성격에 맞는 테마를 선택하고 빌더에서 바로 편집해 완성도 높은 결과물을 빠르게 만듭니다.",
  },
  {
    icon: Globe,
    title: "즉시 배포 + 도메인 연결",
    description:
      "배포 링크와 커스텀 도메인을 바로 연결해 공유부터 운영까지 한 흐름으로 처리합니다.",
  },
];

const THEME_CARDS = [
  {
    name: "DIVA THEME",
    highlights: ["풀스크린 비주얼 임팩트", "트렌디한 그라데이션 포인트", "다이내믹한 스크롤 애니메이션"],
  },
  {
    name: "OFFICE THEME",
    highlights: ["그리드 기반의 정갈한 레이아웃", "프리미엄 골드/블랙 컬러 무드", "텍스트 중심의 가독성 극대화"],
  },
  {
    name: "ARTISTIC THEME",
    highlights: ["유니크한 오버랩 요소", "비정형 아트 레이아웃", "모던한 타이포그래피 시스템"],
  },
  {
    name: "MINIMAL THEME",
    highlights: ["세련된 정보 집중형 구성", "브랜드 메시지 전달력 강화", "반응형 최적화"],
  },
];

const PROCESS_STEPS = [
  { title: "방송인 등록", description: "대상 방송인/팀을 등록하고 프로젝트를 생성합니다." },
  { title: "자료 수집", description: "링크로 자료를 수집하고 필요한 항목을 정리합니다." },
  { title: "빌더 편집", description: "테마/섹션/콘텐츠를 실시간으로 편집해 완성도를 높입니다." },
  { title: "검수 및 배포", description: "최종 검수 후 즉시 배포하고 공유 링크를 전달합니다." },
];

const FAQ_ITEMS = [
  {
    q: "홈페이지 제작 기간은 얼마나 걸리나요?",
    a: "자료가 준비되어 있으면 평균 10분 내외로 기본 페이지를 완성하고 바로 배포할 수 있습니다.",
  },
  {
    q: "수정은 몇 번까지 가능한가요?",
    a: "요금제 정책에 따라 다르지만 기본적으로 빌더에서 반복 수정이 가능하며 변경 이력 관리도 지원합니다.",
  },
  {
    q: "로그인 후 어떤 기능을 사용할 수 있나요?",
    a: "사용자/관리자 대시보드, 방송인 관리, 가격 플랜, 주문/정산, 감사 로그까지 전체 운영 기능을 사용할 수 있습니다.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#f4f5f7]/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-xl font-bold text-white">
              C
            </div>
            <p className="text-3xl font-black tracking-tight">CastFolio</p>
          </div>

          <div className="hidden items-center gap-8 lg:flex">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              기능
            </a>
            <a href="#themes" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              테마
            </a>
            <a href="#process" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              제작 과정
            </a>
            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-2xl border border-black/10 bg-white/70 p-1.5 sm:flex">
              {["한", "日", "中", "VN", "EN"].map((lang, idx) => (
                <button
                  key={lang}
                  type="button"
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                    idx === 0 ? "bg-black text-white" : "text-slate-500"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-black px-5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              에이전트 로그인
            </Link>
            <Link
              href="/login?redirect=/admin"
              className="hidden h-12 items-center rounded-2xl border border-black/15 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white sm:inline-flex"
            >
              관리자
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full bg-[#625fff1a] px-4 py-2 text-sm font-semibold text-[#5048ea]">
              <Sparkles className="h-4 w-4" />
              방송인을 위한 AI 기반 PR 빌더
            </div>

            <h1 className="text-balance text-5xl font-black leading-tight tracking-tight sm:text-7xl">
              완벽한 PR 페이지를
              <br />
              <span className="text-[#5b57ff]">만드세요.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-pretty text-xl leading-relaxed text-slate-600">
              방송인 지망생부터 현업 전문가까지, 포트폴리오·소개·문의 동선을 하나로 묶은 전문 PR 홈페이지를
              빠르게 구축하세요.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                지금 바로 시작하기 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-2xl border border-black/15 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
              >
                실제 구조 미리보기
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="rounded-2xl border border-black/10 bg-white px-4 py-2 font-semibold text-slate-700">
                500+ 명의 전문가가 선택
              </span>
              <span className="rounded-2xl border border-black/10 bg-white px-4 py-2 font-semibold text-slate-700">
                7개 이상의 전문 테마
              </span>
              <span className="rounded-2xl border border-black/10 bg-white px-4 py-2 font-semibold text-slate-700">
                즉시 배포 가능
              </span>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5b57ff]">Why CastFolio</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">왜 CastFolio인가요?</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {FEATURE_CARDS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-[#625fff1a] p-3 text-[#5b57ff]">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-extrabold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="themes" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5b57ff]">Theme System</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">전문성을 극대화하는 4가지 테마</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {THEME_CARDS.map((theme) => (
                <article
                  key={theme.name}
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                  <h3 className="text-xl font-black text-[#5b57ff]">{theme.name}</h3>
                  <ul className="mt-4 space-y-2">
                    {theme.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <BadgeCheck className="h-4 w-4 text-[#5b57ff]" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5b57ff]">Workflow</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">완료까지 한 흐름으로</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {PROCESS_STEPS.map((step, index) => (
                <article
                  key={step.title}
                  className="flex gap-4 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold">{step.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5b57ff]">Support</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">자주 묻는 질문</h2>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details key={item.q} className="rounded-2xl border border-black/10 bg-white p-5">
                  <summary className="cursor-pointer list-none text-base font-extrabold">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/5 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl rounded-[32px] bg-black px-8 py-14 text-center text-white sm:px-14">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">Launch Ready</p>
            <h2 className="mt-4 text-balance text-4xl font-black leading-tight sm:text-5xl">
              당신의 가치를
              <br />
              새롭게 정의하세요.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-white/70">
              PR 페이지 제작부터 운영 대시보드, 결제/정산 흐름까지 한 번에 연결해 팀의 생산성과 완성도를 동시에
              높입니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#5b57ff] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#4d49eb]"
              >
                <Rocket className="h-4 w-4" />
                제작 시작
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <Users className="h-4 w-4" />
                대시보드 이동
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

