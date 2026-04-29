import { PageHeader } from "@/components/layout/page-header";
import { IntakeSubmissionList } from "@/components/app/intake-submission-list";

export default function AppIntakePage() {
  return (
    <>
      <PageHeader
        title="자료 수집 관리"
        description="방송인 고객에게 보낸 자료 요청 링크와 제출된 자료를 확인하고, PR 홈페이지 빌더로 불러올 수 있습니다."
      />
      <IntakeSubmissionList />
    </>
  );
}
