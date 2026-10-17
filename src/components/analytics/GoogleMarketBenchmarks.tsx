import React, { useState, useEffect } from 'react';
import {
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Building2,
  Coins,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';

interface MarketData {
  updatedAt: string;
  headline: string;
  benchmarks: Array<{
    region: string;
    metric: string;
    value: string;
    trend: string;
    source: string;
  }>;
  centralBankRates: Array<{
    bank: string;
    rate: string;
    stance: string;
  }>;
  fxRates: Array<{
    pair: string;
    rate: string;
    change: string;
  }>;
  spendingGuidance: string;
  sources: string[];
  groundedWithGoogle: boolean;
}

export const GoogleMarketBenchmarks: React.FC = () => {
  const { monthOverMonth, profile } = useFinance();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBenchmarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/google/market-benchmarks');
      if (!res.ok) throw new Error('Failed to retrieve Google market benchmarks');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError('Unable to fetch live Google benchmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Google Macroeconomic Intelligence & Market Benchmarks
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Search className="w-3 h-3" /> Grounded via Google
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inflation indices, central bank policy rates, and currency benchmarks collected from Google search data
            </p>
          </div>
        </div>

        <button
          onClick={fetchBenchmarks}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Querying Google...' : 'Sync Live Benchmarks'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Headline & Spending Comparison Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-emerald-50/60 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-800">
                Macroeconomic Summary (Google Grounded)
              </span>
              <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                "{data.headline}"
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong className="text-slate-800">Guidance:</strong> {data.spendingGuidance}
              </p>
            </div>

            {/* Personal spend comparison metric */}
            <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 shrink-0 text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Your Monthly Outflow Delta
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {monthOverMonth.expenseDiffPercent > 0 ? '+' : ''}
                {monthOverMonth.expenseDiffPercent.toFixed(1)}% MoM
              </div>
              <div className="text-[10px] text-slate-500">
                vs. global CPI benchmark ~2.6% - 9.2%
              </div>
            </div>
          </div>

          {/* 3 Columns: Inflation Benchmarks, Central Bank Policy, Foreign Exchange */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Global CPI Inflation */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                <span>Annual CPI Inflation</span>
              </div>

              <div className="space-y-2">
                {data.benchmarks.map((b, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{b.region}</div>
                      <div className="text-[10px] text-slate-400">{b.metric}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900">{b.value}</div>
                      <span className="text-[10px] text-emerald-600 font-sans font-medium capitalize">
                        {b.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Central Bank Benchmark Rates */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span>Central Bank Policy Rates</span>
              </div>

              <div className="space-y-2">
                {data.centralBankRates.map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{c.bank}</div>
                      <div className="text-[10px] text-slate-400">{c.stance}</div>
                    </div>
                    <div className="text-right font-mono font-bold text-indigo-950">
                      {c.rate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Live FX Benchmarks */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Currency Exchange Pairs</span>
              </div>

              <div className="space-y-2">
                {data.fxRates.map((fx, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="font-semibold text-slate-900 font-mono">{fx.pair}</div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-slate-900">{fx.rate}</div>
                      <span
                        className={`text-[10px] font-sans ${
                          fx.change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {fx.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Verification footer with citations */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounded with live economic registry sources from Google</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 truncate max-w-md">
              <span>Updated: {new Date(data.updatedAt).toLocaleTimeString()}</span>
              <span>•</span>
              <span className="truncate">Sources: {data.sources.slice(0, 3).join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
