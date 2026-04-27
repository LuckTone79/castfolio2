import { Firestore, collection, addDoc } from 'firebase/firestore';
import { getISODateString } from './date';
import { AppRole } from '../types';

interface ActivityParams {
  db: Firestore;
  actorId: string;
  actorRole: AppRole;
  actorEmail: string;
  activityType: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  summary: string;
  meta?: Record<string, unknown>;
}

export const logWorkActivity = async (params: ActivityParams): Promise<void> => {
  try {
    await addDoc(collection(params.db, 'work_activity_logs'), {
      actorId: params.actorId,
      actorRole: params.actorRole,
      actorEmail: params.actorEmail,
      activityType: params.activityType,
      targetType: params.targetType,
      targetId: params.targetId,
      targetLabel: params.targetLabel,
      summary: params.summary,
      meta: params.meta || {},
      createdAt: getISODateString(),
    });
  } catch (error) {
    console.error('Failed to log work activity:', error);
  }
};
