import React, { useState } from 'react';
import { Plus, PiggyBank, ShieldCheck, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget } from '../../types/finance';
import { BudgetCard } from './BudgetCard';
import { AddBudgetModal } from './AddBudgetModal';
import { RecurringExpensesSection } from './RecurringExpensesSection';
import { SpendingForecastWidget } from './SpendingForecastWidget';
import { formatCurrency } from '../../data/currencies';

export const BudgetsView: React.FC = () => {
  const { budgetProgress, overallBudgetProgress, deleteBudget, profile } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-xs">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Monthly Budget Envelopes
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{budgetProgress.length} active categories</span>
              <span>•</span>
              <span className="font-mono text-slate-900 font-semibold">
                Cap: {formatCurrency(overallBudgetProgress.totalLimit, profile.currency)}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-700 font-semibold">
                Spent: {formatCurrency(overallBudgetProgress.totalSpent, profile.currency)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Spending Velocity Forecast */}
      <SpendingForecastWidget />

      {/* Category Budget Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Category Breakdown ({budgetProgress.length})
          </h3>
          <span className="text-xs text-slate-400">
            Paced for billing cycle ending Oct 31, 2026
          </span>
        </div>

        {budgetProgress.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
            <p className="text-xs text-slate-500 mb-3">No category budgets established.</p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Set First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetProgress.map((item) => (
              <BudgetCard
                key={item.budget.id}
                budget={item.budget}
                spent={item.spent}
                remaining={item.remaining}
                percentUsed={item.percentUsed}
                isOverBudget={item.isOverBudget}
                onEdit={handleEdit}
                onDelete={deleteBudget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recurring Subscriptions & Fixed Expenses */}
      <RecurringExpensesSection />

      {/* Modal */}
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCategory={editingBudget?.category}
        initialLimit={editingBudget?.monthlyLimit}
      />
    </div>
  );
};
