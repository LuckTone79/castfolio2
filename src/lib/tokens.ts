import { prisma } from "@/lib/prisma";

export async function requireIntakeToken(token: string) {
  const form = await prisma.intakeForm.findUnique({
    where: { token },
    include: { talent: true, project: { include: { user: true } } },
  });
  if (!form) throw new Error("TOKEN_INVALID");
  if (form.expiresAt && form.expiresAt < new Date()) throw new Error("TOKEN_EXPIRED");
  return form;
}

export async function requireReviewToken(token: string) {
  const form = await prisma.intakeForm.findUnique({
    where: { token },
    include: {
      submissions: { orderBy: { createdAt: "desc" }, take: 1 },
      talent: true,
      project: { include: { user: true } },
    },
  });
  if (!form) throw new Error("TOKEN_INVALID");
  if (form.expiresAt && form.expiresAt < new Date()) throw new Error("TOKEN_EXPIRED");
  return form;
}

export async function requireQuoteToken(token: string) {
  const quote = await prisma.quote.findUnique({
    where: { token },
    include: {
      project: { include: { talent: true } },
      user: true,
      lineItems: { include: { package: true } },
    },
  });
  if (!quote) throw new Error("TOKEN_INVALID");
  if (quote.status === "EXPIRED") throw new Error("TOKEN_EXPIRED");
  if (quote.validUntil < new Date() && quote.status === "SENT") {
    await prisma.quote.update({ where: { id: quote.id }, data: { status: "EXPIRED" } });
    throw new Error("TOKEN_EXPIRED");
  }
  return quote;
}

export async function requireDeliveredToken(token: string) {
  const order = await prisma.order.findFirst({
    where: {
      project: {
        page: { previewToken: token },
      },
      status: { in: ["DELIVERED", "SETTLED"] },
    },
    include: {
      project: {
        include: {
          talent: true,
          page: true,
        },
      },
      user: true,
    },
  });
  if (!order) throw new Error("TOKEN_INVALID");
  return order;
}

export async function verifyPreviewToken(token: string) {
  const page = await prisma.page.findUnique({
    where: { previewToken: token },
    include: {
      project: { include: { talent: true } },
    },
  });
  if (!page) throw new Error("TOKEN_INVALID");
  if (page.status !== "PREVIEW") throw new Error("NOT_PREVIEW");
  return page;
}
