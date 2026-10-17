import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Info, Calculator } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';

export const SpendingForecastWidget: React.FC = () => {
  const { spendingForecast, overallBudgetProgress, profile } = useFinance();

  const isCritical = spendingForecast.budgetStatus === 'critical';
  const isWarning = spendingForecast.budgetStatus === 'warning';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Velocity Run-Rate & Projections
            </h2>
            <p className="text-xs text-slate-500">
              Evidence-based trajectory calculated from daily average spending velocity
            </p>
          </div>
        </div>

        <span
          className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full border ${
            isCritical
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : isWarning
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {isCritical ? 'High Overpace Risk' : isWarning ? 'Approaching Cap' : 'Pacing Within Budget'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Daily Burn Rate */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Average Daily Burn
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(spendingForecast.dailyAverageSpend, profile.currency)} / day
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Computed over 17 elapsed days in October
          </p>
        </div>

        {/* Projected Month End */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Projected Month-End Spend
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {formatCurrency(spendingForecast.projectedMonthEndSpend, profile.currency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {spendingForecast.daysRemainingInMonth} billing days left in cycle
          </p>
        </div>

        {/* Forecasted Run Rate % */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Forecasted Budget Usage
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {spendingForecast.budgetRunRatePercent.toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Against {formatCurrency(overallBudgetProgress.totalLimit, profile.currency)} total cap
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Mathematical Formula:</strong> Projected Total = Current Realized Outflow + (Average Daily Outflow × Remaining Days). Projections adjust dynamically with every logged transaction and never invent speculative data.
        </div>
      </div>
    </div>
  );
};
