import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../data/currencies';
import { MetricCard } from './MetricCard';
import { SpendingChart } from './SpendingChart';
import { CategoryDonutChart } from './CategoryDonutChart';
import { BudgetOverviewWidget } from './BudgetOverviewWidget';
import { RecentTransactionsWidget } from './RecentTransactionsWidget';
import { SavingsGoalsWidget } from './SavingsGoalsWidget';
import { SmartInsightsBanner } from './SmartInsightsBanner';
import { ActiveTab } from '../layout/Sidebar';
import { Transaction } from '../../types/finance';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAddModal,
  onSelectTransaction,
}) => {
  const { totals, monthOverMonth, profile } = useFinance();

  return (
    <div className="space-y-6">
      {/* Smart Evidence Banner */}
      <SmartInsightsBanner
        onNavigateToAssistant={() => setActiveTab('assistant')}
      />

      {/* Top 4 Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <MetricCard
          title="Available Net Balance"
          value={formatCurrency(totals.availableBalance, profile.currency)}
          subValue="Cumulative cash & credit balances"
          icon={Wallet}
          iconColor="#10B981"
          iconBgColor="#ECFDF5"
          calculationExplanation="Calculated dynamically as: Total Lifetime Income minus Total Lifetime Expenses across all linked accounts."
        />

        {/* Total Income */}
        <MetricCard
          title="Total Inflow"
          value={formatCurrency(totals.income, profile.currency)}
          icon={ArrowUpRight}
          iconColor="#059669"
          iconBgColor="#D1FAE5"
          changePercent={monthOverMonth.incomeDiffPercent}
          changeLabel="vs last month"
          calculationExplanation="Sum of all credits, salary deposits, and freelance income recorded in the selected period."
        />

        {/* Total Expenses */}
        <MetricCard
          title="Total Outflow"
          value={formatCurrency(totals.expenses, profile.currency)}
          icon={ArrowDownRight}
          iconColor="#E11D48"
          iconBgColor="#FFE4E6"
          changePercent={monthOverMonth.expenseDiffPercent}
          changeLabel="vs last month"
          invertChangeColor={true} // Higher expense is red
          calculationExplanation="Sum of all debits and expenditures across all categories in the selected period."
        />

        {/* Net Savings Rate */}
        <MetricCard
          title="Savings Velocity"
          value={`${totals.savingsRate.toFixed(1)}%`}
          subValue={`Net surplus: ${formatCurrency(totals.netSavings, profile.currency)}`}
          icon={PiggyBank}
          iconColor="#3B82F6"
          iconBgColor="#EFF6FF"
          calculationExplanation="Calculated as: ((Total Inflow - Total Outflow) / Total Inflow) * 100 for the active period."
        />
      </div>

      {/* Primary Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <SpendingChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Secondary Operational Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Budget Overview */}
        <BudgetOverviewWidget
          onNavigateToBudgets={() => setActiveTab('budgets')}
        />

        {/* Recent Transactions List */}
        <RecentTransactionsWidget
          onNavigateToTransactions={() => setActiveTab('transactions')}
          onOpenAddModal={onOpenAddModal}
          onSelectTransaction={onSelectTransaction}
        />

        {/* Savings Goals Pacing */}
        <SavingsGoalsWidget
          onNavigateToGoals={() => setActiveTab('goals')}
          onOpenGoalModal={() => setActiveTab('goals')}
        />
      </div>
    </div>
  );
};
