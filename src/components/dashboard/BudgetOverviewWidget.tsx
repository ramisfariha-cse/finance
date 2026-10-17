import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { ActiveTab } from '../layout/Sidebar';

interface BudgetOverviewWidgetProps {
  onNavigateToBudgets: () => void;
}

export const BudgetOverviewWidget: React.FC<BudgetOverviewWidgetProps> = ({
  onNavigateToBudgets,
}) => {
  const { overallBudgetProgress, budgetProgress, profile, spendingForecast } = useFinance();

  const overBudgetCategories = budgetProgress.filter((b) => b.isOverBudget);
  const nearLimitCategories = budgetProgress.filter(
    (b) => !b.isOverBudget && b.percentUsed >= 80
  );

  const percentUsedClamped = Math.min(100, overallBudgetProgress.percentUsed);

  // Status color
  let barColor = 'bg-emerald-500';
  if (overallBudgetProgress.isOverBudget) {
    barColor = 'bg-rose-500';
  } else if (overallBudgetProgress.percentUsed >= 80) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Monthly Budget Guard
            </h2>
            <p className="text-xs text-slate-500">
              October 2026 total envelope limit & pacing
            </p>
          </div>

          <button
            onClick={onNavigateToBudgets}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
          >
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
            <span className="text-slate-600">
              Spent:{' '}
              <strong className="text-slate-900">
                {formatCurrency(overallBudgetProgress.totalSpent, profile.currency)}
              </strong>
            </span>
            <span className="text-slate-600">
              Cap:{' '}
              <strong className="text-slate-900">
                {formatCurrency(overallBudgetProgress.totalLimit, profile.currency)}
              </strong>
            </span>
          </div>

          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${percentUsedClamped}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="font-semibold text-slate-700">
              {overallBudgetProgress.percentUsed.toFixed(1)}% utilized
            </span>
            <span className="text-slate-500">
              {overallBudgetProgress.isOverBudget
                ? `Exceeded by ${formatCurrency(
                    overallBudgetProgress.totalSpent - overallBudgetProgress.totalLimit,
                    profile.currency
                  )}`
                : `${formatCurrency(overallBudgetProgress.remaining, profile.currency)} remaining`}
            </span>
          </div>
        </div>

        {/* Warning Banners if any category exceeded */}
        {overBudgetCategories.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-rose-900">
                {overBudgetCategories.length} Category Over Limit!
              </div>
              <p className="text-rose-700 mt-0.5">
                {overBudgetCategories
                  .map(
                    (b) =>
                      `${b.budget.category} (+${formatCurrency(
                        b.spent - b.budget.monthlyLimit,
                        profile.currency
                      )})`
                  )
                  .join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Run-rate forecast note */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-600 flex items-center justify-between">
          <span>
            Projected Month-End:{' '}
            <strong className="font-mono text-slate-900">
              {formatCurrency(spendingForecast.projectedMonthEndSpend, profile.currency)}
            </strong>
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
              spendingForecast.budgetStatus === 'critical'
                ? 'bg-rose-100 text-rose-800'
                : spendingForecast.budgetStatus === 'warning'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {spendingForecast.budgetStatus === 'critical'
              ? 'Overpace Alert'
              : spendingForecast.budgetStatus === 'warning'
              ? 'Nearing Limit'
              : 'On Track'}
          </span>
        </div>
      </div>
    </div>
  );
};
