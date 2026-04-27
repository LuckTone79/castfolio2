import { prisma } from "@/lib/prisma";

export async function logAudit({
  actorId,
  actorRole,
  action,
  targetType,
  targetId,
  before,
  after,
  reason,
  ipAddress,
}: {
  actorId: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: object;
  after?: object;
  reason?: string;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      actorId,
      actorRole,
      action,
      targetType,
      targetId,
      before: before ?? undefined,
      after: after ?? undefined,
      reason,
      ipAddress,
    },
  });
}

export async function logTimeline({
  projectId,
  event,
  description,
  actorId,
  actorName,
  metadata,
}: {
  projectId: string;
  event: string;
  description: string;
  actorId?: string;
  actorName?: string;
  metadata?: object;
}) {
  return prisma.projectTimeline.create({
    data: {
      projectId,
      event,
      description,
      actorId,
      actorName,
      metadata: metadata ?? undefined,
    },
  });
}
