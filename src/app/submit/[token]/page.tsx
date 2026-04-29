import { NotFoundPage } from "@/components/common/not-found-page";
import { TalentIntakeEntry } from "@/components/public/talent-intake-entry";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { token: string };
}

export default async function SubmitTokenPage({ params }: Props) {
  const form = await prisma.intakeForm.findFirst({
    where: { token: params.token },
    include: { project: { include: { talent: true } } },
  });

  if (!form) {
    return (
      <NotFoundPage
        title="자료 제출 링크를 찾을 수 없습니다."
        description="주소가 잘못되었거나 더 이상 사용할 수 없는 자료 제출 링크입니다."
      />
    );
  }

  return <TalentIntakeEntry token={params.token} />;
}
