import React, { useState } from 'react';
import { Plus, Upload, Filter, Receipt, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { Transaction } from '../../types/finance';
import { TransactionTable } from './TransactionTable';
import { TransactionFilters } from './TransactionFilters';
import { TransactionModal } from './TransactionModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { CsvImportModal } from './CsvImportModal';
import { CsvExportButton } from './CsvExportButton';

export const TransactionsView: React.FC = () => {
  const { filteredTransactions, totals, profile, deleteTransaction } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Transaction Registry
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{filteredTransactions.length} recorded entries</span>
              <span>•</span>
              <span className="font-mono text-emerald-600 font-semibold">
                +{formatCurrency(totals.income, profile.currency)}
              </span>
              <span>•</span>
              <span className="font-mono text-rose-600 font-semibold">
                -{formatCurrency(totals.expenses, profile.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <CsvExportButton transactions={filteredTransactions} />

          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <TransactionFilters />

      {/* Transactions Table */}
      <TransactionTable
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={(tx) => setDeletingTransaction(tx)}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editTransaction={editingTransaction}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        transaction={deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={(id) => deleteTransaction(id)}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />
    </div>
  );
};
