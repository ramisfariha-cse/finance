import React, { useState } from 'react';
import { X, PiggyBank, ArrowRight } from 'lucide-react';
import { SavingsGoal, AccountType } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';

interface ContributeModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  goal,
  isOpen,
  onClose,
}) => {
  const { contributeToGoal, profile } = useFinance();
  const [amount, setAmount] = useState('100');
  const [account, setAccount] = useState<AccountType>('Checking');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid positive contribution amount.');
      return;
    }

    contributeToGoal(goal.id, num, account);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            Contribute to Goal
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-xs font-semibold text-slate-900">{goal.title}</div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
              <span>Current: {formatCurrency(goal.currentAmount, profile.currency)}</span>
              <span>Needs: {formatCurrency(remaining, profile.currency)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deposit Amount ({profile.currency}) *
            </label>
            <input
              type="number"
              step="any"
              placeholder="100.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 font-mono font-bold focus:outline-emerald-500"
            />
            {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Funding Source Account
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value as AccountType)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-emerald-500"
            >
              <option value="Checking">Checking Account</option>
              <option value="Savings">Savings Account</option>
              <option value="Cash">Cash Reserve</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              <span>Add Contribution</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
