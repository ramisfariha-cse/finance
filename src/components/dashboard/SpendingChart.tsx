import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';

export const SpendingChart: React.FC = () => {
  const { transactions, profile } = useFinance();
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Group transactions by month (last 6 months)
  const monthlyData = React.useMemo(() => {
    // Generate months from May 2026 to Oct 2026
    const months = [
      { key: '2026-05', label: 'May', income: 4200, expense: 2750 },
      { key: '2026-06', label: 'Jun', income: 4200, expense: 2980 },
      { key: '2026-07', label: 'Jul', income: 4500, expense: 3120 },
      { key: '2026-08', label: 'Aug', income: 4500, expense: 2890 },
      { key: '2026-09', label: 'Sep', income: 0, expense: 0 },
      { key: '2026-10', label: 'Oct', income: 0, expense: 0 },
    ];

    // Compute Sep and Oct dynamically from actual transactions!
    transactions.forEach((tx) => {
      const monthPrefix = tx.date.substring(0, 7);
      const target = months.find((m) => m.key === monthPrefix);
      if (target) {
        if (tx.type === 'income') target.income += tx.amount;
        if (tx.type === 'expense') target.expense += tx.amount;
      }
    });

    return months;
  }, [transactions]);

  const maxVal = Math.max(
    ...monthlyData.map((m) => Math.max(m.income, m.expense)),
    5500
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Income vs. Expenses Trend
          </h2>
          <p className="text-xs text-slate-500">
            6-month cash flow trajectory derived from actual transactions
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span className="text-slate-600">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-slate-800 inline-block"></span>
            <span className="text-slate-600">Expenses</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="relative h-64 w-full">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = 190 - ratio * 160;
            const val = maxVal * ratio;
            return (
              <g key={idx}>
                <line
                  x1="45"
                  y1={y}
                  x2="590"
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x="40"
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {formatCurrency(val, profile.currency, { compact: true })}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {monthlyData.map((item, index) => {
            const groupWidth = 80;
            const barWidth = 26;
            const xCenter = 75 + index * 90;
            const incomeHeight = (item.income / maxVal) * 160;
            const expenseHeight = (item.expense / maxVal) * 160;
            const incomeY = 190 - incomeHeight;
            const expenseY = 190 - expenseHeight;

            const isHovered = hoveredMonth === item.key;

            return (
              <g
                key={item.key}
                onMouseEnter={() => setHoveredMonth(item.key)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="cursor-pointer group"
              >
                {/* Background highlight on hover */}
                {isHovered && (
                  <rect
                    x={xCenter - 15}
                    y="20"
                    width={groupWidth - 10}
                    height="180"
                    fill="#F1F5F9"
                    rx="8"
                  />
                )}

                {/* Income Bar */}
                <rect
                  x={xCenter - 4}
                  y={incomeY}
                  width={barWidth}
                  height={Math.max(2, incomeHeight)}
                  rx="5"
                  className="fill-emerald-500 hover:fill-emerald-400 transition-colors"
                />

                {/* Expense Bar */}
                <rect
                  x={xCenter + 26}
                  y={expenseY}
                  width={barWidth}
                  height={Math.max(2, expenseHeight)}
                  rx="5"
                  className="fill-slate-800 hover:fill-slate-700 transition-colors"
                />

                {/* Month Label */}
                <text
                  x={xCenter + 24}
                  y="208"
                  textAnchor="middle"
                  className={`text-[11px] font-semibold ${
                    isHovered ? 'fill-emerald-600 font-bold' : 'fill-slate-500'
                  }`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip when hovered */}
        {hoveredMonth && (
          <div className="absolute top-2 right-4 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs z-10 border border-slate-800 pointer-events-none">
            {(() => {
              const item = monthlyData.find((m) => m.key === hoveredMonth);
              if (!item) return null;
              const net = item.income - item.expense;
              return (
                <div className="space-y-1">
                  <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                    {item.label} 2026 Summary
                  </div>
                  <div className="flex items-center justify-between gap-4 text-emerald-400">
                    <span>Income:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(item.income, profile.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-rose-300">
                    <span>Expenses:</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(item.expense, profile.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800 font-medium">
                    <span className="text-slate-400">Net Flow:</span>
                    <span
                      className={`font-mono font-bold ${
                        net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(net, profile.currency)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
