import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileInput,
  HelpCircle,
  Eye,
  Sparkles,
  Send,
} from "lucide-react";

export default function ClientLandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#faf8f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/client" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">
              C
            </div>
            <span className="text-base font-black tracking-tight">CastFolio</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white"
            >
              <ArrowLeft className="h-3 w-3" />
              Partner Site
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ─── Hero ─── */}
        <section className="px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              <Sparkles className="h-4 w-4" />
              방송인 PR 홈페이지 전문 제작
            </div>

            <h1 className="text-balance text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              당신만의
              <br />
              <span className="text-emerald-600">PR 홈페이지</span>를
              <br />
              전문가가 만들어드립니다
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-slate-500 sm:text-lg">
              아나운서, 쇼호스트, MC, 리포터를 위한 전문 PR 홈페이지.
              <br />
              자료만 제출하시면 전문 제작자가 완성해드립니다.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                직접 만들어보기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/p/demo"
                className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                데모 페이지 보기
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Token Access ─── */}
        <section className="border-t border-black/5 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-xl">
            <div className="rounded-[28px] border border-emerald-200 bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.04)]">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                  <FileInput className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-black">자료 제출 링크를 받으셨나요?</h2>
                <p className="mt-2 text-sm text-slate-500">
                  제작 파트너로부터 받은 링크를 통해 자료를 제출할 수 있습니다
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="#"
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-slate-50 px-5 py-4 text-sm font-semibold transition hover:bg-slate-100"
                >
                  <span className="flex items-center gap-3">
                    <Send className="h-4 w-4 text-emerald-600" />
                    자료 제출하기
                  </span>
                  <span className="text-xs text-slate-400">
                    /submit/[토큰] 링크 필요
                  </span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-slate-50 px-5 py-4 text-sm font-semibold transition hover:bg-slate-100"
                >
                  <span className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-blue-500" />
                    완성본 검토하기
                  </span>
                  <span className="text-xs text-slate-400">
                    /review/[토큰] 링크 필요
                  </span>
                </a>
              </div>

              <p className="mt-5 text-center text-xs text-slate-400">
                링크가 없으신 경우 담당 제작 파트너에게 문의해주세요
              </p>
            </div>
          </div>
        </section>

        {/* ─── Who is this for ─── */}
        <section className="border-t border-black/5 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-black sm:text-3xl">이런 분들을 위한 서비스</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { emoji: "🎤", title: "아나운서", desc: "방송사 PD에게 제출할 전문 프로필" },
                { emoji: "🛍️", title: "쇼호스트", desc: "라이브커머스 이력과 성과 어필" },
                { emoji: "🎙️", title: "MC / 진행자", desc: "행사 기획사에 보낼 포트폴리오" },
                { emoji: "📺", title: "리포터", desc: "방송 출연 이력과 영상 모음" },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-black/10 bg-white p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                >
                  <div className="mb-3 text-3xl">{item.emoji}</div>
                  <h3 className="text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── How it works ─── */}
        <section className="border-t border-black/5 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center text-2xl font-black sm:text-3xl">제작 과정</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "1", title: "자료 제출", desc: "링크를 통해 사진, 경력, 영상 등을 제출" },
                { step: "2", title: "전문가 제작", desc: "디자인 전문가가 PR 홈페이지 제작" },
                { step: "3", title: "검토 / 수정", desc: "완성본을 확인하고 수정 요청" },
                { step: "4", title: "최종 납품", desc: "공개 URL + QR 코드로 납품 완료" },
              ].map((item) => (
                <article key={item.step} className="rounded-2xl border border-black/10 bg-white p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">
                    {item.step}
                  </div>
                  <h3 className="text-base font-black">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="border-t border-black/5 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl font-black">자주 묻는 질문</h2>
            </div>
            <div className="space-y-3">
              {[
                { q: "비용은 얼마인가요?", a: "제작 비용은 담당 파트너에 따라 다릅니다. 파트너에게 직접 문의해주세요." },
                { q: "수정은 몇 번까지 가능한가요?", a: "검토 링크를 통해 수정 요청을 보낼 수 있으며, 수정 횟수는 파트너와 협의에 따릅니다." },
                { q: "제작 기간은 얼마나 걸리나요?", a: "자료 제출 후 보통 3~5일 내에 첫 번째 시안을 받아보실 수 있습니다." },
                { q: "로그인이 필요한가요?", a: "아닙니다. 파트너가 보내드린 전용 링크로 로그인 없이 자료 제출과 검토가 가능합니다." },
                { q: "완성된 홈페이지는 어떻게 활용하나요?", a: "고유 URL과 QR 코드가 제공됩니다. 방송사 PD, 에이전시, 행사 담당자에게 바로 공유할 수 있습니다." },
              ].map((item) => (
                <details key={item.q} className="rounded-2xl border border-black/10 bg-white p-5">
                  <summary className="cursor-pointer list-none text-sm font-extrabold">{item.q}</summary>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="border-t border-black/5 px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-2xl rounded-[28px] bg-emerald-600 px-8 py-12 text-center text-white">
            <h2 className="text-2xl font-black sm:text-3xl">지금 바로 체험해보세요</h2>
            <p className="mt-3 text-sm text-emerald-100">셀프 서비스 빌더로 PR 홈페이지를 직접 만들어볼 수 있습니다</p>
            <Link
              href="/create"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-black/5 px-4 py-8 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-xs text-slate-400 sm:flex-row">
          <span>CastFolio</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="transition hover:text-slate-600">
              제작 파트너이신가요?
            </Link>
            <span>|</span>
            <span>&copy; 2026 CastFolio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
