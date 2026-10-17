import React from 'react';
import { Edit3, Trash2, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Budget } from '../../types/finance';
import { formatCurrency } from '../../data/currencies';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../common/CategoryIcon';

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  spent,
  remaining,
  percentUsed,
  isOverBudget,
  onEdit,
  onDelete,
}) => {
  const { profile } = useFinance();

  const isWarning = !isOverBudget && percentUsed >= 80;
  const clampedPercent = Math.min(100, percentUsed);

  let barBg = 'bg-emerald-500';
  let badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = 'Under Budget';

  if (isOverBudget) {
    barBg = 'bg-rose-500';
    badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
    statusText = 'Limit Exceeded';
  } else if (isWarning) {
    barBg = 'bg-amber-500';
    badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'Caution (80%+)';
  }

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all ${
        isOverBudget ? 'border-rose-200 shadow-sm' : 'border-slate-200/90 shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <CategoryIcon category={budget.category} size="md" />
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{budget.category}</h3>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${badgeClass}`}
            >
              {isOverBudget ? (
                <AlertCircle className="w-3 h-3" />
              ) : isWarning ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <CheckCircle2 className="w-3 h-3" />
              )}
              {statusText}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            title="Edit limit"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            title="Delete budget"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Numerical Stats */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-xs mb-1.5 font-mono">
          <span className="text-slate-600">
            Spent:{' '}
            <strong className="text-slate-900 text-sm">
              {formatCurrency(spent, profile.currency)}
            </strong>
          </span>
          <span className="text-slate-400 text-[11px]">
            of {formatCurrency(budget.monthlyLimit, profile.currency)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barBg}`}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px]">
          <span className="font-semibold text-slate-700">{percentUsed.toFixed(0)}% used</span>
          <span className={isOverBudget ? 'text-rose-600 font-bold' : 'text-slate-500'}>
            {isOverBudget
              ? `Over by ${formatCurrency(spent - budget.monthlyLimit, profile.currency)}`
              : `${formatCurrency(remaining, profile.currency)} available`}
          </span>
        </div>
      </div>
    </div>
  );
};
