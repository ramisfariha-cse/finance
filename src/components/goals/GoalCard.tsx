import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency } from '../../data/currencies';
import { useFinance } from '../../context/FinanceContext';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: SavingsGoal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onContribute,
}) => {
  const { profile } = useFinance();

  const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const isAchieved = goal.currentAmount >= goal.targetAmount;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Compute months remaining to target date
  const today = new Date('2026-10-17');
  const targetD = new Date(goal.targetDate);
  const diffTime = targetD.getTime() - today.getTime();
  const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const diffMonths = Math.max(1, Math.ceil(diffDays / 30.5));
  const requiredMonthlySavings = remaining / diffMonths;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
              style={{ backgroundColor: goal.color || '#10B981' }}
            >
              {isAchieved ? (
                <PartyPopper className="w-5 h-5 text-white animate-bounce" />
              ) : (
                <Sparkles className="w-5 h-5 text-white" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">{goal.title}</h3>
              {goal.notes && (
                <p className="text-xs text-slate-500 line-clamp-1">{goal.notes}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs mb-1.5 font-mono">
            <span className="text-slate-600">
              Saved:{' '}
              <strong className="text-slate-900 text-sm">
                {formatCurrency(goal.currentAmount, profile.currency)}
              </strong>
            </span>
            <span className="text-slate-400 text-[11px]">
              Goal: {formatCurrency(goal.targetAmount, profile.currency)}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: isAchieved ? '#10B981' : goal.color || '#10B981',
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span className="font-bold text-slate-800">{pct.toFixed(1)}% Completed</span>
            <span>
              {isAchieved
                ? 'Target Met!'
                : `${formatCurrency(remaining, profile.currency)} to go`}
            </span>
          </div>
        </div>

        {/* Pacing details */}
        {!isAchieved && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline:
              </span>
              <span className="font-semibold text-slate-800">{goal.targetDate}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Required Pace:</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatCurrency(requiredMonthlySavings, profile.currency)} / mo
              </span>
            </div>
          </div>
        )}

        {isAchieved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Congratulations! Full target achieved.</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => onContribute(goal)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Contribution</span>
        </button>
      </div>
    </div>
  );
};
