import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { getCategoryMeta } from '../../data/categories';
import { CategoryIcon } from '../common/CategoryIcon';

export const CategoryDonutChart: React.FC = () => {
  const { categorySpending, totals, profile } = useFinance();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 6);

  const totalExpense = totals.expenses;

  // Calculate SVG donut segments
  let cumulativeAngle = 0;
  const segments = categories.map(([name, data]) => {
    const meta = getCategoryMeta(name);
    const fraction = totalExpense > 0 ? data.amount / totalExpense : 0;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    // Convert polar to cartesian
    const radius = 70;
    const innerRadius = 45;
    const cx = 100;
    const cy = 100;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData =
      angle >= 359.9
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy + radius} A ${radius} ${radius} 0 1 1 ${cx} ${cy - radius} M ${cx} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy + innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius} Z`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return {
      name,
      amount: data.amount,
      percentage: data.percentage,
      count: data.count,
      color: meta.color,
      pathData,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Spending by Category
            </h2>
            <p className="text-xs text-slate-500">
              Proportional expense breakdown for the active period
            </p>
          </div>
        </div>

        {totalExpense === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No expenses recorded for this timeframe.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 flex justify-center relative">
              <svg className="w-48 h-48 drop-shadow-xs" viewBox="0 0 200 200">
                {segments.map((seg) => (
                  <path
                    key={seg.name}
                    d={seg.pathData}
                    fill={seg.color}
                    className="transition-transform duration-200 hover:opacity-90 cursor-pointer"
                    onMouseEnter={() => setActiveCategory(seg.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                    style={{
                      transformOrigin: '100px 100px',
                      transform: activeCategory === seg.name ? 'scale(1.04)' : 'scale(1)',
                    }}
                  />
                ))}
              </svg>

              {/* Inner Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Total Spent
                </span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  {formatCurrency(totalExpense, profile.currency, { compact: true })}
                </span>
              </div>
            </div>

            {/* Category Legend */}
            <div className="sm:col-span-7 space-y-2">
              {segments.map((seg) => {
                const isSelected = activeCategory === seg.name;
                return (
                  <div
                    key={seg.name}
                    onMouseEnter={() => setActiveCategory(seg.name)}
                    onMouseLeave={() => setActiveCategory(null)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CategoryIcon category={seg.name} size="sm" />
                      <span className="text-slate-800 font-medium truncate">
                        {seg.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 font-mono text-right">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(seg.amount, profile.currency)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 w-10 text-right">
                        {seg.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
