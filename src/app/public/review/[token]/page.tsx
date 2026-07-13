import { redirect } from "next/navigation";

// This page was a read-only dump of the raw submission JSON, unrelated to
// the actual approve/request-revision workflow. /review/[token] is the
// canonical, maintained implementation (backed by requireReviewToken +
// POST /api/public/review/[token]).
export default function LegacyPublicReviewPage({ params }: { params: { token: string } }) {
  redirect(`/review/${params.token}`);
}
