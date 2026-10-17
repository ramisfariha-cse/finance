import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Info,
  LucideIcon,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  changePercent?: number;
  changeLabel?: string;
  invertChangeColor?: boolean; // For expenses, an increase is typically red/warning
  calculationExplanation: string;
  subValue?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  changePercent,
  changeLabel = 'vs last month',
  invertChangeColor = false,
  calculationExplanation,
  subValue,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Determine trend color
  const isPositiveChange = (changePercent ?? 0) >= 0;
  let isGood = isPositiveChange;
  if (invertChangeColor) {
    isGood = !isPositiveChange;
  }

  return (
    <div className="relative bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="relative inline-block">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-slate-400 hover:text-slate-600 focus:outline-none"
              aria-label="Calculation details"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {showTooltip && (
              <div className="absolute left-0 bottom-full mb-2 w-56 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-20 pointer-events-none leading-relaxed">
                <div className="font-semibold text-emerald-400 mb-1">Calculation Method:</div>
                {calculationExplanation}
              </div>
            )}
          </div>
        </div>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
          style={{ backgroundColor: iconBgColor, color: iconColor }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
          {value}
        </div>

        {subValue && (
          <div className="text-xs text-slate-500 mt-0.5">
            {subValue}
          </div>
        )}

        {changePercent !== undefined && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-2 py-0.5 rounded-full ${
                isGood
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositiveChange ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {isPositiveChange ? '+' : ''}
              {changePercent.toFixed(1)}%
            </span>
            <span className="text-slate-400 text-[11px] truncate">{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
