export type TransactionType = 'expense' | 'income' | 'transfer';

export type AccountType = 'Checking' | 'Savings' | 'Credit Card' | 'Cash';

export type StandardCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Housing & Rent'
  | 'Utilities & Bills'
  | 'Transportation'
  | 'Shopping & Retail'
  | 'Healthcare & Medical'
  | 'Entertainment & Leisure'
  | 'Education'
  | 'Travel'
  | 'Salary & Wages'
  | 'Investment & Dividends'
  | 'Freelance & Side Gig'
  | 'Personal Care'
  | 'Subscriptions'
  | 'Gifts & Donations'
  | 'Other';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: string;
  merchant: string;
  account: AccountType;
  notes?: string;
  isRecurring?: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  color: string;
  icon: string;
  notes?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  position: 'prefix' | 'suffix';
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  monthlyIncomeTarget: number;
  aiConsentGiven: boolean;
  isDemoMode: boolean;
  monthStartDay: number; // 1 to 28
}

export type DateRangeOption =
  | 'this-month'
  | 'last-month'
  | 'last-30-days'
  | 'last-90-days'
  | 'this-year'
  | 'all'
  | 'custom';

export interface TransactionFilters {
  dateRange: DateRangeOption;
  customStartDate?: string;
  customEndDate?: string;
  type: 'all' | TransactionType;
  category: string;
  account: string;
  search: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface InsightItem {
  id: string;
  type: 'warning' | 'positive' | 'tip' | 'recurring';
  title: string;
  factualBasis: string;
  actionableRecommendation: string;
  isFactual: boolean;
}

export interface RecurringExpenseItem {
  merchant: string;
  category: string;
  typicalAmount: number;
  frequency: string;
  count: number;
  lastChargedDate: string;
}

export interface SpendingForecast {
  projectedMonthEndSpend: number;
  dailyAverageSpend: number;
  daysRemainingInMonth: number;
  budgetRunRatePercent: number;
  budgetStatus: 'safe' | 'warning' | 'critical';
}
