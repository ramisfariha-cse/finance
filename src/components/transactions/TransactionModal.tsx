import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { Transaction, TransactionType, AccountType } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import { formatCurrency, SUPPORTED_CURRENCIES } from '../../data/currencies';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  editTransaction,
}) => {
  const { addTransaction, updateTransaction, profile } = useFinance();

  const [activeMode, setActiveMode] = useState<'ai' | 'manual'>(
    editTransaction ? 'manual' : 'ai'
  );

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDraft, setAiDraft] = useState<{
    amount: number;
    currency: string;
    date: string;
    merchant: string;
    category: string;
    type: TransactionType;
    account: AccountType;
    notes: string;
    confidence?: number;
    source?: string;
  } | null>(null);

  // Manual Form State
  const [formData, setFormData] = useState<{
    amount: string;
    date: string;
    merchant: string;
    category: string;
    type: TransactionType;
    account: AccountType;
    notes: string;
    isRecurring: boolean;
  }>({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    category: 'Food & Dining',
    type: 'expense',
    account: 'Credit Card',
    notes: '',
    isRecurring: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTransaction) {
      setFormData({
        amount: editTransaction.amount.toString(),
        date: editTransaction.date,
        merchant: editTransaction.merchant,
        category: editTransaction.category,
        type: editTransaction.type,
        account: editTransaction.account,
        notes: editTransaction.notes || '',
        isRecurring: Boolean(editTransaction.isRecurring),
      });
      setActiveMode('manual');
    } else {
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        merchant: '',
        category: 'Food & Dining',
        type: 'expense',
        account: 'Credit Card',
        notes: '',
        isRecurring: false,
      });
      setAiPrompt('');
      setAiDraft(null);
      setAiError(null);
    }
    setFormErrors({});
  }, [editTransaction, isOpen]);

  if (!isOpen) return null;

  // Handle AI Parse
  const handleParseAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiPrompt,
          defaultCurrency: profile.currency,
          categories: CATEGORIES.map((c) => c.name),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to parse text prompt');
      }

      const parsed = await res.json();
      setAiDraft({
        amount: parsed.amount || 0,
        currency: parsed.currency || profile.currency,
        date: parsed.date || new Date().toISOString().split('T')[0],
        merchant: parsed.merchant || 'Unspecified Merchant',
        category: parsed.category || 'Food & Dining',
        type: (parsed.type as TransactionType) || 'expense',
        account: (parsed.account as AccountType) || 'Checking',
        notes: parsed.notes || aiPrompt,
        confidence: parsed.confidence,
        source: parsed.source,
      });
    } catch (err: any) {
      console.error(err);
      setAiError('Could not analyze the sentence. Please try again or switch to Manual Entry.');
    } finally {
      setAiLoading(false);
    }
  };

  // Confirm AI Draft
  const handleConfirmAiDraft = () => {
    if (!aiDraft) return;

    if (aiDraft.amount <= 0) {
      setAiError('Amount must be greater than zero.');
      return;
    }

    addTransaction({
      amount: aiDraft.amount,
      date: aiDraft.date,
      merchant: aiDraft.merchant,
      category: aiDraft.category,
      type: aiDraft.type,
      account: aiDraft.account,
      notes: aiDraft.notes,
      isRecurring: false,
    });

    onClose();
  };

  // Validate Manual Form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    const amt = parseFloat(formData.amount);

    if (!formData.amount || isNaN(amt) || amt <= 0) {
      errors.amount = 'Please enter a valid positive amount.';
    }
    if (!formData.merchant.trim()) {
      errors.merchant = 'Merchant / Description is required.';
    }
    if (!formData.date) {
      errors.date = 'Date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      errors.date = 'Date must be formatted YYYY-MM-DD.';
    }
    if (!formData.category) {
      errors.category = 'Category is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Manual Form
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      amount: parseFloat(formData.amount),
      date: formData.date,
      merchant: formData.merchant.trim(),
      category: formData.category,
      type: formData.type,
      account: formData.account,
      notes: formData.notes.trim(),
      isRecurring: formData.isRecurring,
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {editTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className="text-xs text-slate-500">
              {editTransaction
                ? 'Update transaction details and recalculate balances'
                : 'Log an expense or credit using AI or structured entry'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (only shown when creating, not editing) */}
        {!editTransaction && (
          <div className="flex p-1 bg-slate-100 rounded-2xl my-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMode('ai')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'ai'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI Quick Entry</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('manual')}
              className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-xl transition-all cursor-pointer ${
                activeMode === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
              <span>Standard Form</span>
            </button>
          </div>
        )}

        {/* AI Quick Entry Mode */}
        {activeMode === 'ai' && !editTransaction && (
          <div className="space-y-4">
            <form onSubmit={handleParseAI} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe what you spent or received in plain English:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder='e.g., "I spent 450 taka on dinner today at Star Kabab" or "Paid $42 for gas at Shell yesterday via card"'
                    className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'I spent 450 taka on dinner today at Star Kabab',
                  'Paid $52 for groceries at Trader Joe’s',
                  'Received $1200 freelance payment today',
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAiPrompt(sample)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-left"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>

              {aiError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={aiLoading || !aiPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {aiLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Extracting financial details...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Parse with ClearSpend AI</span>
                  </>
                )}
              </button>
            </form>

            {/* AI Review & Confirmation Draft */}
            {aiDraft && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Structured Draft for Review</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                    {aiDraft.source === 'gemini' ? 'AI Extracted' : 'Heuristic Engine'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Amount ({aiDraft.currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={aiDraft.amount}
                      onChange={(e) =>
                        setAiDraft({ ...aiDraft, amount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900 focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Date
                    </label>
                    <input
                      type="date"
                      value={aiDraft.date}
                      onChange={(e) => setAiDraft({ ...aiDraft, date: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Merchant / Description
                    </label>
                    <input
                      type="text"
                      value={aiDraft.merchant}
                      onChange={(e) => setAiDraft({ ...aiDraft, merchant: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Category
                    </label>
                    <select
                      value={aiDraft.category}
                      onChange={(e) => setAiDraft({ ...aiDraft, category: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Type
                    </label>
                    <select
                      value={aiDraft.type}
                      onChange={(e) =>
                        setAiDraft({ ...aiDraft, type: e.target.value as TransactionType })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-500"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Account
                    </label>
                    <select
                      value={aiDraft.account}
                      onChange={(e) =>
                        setAiDraft({ ...aiDraft, account: e.target.value as AccountType })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900 focus:outline-emerald-500"
                    >
                      <option value="Checking">Checking</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Savings">Savings</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAiDraft(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAiDraft}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 cursor-pointer"
                  >
                    <span>Confirm & Save</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Standard Manual Form Mode */}
        {(activeMode === 'manual' || editTransaction) && (
          <form onSubmit={handleSubmitManual} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as TransactionType })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-emerald-500 bg-white"
                >
                  <option value="expense">Expense (-)</option>
                  <option value="income">Income (+)</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({profile.currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-bold text-xs focus:outline-emerald-500 ${
                    formErrors.amount ? 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-white'
                  }`}
                />
                {formErrors.amount && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.amount}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-emerald-500 ${
                    formErrors.date ? 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-white'
                  }`}
                />
                {formErrors.date && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.date}</p>
                )}
              </div>

              {/* Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account / Method
                </label>
                <select
                  value={formData.account}
                  onChange={(e) =>
                    setFormData({ ...formData, account: e.target.value as AccountType })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-emerald-500 bg-white"
                >
                  <option value="Checking">Checking Account</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash Wallet</option>
                  <option value="Savings">Savings Reserve</option>
                </select>
              </div>
            </div>

            {/* Merchant / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Merchant or Payee *
              </label>
              <input
                type="text"
                placeholder="e.g. Star Kabab, Whole Foods, Netflix, Employer"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-emerald-500 ${
                  formErrors.merchant ? 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-white'
                }`}
              />
              {formErrors.merchant && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.merchant}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-emerald-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Add optional context or tags..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-emerald-500 bg-white"
              />
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) =>
                  setFormData({ ...formData, isRecurring: e.target.checked })
                }
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300"
              />
              <label htmlFor="isRecurring" className="text-xs text-slate-700 cursor-pointer">
                Recurring monthly subscription or commitment
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 cursor-pointer"
              >
                {editTransaction ? 'Save Changes' : 'Record Transaction'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
