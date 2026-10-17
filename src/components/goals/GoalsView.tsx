import React, { useState } from 'react';
import { Target, Plus, ShieldCheck, Trophy, PiggyBank } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { GoalCard } from './GoalCard';
import { GoalModal } from './GoalModal';
import { ContributeModal } from './ContributeModal';
import { formatCurrency } from '../../data/currencies';

export const GoalsView: React.FC = () => {
  const { goals, deleteSavingsGoal, profile } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);

  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalTargetAcrossGoals = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const overallPercentage =
    totalTargetAcrossGoals > 0 ? (totalSavedAcrossGoals / totalTargetAcrossGoals) * 100 : 0;

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleAdd = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-600 text-white shadow-xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Targeted Savings Goals
            </h2>
            <p className="text-xs text-slate-500">
              Dedicated capital reserves, emergency buffers, and planned milestones
            </p>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Summary Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Total Capital Reserved
            </span>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {formatCurrency(totalSavedAcrossGoals, profile.currency)}
            </div>
            <p className="text-xs text-slate-400">
              Allocated across {goals.length} target goals • Target total:{' '}
              {formatCurrency(totalTargetAcrossGoals, profile.currency)}
            </p>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Portfolio Progress</span>
              <span className="text-emerald-400 font-bold">{overallPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Savings Goals Defined</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Setting concrete goals helps prevent impulse spending and accelerates your wealth journey.
          </p>
          <button
            onClick={handleAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={deleteSavingsGoal}
              onContribute={(g) => setContributingGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goal={editingGoal}
      />

      <ContributeModal
        isOpen={Boolean(contributingGoal)}
        goal={contributingGoal}
        onClose={() => setContributingGoal(null)}
      />
    </div>
  );
};
