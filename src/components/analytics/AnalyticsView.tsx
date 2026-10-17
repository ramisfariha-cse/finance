import React from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Layers,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { CategoryIcon } from '../common/CategoryIcon';
import { SpendingChart } from '../dashboard/SpendingChart';
import { GoogleMarketBenchmarks } from './GoogleMarketBenchmarks';

export const AnalyticsView: React.FC = () => {
  const { filteredTransactions, categorySpending, monthOverMonth, totals, profile } =
    useFinance();

  // Compute top merchants
  const topMerchants = React.useMemo(() => {
    const map: Record<string, { amount: number; count: number; category: string }> = {};
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const m = t.merchant.trim();
        if (!map[m]) map[m] = { amount: 0, count: 0, category: t.category };
        map[m].amount += t.amount;
        map[m].count += 1;
      });

    return Object.entries(map)
      .map(([merchant, data]) => ({
        merchant,
        amount: data.amount,
        count: data.count,
        category: data.category,
        percent: totals.expenses > 0 ? (data.amount / totals.expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [filteredTransactions, totals.expenses]);

  const avgExpenseTx =
    totals.transactionCount > 0 ? totals.expenses / Math.max(1, filteredTransactions.filter(t => t.type === 'expense').length) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Spending Intelligence & Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Deep-dive metrics across categories, counterparties, and fiscal comparisons
            </p>
          </div>
        </div>
      </div>

      {/* Month-over-Month Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outflow Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Monthly Expense Delta
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatCurrency(monthOverMonth.currentMonthExpenses, profile.currency)}
            </span>
            <span
              className={`text-xs font-bold inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
                monthOverMonth.expenseDiffPercent > 0
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {monthOverMonth.expenseDiffPercent > 0 ? '+' : ''}
              {monthOverMonth.expenseDiffPercent.toFixed(1)}% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            vs. {formatCurrency(monthOverMonth.prevMonthExpenses, profile.currency)} in September
          </p>
        </div>

        {/* Inflow Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Monthly Income Delta
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatCurrency(monthOverMonth.currentMonthIncome, profile.currency)}
            </span>
            <span className="text-xs font-bold inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {monthOverMonth.incomeDiffPercent > 0 ? '+' : ''}
              {monthOverMonth.incomeDiffPercent.toFixed(1)}% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            vs. {formatCurrency(monthOverMonth.prevMonthIncome, profile.currency)} in September
          </p>
        </div>

        {/* Average Transaction Ticket */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Expense Ticket
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {formatCurrency(avgExpenseTx, profile.currency)}
            </span>
            <span className="text-xs text-slate-400 font-mono">per purchase</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Calculated across {filteredTransactions.filter(t => t.type === 'expense').length} expense transactions
          </p>
        </div>
      </div>

      {/* Cash Flow Visual Chart */}
      <SpendingChart />

      {/* Google Macroeconomic Intelligence & Market Benchmarks */}
      <GoogleMarketBenchmarks />

      {/* Category Breakdown & Top Merchants 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full Category Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Category Spending Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Detailed proportional analysis for active time window
              </p>
            </div>
            <span className="text-xs font-semibold font-mono text-slate-600">
              {Object.keys(categorySpending).length} Categories
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Share %</th>
                  <th className="py-2.5 px-3 text-right">Count</th>
                  <th className="py-2.5 px-3 text-right">Avg / Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {Object.entries(categorySpending)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .map(([category, data]) => {
                    const avg = data.count > 0 ? data.amount / data.count : 0;
                    return (
                      <tr key={category} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-900 flex items-center gap-2">
                          <CategoryIcon category={category} size="sm" />
                          <span>{category}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(data.amount, profile.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {data.percentage.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {data.count}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {formatCurrency(avg, profile.currency)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Counterparties / Merchants */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Top Payees & Merchants
                </h3>
                <p className="text-xs text-slate-500">
                  Counterparties absorbing the largest share of expenditures
                </p>
              </div>
              <Store className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {topMerchants.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[11px] font-mono text-slate-400 w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">
                        {item.merchant}
                      </span>
                    </div>

                    <div className="font-mono font-bold text-slate-900 text-right">
                      {formatCurrency(item.amount, profile.currency)}
                    </div>
                  </div>

                  {/* Progress proportion */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-800 rounded-full"
                      style={{ width: `${Math.min(100, item.percent * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
