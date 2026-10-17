import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, AccountType } from '../../types/finance';
import { formatCurrency } from '../../data/currencies';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRow {
  date: string;
  type: TransactionType;
  merchant: string;
  category: string;
  account: AccountType;
  amount: number;
  notes?: string;
  isDuplicate: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions, importTransactions, profile } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

  if (!isOpen) return null;

  const existingSignatures = new Set(
    transactions.map((t) => `${t.date}_${t.amount}_${t.merchant.toLowerCase().trim()}`)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCsvText(text);
    };
    reader.readAsText(file);
  };

  const processCsvText = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV file must have a header row and at least one data row.');
      return;
    }

    // Parse header
    const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    const dateIdx = headers.findIndex((h) => h.includes('date'));
    const merchantIdx = headers.findIndex((h) => h.includes('merchant') || h.includes('desc') || h.includes('title') || h.includes('payee'));
    const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('cost') || h.includes('price') || h.includes('total'));
    const categoryIdx = headers.findIndex((h) => h.includes('category') || h.includes('tag'));
    const typeIdx = headers.findIndex((h) => h.includes('type'));
    const accountIdx = headers.findIndex((h) => h.includes('account') || h.includes('method'));

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Split with quotes handling
      const rawCols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const cols = rawCols.map((c) => c.replace(/^["']|["']$/g, '').trim());

      const rawDate = dateIdx >= 0 ? cols[dateIdx] : '';
      const rawMerchant = merchantIdx >= 0 ? cols[merchantIdx] : 'CSV Transaction';
      const rawAmount = amountIdx >= 0 ? cols[amountIdx].replace(/[^0-9.-]/g, '') : '0';
      const rawCategory = categoryIdx >= 0 && cols[categoryIdx] ? cols[categoryIdx] : 'Other';
      const rawType = typeIdx >= 0 && cols[typeIdx].toLowerCase().includes('income') ? 'income' : 'expense';
      const rawAccount = accountIdx >= 0 && cols[accountIdx] ? (cols[accountIdx] as AccountType) : 'Checking';

      const amt = Math.abs(parseFloat(rawAmount)) || 0;
      let hasError = false;
      let errorMessage = '';

      if (amt <= 0) {
        hasError = true;
        errorMessage = 'Invalid or zero amount';
      }

      // Format date if needed
      let formattedDate = rawDate;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        const parsedD = new Date(rawDate);
        if (!isNaN(parsedD.getTime())) {
          formattedDate = parsedD.toISOString().split('T')[0];
        } else {
          hasError = true;
          errorMessage = 'Invalid date format (must be YYYY-MM-DD)';
        }
      }

      // Check duplicate
      const sig = `${formattedDate}_${amt}_${rawMerchant.toLowerCase().trim()}`;
      const isDuplicate = existingSignatures.has(sig);

      rows.push({
        date: formattedDate,
        type: rawType as TransactionType,
        merchant: rawMerchant,
        category: rawCategory,
        account: rawAccount,
        amount: amt,
        isDuplicate,
        hasError,
        errorMessage,
      });
    }

    setParsedRows(rows);
    setStep('preview');
  };

  const handleImport = () => {
    const validRows = parsedRows.filter((r) => !r.hasError);
    const toImport = skipDuplicates ? validRows.filter((r) => !r.isDuplicate) : validRows;

    const result = importTransactions(
      toImport.map((r) => ({
        date: r.date,
        type: r.type,
        merchant: r.merchant,
        category: r.category,
        account: r.account,
        amount: r.amount,
        notes: 'Imported via CSV file',
      })),
      skipDuplicates
    );

    setImportResult(result);
  };

  const resetAll = () => {
    setStep('upload');
    setParsedRows([]);
    setFileName('');
    setImportResult(null);
  };

  const validCount = parsedRows.filter((r) => !r.hasError).length;
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate && !r.hasError).length;
  const errorCount = parsedRows.filter((r) => r.hasError).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Import Transactions from CSV
              </h2>
              <p className="text-xs text-slate-500">
                Automated column detection with duplicate suppression
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {importResult ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Import Completed Successfully</h3>
              <p className="text-xs text-slate-600">
                Imported <strong className="text-slate-900">{importResult.imported}</strong> new
                transactions.{' '}
                {importResult.skipped > 0 && (
                  <span>
                    Skipped <strong className="text-slate-900">{importResult.skipped}</strong> existing
                    duplicate records.
                  </span>
                )}
              </p>
              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 cursor-pointer"
                >
                  Close & View Transactions
                </button>
              </div>
            </div>
          ) : step === 'upload' ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-800">
                  Click to browse or drop your CSV file here
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Expected columns: Date, Merchant/Description, Amount, Category, Type
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">CSV Structure Guide:</div>
                <div className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200">
                  Date,Merchant,Amount,Category,Type,Account
                  <br />
                  2026-10-15,Whole Foods,148.20,Groceries,expense,Credit Card
                  <br />
                  2026-10-16,Acme Corp,4500.00,Salary & Wages,income,Checking
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{parsedRows.length}</span> rows
                  parsed from <span className="font-mono text-slate-600">{fileName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-700 font-semibold">{validCount} Valid</span>
                  {duplicateCount > 0 && (
                    <span className="text-amber-700 font-semibold">{duplicateCount} Duplicates</span>
                  )}
                  {errorCount > 0 && (
                    <span className="text-rose-700 font-semibold">{errorCount} Errors</span>
                  )}
                </div>
              </div>

              {/* Duplicate checkbox */}
              {duplicateCount > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <input
                    type="checkbox"
                    id="skipDups"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                  />
                  <label htmlFor="skipDups" className="cursor-pointer font-medium">
                    Skip {duplicateCount} duplicate transactions that already exist in your records.
                  </label>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Merchant</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.hasError
                            ? 'bg-rose-50 text-rose-900'
                            : row.isDuplicate
                            ? 'bg-amber-50/50 text-amber-900'
                            : 'hover:bg-slate-50'
                        }
                      >
                        <td className="px-3 py-1.5 whitespace-nowrap">{row.date}</td>
                        <td className="px-3 py-1.5 truncate max-w-[140px] font-sans font-medium">
                          {row.merchant}
                        </td>
                        <td className="px-3 py-1.5 font-sans">{row.category}</td>
                        <td className="px-3 py-1.5 text-right font-bold">
                          {formatCurrency(row.amount, profile.currency)}
                        </td>
                        <td className="px-3 py-1.5 whitespace-nowrap font-sans text-[11px]">
                          {row.hasError ? (
                            <span className="text-rose-600 font-bold">{row.errorMessage}</span>
                          ) : row.isDuplicate ? (
                            <span className="text-amber-700 font-medium">Duplicate</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!importResult && step === 'preview' && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={resetAll}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
            >
              Choose different file
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
              >
                Import {skipDuplicates ? validCount - duplicateCount : validCount} Transactions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
