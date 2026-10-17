import React from 'react';
import { Download } from 'lucide-react';
import { Transaction } from '../../types/finance';

interface CsvExportButtonProps {
  transactions: Transaction[];
  filename?: string;
}

export const CsvExportButton: React.FC<CsvExportButtonProps> = ({
  transactions,
  filename = 'clearspend_transactions.csv',
}) => {
  const handleExport = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Merchant', 'Category', 'Account', 'Amount', 'Notes', 'Recurring'];
    const rows = transactions.map((t) => [
      `"${t.date}"`,
      `"${t.type}"`,
      `"${(t.merchant || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${t.account || ''}"`,
      t.amount.toFixed(2),
      `"${(t.notes || '').replace(/"/g, '""')}"`,
      t.isRecurring ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={transactions.length === 0}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
    >
      <Download className="w-3.5 h-3.5 text-slate-500" />
      <span>Export CSV ({transactions.length})</span>
    </button>
  );
};
