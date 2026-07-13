import { redirect } from "next/navigation";

// This page used a different payload shape (careerItems/portfolioUrls/
// contactChannels) than the current /api/public/intake contract
// (basic/about/career/portfolio/strengths/contact) and no longer worked.
// /submit/[token] is the canonical, maintained implementation.
export default function LegacyPublicIntakePage({ params }: { params: { token: string } }) {
  redirect(`/submit/${params.token}`);
}
