import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Sparkles, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default async function ReviewPage({ params }: { params: { token: string } }) {
  const form = await prisma.intakeForm.findFirst({
    where: { token: params.token },
    include: {
      submissions: { orderBy: { createdAt: "desc" }, take: 1 },
      project: { include: { talent: true } },
    },
  });

  if (!form) notFound();

  const submission = form.submissions[0];
  const data = (submission?.data || {}) as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center justify-center gap-2 py-4 border-b border-gray-800">
        <Sparkles size={18} className="text-white" />
        <span className="text-sm font-semibold text-white">Castfolio</span>
      </header>

      <main className="flex-1 p-6 flex justify-center">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck size={18} className="text-gray-400" />
                <h1 className="text-lg font-semibold text-white">제출 내역 확인</h1>
              </div>
              <p className="text-sm text-gray-400">
                {form.project.talent.nameKo}님이 제출하신 자료입니다
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge color={submission ? "green" : "yellow"}>
                  {submission ? "제출 완료" : "미제출"}
                </Badge>
                {submission && (
                  <span className="text-xs text-gray-500">
                    {formatDate(submission.createdAt)}
                  </span>
                )}
              </div>
            </div>

            {submission ? (
              <div className="divide-y divide-gray-800">
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="px-6 py-3">
                    <dt className="text-xs text-gray-500 uppercase mb-1">{key}</dt>
                    <dd className="text-sm text-white whitespace-pre-wrap">
                      {typeof value === "string"
                        ? value
                        : Array.isArray(value)
                        ? (value as unknown[]).map((v, i) => (
                            <div key={i} className="text-sm text-gray-300">
                              {typeof v === "object" ? JSON.stringify(v) : String(v)}
                            </div>
                          ))
                        : JSON.stringify(value, null, 2)}
                    </dd>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 text-sm">
                아직 자료가 제출되지 않았습니다
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-4 text-center border-t border-gray-800">
        <p className="text-xs text-gray-600">Powered by Castfolio</p>
      </footer>
    </div>
  );
}
