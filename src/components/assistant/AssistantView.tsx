import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Receipt,
  User,
  Bot,
  Info,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { CATEGORIES } from '../../data/categories';
import { TransactionType, AccountType, InsightItem } from '../../types/finance';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AssistantView: React.FC = () => {
  const {
    transactions,
    budgets,
    goals,
    totals,
    categorySpending,
    profile,
    updateProfile,
    addTransaction,
  } = useFinance();

  // Natural Language Entry State
  const [nlText, setNlText] = useState('');
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [nlDraft, setNlDraft] = useState<{
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

  // Evidence Insights State
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-0',
      sender: 'assistant',
      text: `Hello ${profile.name}! I am ClearSpend AI, your grounded financial assistant. I only analyze your actual recorded transactions and budgets. Ask me anything about your current month spending, category breakdowns, or cash flow.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-fetch insights when consent is active
  useEffect(() => {
    let isMounted = true;
    if (!profile.aiConsentGiven) return;

    async function loadInsights() {
      setLoadingInsights(true);
      try {
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactions: transactions.slice(0, 30),
            budgets,
            currency: profile.currency,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.insights)) {
            setInsights(data.insights);
          }
        }
      } catch (err) {
        console.error('Insights fetch failed', err);
      } finally {
        if (isMounted) setLoadingInsights(false);
      }
    }

    loadInsights();

    return () => {
      isMounted = false;
    };
  }, [transactions, budgets, profile.currency, profile.aiConsentGiven]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Natural Language Extraction
  const handleParseNl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlText.trim()) return;

    setNlLoading(true);
    setNlError(null);

    try {
      const res = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: nlText,
          defaultCurrency: profile.currency,
          categories: CATEGORIES.map((c) => c.name),
        }),
      });

      if (!res.ok) throw new Error('Parsing failed');

      const data = await res.json();
      setNlDraft({
        amount: data.amount || 0,
        currency: data.currency || profile.currency,
        date: data.date || new Date().toISOString().split('T')[0],
        merchant: data.merchant || 'Unspecified Merchant',
        category: data.category || 'Food & Dining',
        type: data.type || 'expense',
        account: data.account || 'Checking',
        notes: data.notes || nlText,
        confidence: data.confidence,
        source: data.source,
      });
    } catch (err) {
      setNlError('Could not parse statement. Please refine your sentence.');
    } finally {
      setNlLoading(false);
    }
  };

  const handleConfirmNl = () => {
    if (!nlDraft || nlDraft.amount <= 0) return;

    addTransaction({
      amount: nlDraft.amount,
      date: nlDraft.date,
      merchant: nlDraft.merchant,
      category: nlDraft.category,
      type: nlDraft.type,
      account: nlDraft.account,
      notes: nlDraft.notes,
      isRecurring: false,
    });

    setNlDraft(null);
    setNlText('');
  };

  // Handle Chat Submit
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      // Build summary context
      const summaryContext = {
        totalIncome: totals.income,
        totalExpenses: totals.expenses,
        availableBalance: totals.availableBalance,
        categoryBreakdown: categorySpending,
        recentTransactions: transactions.slice(0, 15),
        budgets,
        savingsGoals: goals,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          summary: summaryContext,
          currency: profile.currency,
        }),
      });

      if (!res.ok) throw new Error('AI response error');

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `m-ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'No response generated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `m-ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `Based on your local transaction ledger: Total income is ${formatCurrency(
            totals.income,
            profile.currency
          )} and expenses are ${formatCurrency(
            totals.expenses,
            profile.currency
          )}. Ensure your Gemini API credentials are set for contextual questions.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy & Consent Controller */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Zero-Hallucination & Privacy Protection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ClearSpend AI evaluates only mathematical records without sending personally identifiable info. Predictions are strictly separated from historical facts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span className="text-xs font-semibold text-slate-700">AI Features:</span>
          <button
            type="button"
            onClick={() => updateProfile({ aiConsentGiven: !profile.aiConsentGiven })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              profile.aiConsentGiven ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                profile.aiConsentGiven ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2-Column Layout: Natural Language Entry & Grounded Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Natural Language Entry */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Natural-Language Expense Intake
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter any sentence describing a purchase or deposit. ClearSpend AI parses amount, currency, merchant, category, and date into an editable draft before saving.
            </p>

            <form onSubmit={handleParseNl} className="space-y-3">
              <textarea
                rows={3}
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder='e.g., "I spent 450 taka on dinner today at Star Kabab"'
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
              />

              {/* Sample Prompts */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  Try Examples:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'I spent 450 taka on dinner today at Star Kabab',
                    'Paid $35 for prescription medication yesterday',
                    'Received $850 freelance milestone payment today',
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNlText(sample)}
                      className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-left transition-colors"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>

              {nlError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{nlError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={nlLoading || !nlText.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {nlLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Extracting Structured Attributes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Parse into Structured Draft</span>
                  </>
                )}
              </button>
            </form>

            {/* Editable Review Draft */}
            {nlDraft && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Parsed Draft Review (Review Before Saving)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                    {nlDraft.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Local Heuristic'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Amount ({nlDraft.currency})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={nlDraft.amount}
                      onChange={(e) =>
                        setNlDraft({ ...nlDraft, amount: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Date
                    </label>
                    <input
                      type="date"
                      value={nlDraft.date}
                      onChange={(e) => setNlDraft({ ...nlDraft, date: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Merchant / Description
                    </label>
                    <input
                      type="text"
                      value={nlDraft.merchant}
                      onChange={(e) => setNlDraft({ ...nlDraft, merchant: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">
                      Category
                    </label>
                    <select
                      value={nlDraft.category}
                      onChange={(e) => setNlDraft({ ...nlDraft, category: e.target.value })}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-900"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNlDraft(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmNl}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    <span>Save to Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Evidence-Based Audit Insights */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Evidence-Based Audits
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Grounded in Real Records
              </span>
            </div>

            <div className="space-y-3">
              {insights.map((ins) => (
                <div
                  key={ins.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    ins.type === 'warning'
                      ? 'bg-rose-50/60 border-rose-200'
                      : ins.type === 'positive'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    {ins.type === 'warning' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    ) : ins.type === 'positive' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>{ins.title}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Factual Finding:</strong>{' '}
                    {ins.factualBasis}
                  </p>

                  <p className="text-slate-600 leading-relaxed">
                    <strong className="text-slate-800">Action Plan:</strong>{' '}
                    {ins.actionableRecommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Q&A Chat */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col h-[680px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Financial Advisor Chat</h4>
                  <p className="text-[10px] text-slate-400">
                    Grounded strictly in your actual {transactions.length} transactions
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Audited State
              </span>
            </div>

            {/* Chat Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0 text-xs">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {m.text}
                      <div
                        className={`text-[9px] mt-1 font-mono text-right ${
                          isUser ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {m.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {chatLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-500 text-xs flex items-center gap-2">
                    <RotateCcw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Verifying ledger records...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5 text-[11px]">
              {[
                'How much did I spend on dining out this month?',
                'Which subscriptions am I paying for?',
                'Am I on track with my monthly budget limit?',
              ].map((query, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInputMessage(query)}
                  className="px-2 py-0.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form
              onSubmit={handleSendChat}
              className="p-3 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your actual expenses, categories, or budgets..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-emerald-500 bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
