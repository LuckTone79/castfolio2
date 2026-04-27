import { NextResponse } from "next/server";
import { requireQuoteToken } from "@/lib/tokens";

export async function GET(_: Request, { params }: { params: { token: string } }) {
  try {
    const quote = await requireQuoteToken(params.token);
    return NextResponse.json({
      id: quote.id,
      status: quote.status,
      totalAmount: quote.totalAmount,
      validUntil: quote.validUntil,
      sentAt: quote.sentAt,
      message: quote.message,
      lineItems: quote.lineItems.map(item => ({
        description: item.description,
        amount: item.amount,
        quantity: item.quantity,
      })),
      talent: {
        nameKo: quote.project.talent.nameKo,
      },
      user: {
        name: quote.user.name,
        email: quote.user.email,
        phone: quote.user.phone,
        brandLogoUrl: quote.user.brandLogoUrl,
        brandColor: quote.user.brandColor,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    if (message === "TOKEN_EXPIRED") return NextResponse.json({ error: "EXPIRED" }, { status: 410 });
    return NextResponse.json({ error: "INVALID" }, { status: 404 });
  }
}
