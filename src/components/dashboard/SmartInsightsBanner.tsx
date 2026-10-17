import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { InsightItem } from '../../types/finance';

interface SmartInsightsBannerProps {
  onNavigateToAssistant: () => void;
}

export const SmartInsightsBanner: React.FC<SmartInsightsBannerProps> = ({
  onNavigateToAssistant,
}) => {
  const { transactions, budgets, profile } = useFinance();
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchInsights() {
      if (!profile.aiConsentGiven) return;
      setLoading(true);
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
        console.error('Failed to load insights:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInsights();

    return () => {
      isMounted = false;
    };
  }, [transactions, budgets, profile.currency, profile.aiConsentGiven]);

  if (!profile.aiConsentGiven) {
    return (
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">AI Financial Insights are Paused</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Enable privacy-conscious AI analysis in Settings to unlock grounded spending audits.
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateToAssistant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
        >
          Review Consent
        </button>
      </div>
    );
  }

  const primaryInsight = insights[0];

  if (!primaryInsight) {
    return null;
  }

  const isWarning = primaryInsight.type === 'warning';
  const isPositive = primaryInsight.type === 'positive';

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        isWarning
          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
          : isPositive
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
              isWarning
                ? 'bg-rose-600 text-white'
                : isPositive
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {isWarning ? (
              <AlertTriangle className="w-4 h-4" />
            ) : isPositive ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/80">
                Evidence-Based Audit
              </span>
              <span className="text-xs font-bold">{primaryInsight.title}</span>
            </div>

            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
              <strong className="text-slate-900 font-semibold">Verified Fact:</strong>{' '}
              {primaryInsight.factualBasis}
            </p>

            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              <strong className="text-slate-800 font-medium">Recommendation:</strong>{' '}
              {primaryInsight.actionableRecommendation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <button
            onClick={onNavigateToAssistant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Ask ClearSpend AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
