import { NotFoundPage } from "@/components/common/not-found-page";
import { TalentReviewEntry } from "@/components/public/talent-review-entry";
import { prisma } from "@/lib/prisma";

interface Props {
  params: { token: string };
}

export default async function ReviewTokenPage({ params }: Props) {
  const form = await prisma.intakeForm.findFirst({
    where: { token: params.token },
    include: {
      project: {
        include: {
          talent: true,
          page: true,
        },
      },
    },
  });

  if (!form) {
    return (
      <NotFoundPage
        title="검토 링크를 찾을 수 없습니다."
        description="주소가 잘못되었거나 더 이상 사용할 수 없는 검토 링크입니다."
      />
    );
  }

  const previewHref =
    form.project.page && form.project.page.status === "PUBLISHED" ? `/p/${form.project.page.slug}` : null;

  return <TalentReviewEntry talentName={form.project.talent.nameKo} previewHref={previewHref} />;
}
