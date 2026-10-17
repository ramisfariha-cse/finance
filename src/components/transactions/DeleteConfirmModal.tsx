import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Transaction } from '../../types/finance';
import { formatCurrency } from '../../data/currencies';
import { useFinance } from '../../context/FinanceContext';

interface DeleteConfirmModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { profile } = useFinance();

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-rose-600 font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            Confirm Deletion
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete this transaction record? This action will permanently remove it and recalculate your net balance and budget metrics.
          </p>

          <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Merchant / Title:</span>
              <span className="font-semibold text-slate-900">{transaction.merchant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(transaction.amount, profile.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-medium text-slate-700">{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-medium text-slate-700">{transaction.category}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(transaction.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-600/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Transaction
          </button>
        </div>
      </div>
    </div>
  );
};
