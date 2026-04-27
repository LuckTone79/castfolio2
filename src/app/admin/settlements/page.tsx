"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Badge } from "@/components/ui";
import { Banknote, Play } from "lucide-react";

export default function SettlementsPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");

  const runSettlement = async () => {
    setRunning(true);
    setResult("");
    try {
      const res = await fetch("/api/settlements/run", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult(`정산 완료: ${data.batchesCreated || 0}건의 배치가 생성되었습니다.`);
      } else {
        setResult(`오류: ${data.error || "정산 실행 실패"}`);
      }
    } catch {
      setResult("네트워크 오류");
    }
    setRunning(false);
  };

  return (
    <>
      <PageHeader
        title="정산 관리"
        description="월간 정산 배치를 관리합니다"
        actions={
          <Button onClick={runSettlement} loading={running}>
            <Play size={14} /> 정산 실행
          </Button>
        }
      />

      {result && (
        <div className={`rounded-lg px-4 py-3 mb-6 text-sm ${result.startsWith("오류") ? "bg-red-900/20 text-red-400 border border-red-800" : "bg-emerald-900/20 text-emerald-400 border border-emerald-800"}`}>
          {result}
        </div>
      )}

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center text-gray-500 text-sm">
        <Banknote size={32} className="mx-auto mb-4 text-gray-600" />
        정산 배치 목록은 API 연동 후 표시됩니다.<br />
        정산 실행 버튼을 클릭하면 전월 미정산 커미션을 집계합니다.
      </div>
    </>
  );
}
