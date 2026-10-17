import {
  Menu,
  Calendar,
  Sparkles,
  RefreshCw,
  Coins,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ActiveTab } from './Sidebar';
import { DateRangeOption } from '../../types/finance';
import { SUPPORTED_CURRENCIES } from '../../data/currencies';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  onToggle3D?: () => void;
  is3DActive?: boolean;
}

const tabMeta: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Financial Overview',
    subtitle: 'Real-time wealth tracking, monthly velocity, and budget limits',
  },
  transactions: {
    title: 'Transaction Registry',
    subtitle: 'Manage, search, categorize, and reconcile income & expenditures',
  },
  budgets: {
    title: 'Budgets & Expense Guard',
    subtitle: 'Monthly envelope limits, over-budget warnings, and run-rate forecast',
  },
  analytics: {
    title: 'Analytics & Trends',
    subtitle: 'Deep-dive category distributions, cash flows, and month-over-month comparisons',
  },
  goals: {
    title: 'Savings Goals',
    subtitle: 'Targeted reserve funds, milestone pacing, and automated allocations',
  },
  assistant: {
    title: 'AI Financial Assistant',
    subtitle: 'Natural language expense drafting and evidence-backed spending audits',
  },
  settings: {
    title: 'Application Settings',
    subtitle: 'Currency configuration, privacy consent, data backups, and demo controls',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenAddModal,
  onToggle3D,
  is3DActive,
}) => {
  const { filters, setFilters, profile, updateProfile, resetToDemoData } = useFinance();

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ dateRange: e.target.value as DateRangeOption });
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateProfile({ currency: e.target.value });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Screen Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {tabMeta[activeTab].title}
              </h1>
              {profile.isDemoMode && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Demo Data Active
                </span>
              )}
            </div>
            <p className="hidden md:block text-xs text-slate-500 mt-0.5">
              {tabMeta[activeTab].subtitle}
            </p>
          </div>
        </div>

        {/* Right: Controls & Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <div className="relative">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={profile.currency}
                onChange={handleCurrencyChange}
                aria-label="Select currency"
                className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.dateRange}
              onChange={handleDateRangeChange}
              aria-label="Select date range"
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="this-month">This Month (Oct 2026)</option>
              <option value="last-month">Last Month (Sep 2026)</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="last-90-days">Last 90 Days</option>
              <option value="this-year">This Year (2026)</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Reset Demo button if modified */}
          {profile.isDemoMode && (
            <button
              onClick={resetToDemoData}
              title="Reset to realistic demo dataset"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Demo</span>
            </button>
          )}

          {/* 3D Spatial Vault Mode */}
          {onToggle3D && (
            <button
              onClick={onToggle3D}
              title="Experience 3D Procedural Wealth Core"
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                is3DActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${is3DActive ? 'text-white' : 'text-indigo-600'}`} />
              <span className="hidden sm:inline">3D Spatial Vault</span>
              <span className="sm:hidden">3D</span>
            </button>
          )}

          {/* Add Transaction CTA */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-100" />
            <span className="hidden xs:inline">Add Transaction</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
