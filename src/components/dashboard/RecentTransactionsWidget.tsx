import React from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight, Plus } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { CategoryIcon } from '../common/CategoryIcon';
import { Transaction } from '../../types/finance';

interface RecentTransactionsWidgetProps {
  onNavigateToTransactions: () => void;
  onOpenAddModal: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const RecentTransactionsWidget: React.FC<RecentTransactionsWidgetProps> = ({
  onNavigateToTransactions,
  onOpenAddModal,
  onSelectTransaction,
}) => {
  const { transactions, profile } = useFinance();

  const recentTxs = transactions.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Transactions
          </h2>
          <p className="text-xs text-slate-500">
            Latest recorded expenditures and credits
          </p>
        </div>

        <button
          onClick={onNavigateToTransactions}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
        >
          View All ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentTxs.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-xs text-slate-500 mb-3">No transactions recorded yet.</p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {recentTxs.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon category={tx.category} size="md" />
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                      {tx.merchant}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="truncate">{tx.category}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                        {tx.account}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-mono font-bold text-xs sm:text-sm flex items-center justify-end gap-1 ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount, profile.currency)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
