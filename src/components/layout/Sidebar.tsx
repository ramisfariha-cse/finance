import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  PieChart,
  Target,
  Sparkles,
  Settings,
  ShieldCheck,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'analytics'
  | 'goals'
  | 'assistant'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  onOpen3D?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  isMobileOpen,
  setIsMobileOpen,
  onOpen3D,
}) => {
  const { profile, totals } = useFinance();

  const navigationItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'transactions' as ActiveTab,
      label: 'Transactions',
      icon: Receipt,
      badge: totals.transactionCount > 0 ? totals.transactionCount : null,
    },
    {
      id: 'budgets' as ActiveTab,
      label: 'Budgets',
      icon: PiggyBank,
      badge: null,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics',
      icon: PieChart,
      badge: null,
    },
    {
      id: 'goals' as ActiveTab,
      label: 'Savings Goals',
      icon: Target,
      badge: null,
    },
    {
      id: 'assistant' as ActiveTab,
      label: 'AI Assistant',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B132B] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black text-xl">
            CS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">ClearSpend</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Intelligent Wealth Suite</p>
          </div>
        </div>
      </div>

      {/* Quick Balance Snapshot */}
      <div className="px-4 py-4 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Available Net
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-medium">LIVE</span>
        </div>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {formatCurrency(totals.availableBalance, profile.currency)}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate">{profile.name}</span>
          <span className="text-slate-400 font-mono">{profile.currency}</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : item.badge === 'AI'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Add CTA & Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-2.5">
        {onOpen3D && (
          <button
            onClick={onOpen3D}
            className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 text-xs font-semibold transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D Spatial Vault</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              WebGL
            </span>
          </button>
        )}

        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>

        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Private & Encrypted</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">v2.4 Pro</span>
        </div>
      </div>
    </aside>
  );
};
