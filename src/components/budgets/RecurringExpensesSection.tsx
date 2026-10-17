import React from 'react';
import { Repeat, Calendar, Check, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { CategoryIcon } from '../common/CategoryIcon';

export const RecurringExpensesSection: React.FC = () => {
  const { recurringExpenses, profile } = useFinance();

  const totalMonthlyCommitment = recurringExpenses.reduce(
    (acc, r) => acc + r.typicalAmount,
    0
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Repeat className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Detected Recurring Commitments
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Subscriptions, utilities, and leases identified by mathematical frequency
          </p>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-slate-400">
            Total Monthly Fixed Cost
          </div>
          <div className="text-base font-bold font-mono text-purple-900">
            {formatCurrency(totalMonthlyCommitment, profile.currency)} / mo
          </div>
        </div>
      </div>

      {recurringExpenses.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
          No recurring patterns detected yet. Log repeat transactions to identify subscriptions.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recurringExpenses.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CategoryIcon category={item.category} size="sm" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 text-xs truncate">
                    {item.merchant}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>{item.frequency}</span>
                    <span>•</span>
                    <span className="truncate">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-xs text-slate-900">
                  {formatCurrency(item.typicalAmount, profile.currency)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {item.count} logged
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
