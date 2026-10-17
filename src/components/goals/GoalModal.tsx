import React, { useState, useEffect } from 'react';
import { X, Target, Palette } from 'lucide-react';
import { SavingsGoal } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
}

const COLOR_OPTIONS = [
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EC4899', // pink
  '#14B8A6', // teal
  '#06B6D4', // cyan
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goal,
}) => {
  const { addSavingsGoal, updateSavingsGoal, profile } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [color, setColor] = useState('#10B981');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetAmount(goal.targetAmount.toString());
      setCurrentAmount(goal.currentAmount.toString());
      setTargetDate(goal.targetDate);
      setColor(goal.color || '#10B981');
      setNotes(goal.notes || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('0');
      setTargetDate('2027-01-01');
      setColor('#10B981');
      setNotes('');
    }
    setErrors({});
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = 'Goal title is required.';
    const targetNum = parseFloat(targetAmount);
    if (isNaN(targetNum) || targetNum <= 0) errs.targetAmount = 'Enter a valid target amount.';
    const currentNum = parseFloat(currentAmount);
    if (isNaN(currentNum) || currentNum < 0) errs.currentAmount = 'Current saved must be 0 or more.';
    if (!targetDate) errs.targetDate = 'Target date is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: title.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate,
      color,
      icon: 'Target',
      notes: notes.trim(),
    };

    if (goal) {
      updateSavingsGoal(goal.id, payload);
    } else {
      addSavingsGoal(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            {goal ? 'Edit Savings Goal' : 'Create Savings Goal'}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund, Japan Trip, New Laptop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-500"
            />
            {errors.title && <p className="text-[11px] text-rose-600 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Amount ({profile.currency}) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold focus:outline-emerald-500"
              />
              {errors.targetAmount && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.targetAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Saved ({profile.currency})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-mono font-bold focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Completion Date *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-500"
            />
          </div>

          {/* Color palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Highlight Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Why this goal matters..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-emerald-500"
            />
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              {goal ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
