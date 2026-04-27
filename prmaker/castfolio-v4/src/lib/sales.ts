import { UserProfile } from '../types';
import { DEFAULT_COMMISSION_RATE } from '../config';

/** userProfile에서 수수료율을 가져오거나, 없으면 기본 15% */
export const getCommissionRate = (userProfile: UserProfile | null): number => {
  if (userProfile && typeof userProfile.commissionRate === 'number' && userProfile.commissionRate >= 0 && userProfile.commissionRate <= 1) {
    return userProfile.commissionRate;
  }
  return DEFAULT_COMMISSION_RATE;
};

/** 플랫폼 수수료 계산 (grossAmount * rate, 원 단위 반올림) */
export const calculatePlatformCommission = (grossAmount: number, rate: number): number => {
  return Math.round(grossAmount * rate);
};

/** agent 정산금 계산 (grossAmount - commission) */
export const calculateAgentPayout = (grossAmount: number, commission: number): number => {
  return grossAmount - commission;
};

/** 기존 호환: normalizeCommissionRate */
export const normalizeCommissionRate = (userRate: number | undefined, defaultRate: number): number => {
  if (typeof userRate === 'number' && userRate >= 0 && userRate <= 1) {
    return userRate;
  }
  return defaultRate;
};

/** 기존 호환: calculateCommission (기존 코드에서 사용) */
export const calculateCommission = (amount: number, rate: number): number => {
  return Math.round(amount * rate);
};

/** 기존 호환: calculateNetAmount */
export const calculateNetAmount = (amount: number, commission: number): number => {
  return amount - commission;
};

/** 할인율 계산 */
export const calculateDiscountPercent = (basePrice: number, salePrice: number): number => {
  if (basePrice <= 0) return 0;
  return Math.round(((basePrice - salePrice) / basePrice) * 100);
};

/** 가격 포맷 (KRW) */
export const formatKRW = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};
