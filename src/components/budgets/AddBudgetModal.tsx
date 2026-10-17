import React, { useState } from 'react';
import { X, PiggyBank, Check } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { EXPENSE_CATEGORIES } from '../../data/categories';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialLimit?: number;
}

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  initialCategory,
  initialLimit,
}) => {
  const { setBudget, profile, budgets } = useFinance();

  const [category, setCategory] = useState(initialCategory || 'Food & Dining');
  const [limit, setLimit] = useState(initialLimit ? initialLimit.toString() : '300');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Budget limit must be a positive number.');
      return;
    }

    setBudget(category, numLimit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            {initialCategory ? 'Update Category Budget' : 'Set Category Budget'}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expense Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-emerald-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Spending Limit ({profile.currency}) *
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 400"
              value={limit}
              onChange={(e) => {
                setLimit(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold focus:outline-emerald-500"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            ClearSpend monitors all transactions tagged with this category in October 2026 and flags real-time notifications if your pace approaches or exceeds this limit.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
