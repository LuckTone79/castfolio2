import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Sale, PlatformLedger, Settlement } from '../types';
import { getISODateString } from './date';

/**
 * ledger 기반 정산 생성
 * accrued 상태의 ledger를 묶어서 settlement을 생성하고
 * ledger status를 pending_payout로, sale의 settlementStatus를 settled로 변경
 */
export const generateSettlement = async (agentId: string, startDate: string, endDate: string): Promise<void> => {
  const ledgerRef = collection(db, 'platform_ledger');
  const q = query(
    ledgerRef,
    where('agentId', '==', agentId),
    where('status', '==', 'accrued')
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error('정산 대기 중인 매출이 없습니다.');
  }

  const ledgers: PlatformLedger[] = [];
  snapshot.forEach(d => {
    ledgers.push({ id: d.id, ...d.data() } as PlatformLedger);
  });

  const totalGross = ledgers.reduce((sum, l) => sum + l.grossAmount, 0);
  const totalCommission = ledgers.reduce((sum, l) => sum + l.platformCommissionAmount, 0);
  const totalPayout = ledgers.reduce((sum, l) => sum + l.agentPayoutAmount, 0);
  const saleIds = ledgers.map(l => l.saleId);
  const ledgerIds = ledgers.map(l => l.id);

  const batch = writeBatch(db);
  const now = getISODateString();

  // Settlement 생성
  const settlementRef = doc(collection(db, 'settlements'));
  batch.set(settlementRef, {
    agentId,
    startDate,
    endDate,
    totalGrossAmount: totalGross,
    totalPlatformCommission: totalCommission,
    totalAgentPayout: totalPayout,
    status: 'pending',
    saleIds,
    ledgerIds,
    createdAt: now,
    updatedAt: now,
  });

  // Ledger status → pending_payout
  ledgers.forEach(ledger => {
    batch.update(doc(db, 'platform_ledger', ledger.id), {
      status: 'pending_payout',
      updatedAt: now,
    });
  });

  // Sale settlementStatus → settled
  saleIds.forEach(saleId => {
    batch.update(doc(db, 'sales', saleId), {
      settlementStatus: 'settled',
      settledAt: now,
      updatedAt: now,
    });
  });

  await batch.commit();
};

/**
 * Sale 확정 시 platform_ledger 생성
 */
export const createPlatformLedger = async (
  saleId: string,
  agentId: string,
  ownerId: string,
  grossAmount: number,
  commissionRate: number,
  platformCommissionAmount: number,
  agentPayoutAmount: number
): Promise<string> => {
  const now = getISODateString();
  const ledgerRef = doc(collection(db, 'platform_ledger'));

  const batch = writeBatch(db);
  batch.set(ledgerRef, {
    saleId,
    agentId,
    ownerId,
    grossAmount,
    commissionRate,
    platformCommissionAmount,
    agentPayoutAmount,
    status: 'accrued',
    createdAt: now,
    updatedAt: now,
  });
  await batch.commit();

  return ledgerRef.id;
};
