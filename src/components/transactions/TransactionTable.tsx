import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Edit3,
  Trash2,
  Repeat,
  Inbox,
} from 'lucide-react';
import { Transaction } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { CategoryIcon } from '../common/CategoryIcon';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  onOpenAddModal: () => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const { profile } = useFinance();

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No Transactions Found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No records match your active search or date filters. Adjust your filters or record a new transaction.
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
        >
          Add Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Desktop & Tablet Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Transaction / Merchant</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Merchant & Notes */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={tx.category} size="md" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="truncate">{tx.merchant}</span>
                          {tx.isRecurring && (
                            <span
                              title="Recurring commitment"
                              className="text-purple-600 shrink-0"
                            >
                              <Repeat className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {tx.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {tx.category}
                    </span>
                  </td>

                  {/* Account */}
                  <td className="py-3 px-4">
                    <span className="text-slate-600 font-medium">
                      {tx.account}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {tx.date}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right">
                    <div
                      className={`font-mono font-bold text-sm inline-flex items-center gap-0.5 ${
                        isIncome
                          ? 'text-emerald-600'
                          : isTransfer
                          ? 'text-blue-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : isTransfer ? null : (
                        <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>
                        {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}
                        {formatCurrency(tx.amount, profile.currency)}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onEdit(tx)}
                        title="Edit transaction"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(tx)}
                        title="Delete transaction"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="sm:hidden divide-y divide-slate-100">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';

          return (
            <div key={tx.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <CategoryIcon category={tx.category} size="sm" />
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">
                      {tx.merchant}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {tx.date} • {tx.account}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-mono font-bold text-xs ${
                    isIncome ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(tx.amount, profile.currency)}
                </div>
              </div>

              {tx.notes && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                  {tx.notes}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {tx.category}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(tx)}
                    className="p-1 text-slate-500 hover:text-slate-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(tx)}
                    className="p-1 text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
