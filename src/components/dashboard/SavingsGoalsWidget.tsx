import React from 'react';
import { Target, ChevronRight, Plus, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';

interface SavingsGoalsWidgetProps {
  onNavigateToGoals: () => void;
  onOpenGoalModal: () => void;
}

export const SavingsGoalsWidget: React.FC<SavingsGoalsWidgetProps> = ({
  onNavigateToGoals,
  onOpenGoalModal,
}) => {
  const { goals, profile } = useFinance();

  const previewGoals = goals.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Active Savings Goals
            </h2>
            <p className="text-xs text-slate-500">
              Targeted reserve accounts & milestone pacing
            </p>
          </div>

          <button
            onClick={onNavigateToGoals}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
          >
            All Goals <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {previewGoals.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-500 mb-2">No active savings goals.</p>
            <button
              onClick={onOpenGoalModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {previewGoals.map((g) => {
              const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
              const isAchieved = g.currentAmount >= g.targetAmount;

              return (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: g.color || '#10B981' }}
                      />
                      <span className="font-semibold text-slate-900 truncate">{g.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {isAchieved ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Achieved!
                        </span>
                      ) : (
                        <span className="font-bold text-slate-700">
                          {formatCurrency(g.currentAmount, profile.currency, {
                            hideDecimals: true,
                          })}{' '}
                          /{' '}
                          {formatCurrency(g.targetAmount, profile.currency, {
                            hideDecimals: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isAchieved ? '#10B981' : g.color || '#10B981',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>Target Date: {g.targetDate}</span>
                    <span className="font-semibold font-mono">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
