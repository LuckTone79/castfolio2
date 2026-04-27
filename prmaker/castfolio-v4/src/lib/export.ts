import * as XLSX from 'xlsx';
import { Sale, Settlement, Talent } from '../types';

export const exportSalesToExcel = (sales: Sale[], talents: Talent[]) => {
  const data = sales.map(sale => {
    const talent = talents.find(t => t.id === sale.talentId);
    return {
      Date: new Date(sale.confirmedAt || sale.createdAt).toLocaleDateString(),
      Talent: talent ? talent.nameKo : 'Unknown',
      Amount: sale.grossAmount,
      Commission: sale.grossAmount * sale.commissionRate,
      Net_Amount: sale.agentPayoutAmount,
      Payment_Method: sale.paymentMethod,
      Payment_Status: sale.paymentStatus,
      Settlement_Status: sale.settlementStatus,
      Notes: sale.notes || '',
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sales');
  XLSX.writeFile(wb, `Sales_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportSettlementsToExcel = (settlements: Settlement[]) => {
  const data = settlements.map(s => ({
    Date: new Date(s.createdAt).toLocaleDateString(),
    Start_Date: s.startDate,
    End_Date: s.endDate,
    Total_Amount: s.totalGrossAmount,
    Total_Commission: s.totalPlatformCommission,
    Payout_Amount: s.totalAgentPayout,
    Status: s.status,
    Sales_Count: s.saleIds.length,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Settlements');
  XLSX.writeFile(wb, `Settlements_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
