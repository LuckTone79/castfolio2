import { Firestore, collection, addDoc } from 'firebase/firestore';
import { getISODateString } from './date';

interface AuditEventParams {
  db: Firestore;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  meta?: Record<string, unknown>;
}

export const logAuditEvent = async (params: AuditEventParams): Promise<void> => {
  try {
    const { db, actorId, actorEmail, action, targetType, targetId, targetLabel, meta } = params;
    await addDoc(collection(db, 'audit_logs'), {
      actorId,
      actorEmail,
      action,
      targetType,
      targetId,
      targetLabel,
      meta: meta || {},
      createdAt: getISODateString(),
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};
