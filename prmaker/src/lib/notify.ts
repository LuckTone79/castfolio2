import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/mail";

export async function sendNotification({
  userId,
  type,
  title,
  body,
  link,
  channel = "DASHBOARD",
  emailTo,
  metadata,
}: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  channel?: "DASHBOARD" | "EMAIL";
  emailTo?: string;
  metadata?: object;
}) {
  // Always create dashboard notification
  await prisma.notification.create({
    data: {
      userId,
      channel: "DASHBOARD",
      type,
      title,
      body,
      link,
      metadata: metadata ?? undefined,
    },
  });

  // Send email if requested and email provided
  if ((channel === "EMAIL" || emailTo) && emailTo) {
    await sendNotificationEmail({ to: emailTo, title, body, link });
  }
}

export async function notifyTalent({
  talentId,
  type,
  title,
  body,
  link,
}: {
  talentId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  const talent = await prisma.talent.findUnique({
    where: { id: talentId },
    include: { user: true },
  });
  if (!talent) return;

  if (talent.email) {
    // Direct email to talent
    await sendNotificationEmail({ to: talent.email, title, body, link });
  } else {
    // Proxy notification to talent's user
    const proxyTitle = title;
    const proxyBody = `[방송인 ${talent.nameKo}에게 직접 전달해주세요] ${body}`;
    await sendNotification({
      userId: talent.userId,
      type: `${type}_proxy`,
      title: proxyTitle,
      body: proxyBody,
      link,
      channel: "DASHBOARD",
      emailTo: talent.user.email,
    });
  }
}
