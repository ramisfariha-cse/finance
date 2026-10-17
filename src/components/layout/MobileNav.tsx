import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  PieChart,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
}) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'History', icon: Receipt },
    { id: 'budgets' as ActiveTab, label: 'Budgets', icon: PiggyBank },
    { id: 'analytics' as ActiveTab, label: 'Analytics', icon: PieChart },
    { id: 'assistant' as ActiveTab, label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B132B]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
