import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit, logTimeline } from "@/lib/audit";
import { sendNotification } from "@/lib/notify";

export async function GET() {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotes = await prisma.quote.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      project: { include: { talent: { select: { nameKo: true } } } },
      lineItems: true,
    },
  });

  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try { user = await requireUser(); } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, lineItems, totalAmount, validUntil, message, send } = body;

  if (!projectId || !lineItems?.length || !totalAmount || !validUntil) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다." }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
    include: { talent: true },
  });
  if (!project) return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });

  // Supersede previous active quotes for this project
  await prisma.quote.updateMany({
    where: { projectId, status: { in: ["DRAFT", "SENT"] } },
    data: { status: "SUPERSEDED" },
  });

  const quote = await prisma.quote.create({
    data: {
      projectId,
      userId: user.id,
      totalAmount,
      validUntil: new Date(validUntil),
      message: message || null,
      status: send ? "SENT" : "DRAFT",
      sentAt: send ? new Date() : null,
      pricingSnapshot: body.pricingSnapshot || {},
      lineItems: {
        create: lineItems.map((item: { packageId?: string; description: string; amount: number; quantity?: number }) => ({
          packageId: item.packageId || undefined,
          description: item.description,
          amount: item.amount,
          quantity: item.quantity || 1,
        })),
      },
    },
    include: { lineItems: true },
  });

  await logAudit({ actorId: user.id, actorRole: user.role, action: "CREATE_QUOTE", targetType: "Quote", targetId: quote.id, after: { projectId, totalAmount, status: quote.status } });
  await logTimeline({ projectId, event: "QUOTE_CREATED", description: `견적서 생성됨 (${send ? "발송" : "초안"})`, actorId: user.id, actorName: user.name });

  if (send) {
    if (project.talent.email) {
      // Talent에게 이메일 알림
      await sendNotification({
        userId: user.id,
        type: "quote_sent",
        title: "견적서가 발송되었습니다",
        body: `${project.talent.nameKo}님께 견적서가 발송되었습니다.`,
        link: `/dashboard/quotes/${quote.id}`,
        emailTo: project.talent.email,
      });
    } else {
      // Talent 이메일 없음 → 담당 User에게 proxy 알림 (지침서 규칙 L)
      await sendNotification({
        userId: user.id,
        type: "quote_sent_proxy",
        title: "견적서 발송 — 직접 전달 필요",
        body: `${project.talent.nameKo}님의 이메일이 등록되지 않았습니다. 견적서를 방송인에게 직접 전달해주세요.`,
        link: `/dashboard/quotes/${quote.id}`,
        emailTo: user.email,
      });
    }
  }

  return NextResponse.json(quote, { status: 201 });
}
