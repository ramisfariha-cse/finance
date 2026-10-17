import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Transaction,
  Budget,
  SavingsGoal,
  UserProfile,
  TransactionFilters,
  AccountType,
  RecurringExpenseItem,
  SpendingForecast,
} from '../types/finance';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_USER_PROFILE,
} from '../data/initialData';

const STORAGE_KEY_PREFIX = 'clearspend_v1_';

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
  filters: TransactionFilters;
  filteredTransactions: Transaction[];
  totals: {
    income: number;
    expenses: number;
    availableBalance: number;
    netSavings: number;
    savingsRate: number;
    transactionCount: number;
  };
  monthOverMonth: {
    currentMonthExpenses: number;
    prevMonthExpenses: number;
    expenseDiffPercent: number;
    currentMonthIncome: number;
    prevMonthIncome: number;
    incomeDiffPercent: number;
  };
  categorySpending: Record<string, { amount: number; count: number; percentage: number }>;
  budgetProgress: Array<{
    budget: Budget;
    spent: number;
    remaining: number;
    percentUsed: number;
    isOverBudget: boolean;
  }>;
  overallBudgetProgress: {
    totalLimit: number;
    totalSpent: number;
    remaining: number;
    percentUsed: number;
    isOverBudget: boolean;
  };
  recurringExpenses: RecurringExpenseItem[];
  spendingForecast: SpendingForecast;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (
    newTxs: Array<Omit<Transaction, 'id' | 'createdAt'>>,
    skipDuplicates?: boolean
  ) => { imported: number; skipped: number };
  setBudget: (category: string, monthlyLimit: number) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number, account?: AccountType) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setFilters: (updates: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const defaultFilters: TransactionFilters = {
  dateRange: 'this-month',
  type: 'all',
  category: 'all',
  account: 'all',
  search: '',
  sortBy: 'date-desc',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  // Load initial state from LocalStorage or fall back to defaults
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}budgets`);
      return stored ? JSON.parse(stored) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}goals`);
      return stored ? JSON.parse(stored) : INITIAL_GOALS;
    } catch {
      return INITIAL_GOALS;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
      return stored ? JSON.parse(stored) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const [filters, setFilterState] = useState<TransactionFilters>(defaultFilters);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to persist transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}budgets`, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to persist budgets', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}goals`, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to persist goals', e);
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to persist profile', e);
    }
  }, [profile]);

  // Derived: Current Date Anchor (October 2026)
  const today = useMemo(() => new Date('2026-10-17T12:00:00Z'), []);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 9 (0-indexed = October)

  // Filter Transactions based on active filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(`${tx.date}T00:00:00`);

      // Date Range Filter
      if (filters.dateRange === 'this-month') {
        if (txDate.getFullYear() !== currentYear || txDate.getMonth() !== currentMonth) {
          return false;
        }
      } else if (filters.dateRange === 'last-month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        if (txDate.getFullYear() !== lastMonthYear || txDate.getMonth() !== lastMonth) {
          return false;
        }
      } else if (filters.dateRange === 'last-30-days') {
        const diffDays = (today.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 0 || diffDays > 30) return false;
      } else if (filters.dateRange === 'last-90-days') {
        const diffDays = (today.getTime() - txDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 0 || diffDays > 90) return false;
      } else if (filters.dateRange === 'this-year') {
        if (txDate.getFullYear() !== currentYear) return false;
      } else if (filters.dateRange === 'custom') {
        if (filters.customStartDate && tx.date < filters.customStartDate) return false;
        if (filters.customEndDate && tx.date > filters.customEndDate) return false;
      }

      // Type Filter
      if (filters.type !== 'all' && tx.type !== filters.type) return false;

      // Category Filter
      if (filters.category !== 'all' && tx.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }

      // Account Filter
      if (filters.account !== 'all' && tx.account.toLowerCase() !== filters.account.toLowerCase()) {
        return false;
      }

      // Amount filter
      if (filters.minAmount !== undefined && tx.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && tx.amount > filters.maxAmount) return false;

      // Search filter
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchesMerchant = tx.merchant.toLowerCase().includes(q);
        const matchesCategory = tx.category.toLowerCase().includes(q);
        const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
        const matchesAmount = tx.amount.toString().includes(q);
        if (!matchesMerchant && !matchesCategory && !matchesNotes && !matchesAmount) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (filters.sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (filters.sortBy === 'amount-desc') return b.amount - a.amount;
      if (filters.sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, filters, today, currentYear, currentMonth]);

  // Derived Totals
  const totals = useMemo(() => {
    let income = 0;
    let expenses = 0;

    // Filtered totals
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'expense') expenses += tx.amount;
    });

    // All-time available balance
    let allTimeIncome = 0;
    let allTimeExpense = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'income') allTimeIncome += tx.amount;
      else if (tx.type === 'expense') allTimeExpense += tx.amount;
    });

    const availableBalance = allTimeIncome - allTimeExpense;
    const netSavings = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, (netSavings / income) * 100) : 0;

    return {
      income,
      expenses,
      availableBalance,
      netSavings,
      savingsRate,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions, transactions]);

  // Month-over-Month Comparison
  const monthOverMonth = useMemo(() => {
    let currentMonthExpenses = 0;
    let currentMonthIncome = 0;
    let prevMonthExpenses = 0;
    let prevMonthIncome = 0;

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    transactions.forEach((tx) => {
      const d = new Date(`${tx.date}T00:00:00`);
      const y = d.getFullYear();
      const m = d.getMonth();

      if (y === currentYear && m === currentMonth) {
        if (tx.type === 'expense') currentMonthExpenses += tx.amount;
        if (tx.type === 'income') currentMonthIncome += tx.amount;
      } else if (y === lastMonthYear && m === lastMonth) {
        if (tx.type === 'expense') prevMonthExpenses += tx.amount;
        if (tx.type === 'income') prevMonthIncome += tx.amount;
      }
    });

    const expenseDiffPercent =
      prevMonthExpenses > 0
        ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
        : 0;

    const incomeDiffPercent =
      prevMonthIncome > 0
        ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100
        : 0;

    return {
      currentMonthExpenses,
      prevMonthExpenses,
      expenseDiffPercent,
      currentMonthIncome,
      prevMonthIncome,
      incomeDiffPercent,
    };
  }, [transactions, currentYear, currentMonth]);

  // Category Breakdown for currently filtered transactions
  const categorySpending = useMemo(() => {
    const map: Record<string, { amount: number; count: number; percentage: number }> = {};
    let totalExpense = 0;

    filteredTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        totalExpense += t.amount;
        if (!map[t.category]) {
          map[t.category] = { amount: 0, count: 0, percentage: 0 };
        }
        map[t.category].amount += t.amount;
        map[t.category].count += 1;
      });

    if (totalExpense > 0) {
      Object.keys(map).forEach((cat) => {
        map[cat].percentage = (map[cat].amount / totalExpense) * 100;
      });
    }

    return map;
  }, [filteredTransactions]);

  // Monthly Budget Progress (Measured against Current Month spending)
  const currentMonthExpensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((tx) => {
        const d = new Date(`${tx.date}T00:00:00`);
        return (
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth &&
          tx.type === 'expense'
        );
      })
      .forEach((tx) => {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      });
    return map;
  }, [transactions, currentYear, currentMonth]);

  const budgetProgress = useMemo(() => {
    return budgets.map((b) => {
      const spent = currentMonthExpensesByCategory[b.category] || 0;
      const remaining = Math.max(0, b.monthlyLimit - spent);
      const percentUsed = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const isOverBudget = spent > b.monthlyLimit;

      return {
        budget: b,
        spent,
        remaining,
        percentUsed,
        isOverBudget,
      };
    });
  }, [budgets, currentMonthExpensesByCategory]);

  const overallBudgetProgress = useMemo(() => {
    const totalLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
    const totalSpent = Object.values(currentMonthExpensesByCategory).reduce((a, b) => a + b, 0);
    const remaining = Math.max(0, totalLimit - totalSpent);
    const percentUsed = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    const isOverBudget = totalSpent > totalLimit;

    return {
      totalLimit,
      totalSpent,
      remaining,
      percentUsed,
      isOverBudget,
    };
  }, [budgets, currentMonthExpensesByCategory]);

  // Recurring Expenses Detection Engine
  const recurringExpenses = useMemo(() => {
    const merchantMap: Record<
      string,
      { amounts: number[]; dates: string[]; category: string; isFlagged: boolean }
    > = {};

    transactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const key = tx.merchant.trim().toLowerCase();
      if (!merchantMap[key]) {
        merchantMap[key] = {
          amounts: [],
          dates: [],
          category: tx.category,
          isFlagged: Boolean(tx.isRecurring),
        };
      }
      merchantMap[key].amounts.push(tx.amount);
      merchantMap[key].dates.push(tx.date);
      if (tx.isRecurring) merchantMap[key].isFlagged = true;
    });

    const results: RecurringExpenseItem[] = [];

    Object.entries(merchantMap).forEach(([rawMerchant, data]) => {
      // Considered recurring if explicitly flagged OR repeats with near identical amount
      if (data.isFlagged || data.amounts.length >= 2) {
        // Find typical amount (median or average)
        const avg = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
        const sortedDates = [...data.dates].sort().reverse();

        // Capitalize merchant name nicely
        const cleanMerchant =
          rawMerchant.charAt(0).toUpperCase() + rawMerchant.slice(1);

        results.push({
          merchant: cleanMerchant,
          category: data.category,
          typicalAmount: Math.round(avg * 100) / 100,
          frequency: 'Monthly',
          count: data.amounts.length,
          lastChargedDate: sortedDates[0],
        });
      }
    });

    return results.sort((a, b) => b.typicalAmount - a.typicalAmount);
  }, [transactions]);

  // Spending Forecast
  const spendingForecast = useMemo<SpendingForecast>(() => {
    const currentDay = today.getDate(); // 17
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // 31
    const daysElapsed = Math.max(1, currentDay);
    const daysRemainingInMonth = Math.max(0, daysInMonth - currentDay);

    const currentSpent = overallBudgetProgress.totalSpent;
    const dailyAverageSpend = currentSpent / daysElapsed;
    const projectedMonthEndSpend = currentSpent + dailyAverageSpend * daysRemainingInMonth;

    const totalLimit = overallBudgetProgress.totalLimit || 1;
    const budgetRunRatePercent = (projectedMonthEndSpend / totalLimit) * 100;

    let budgetStatus: 'safe' | 'warning' | 'critical' = 'safe';
    if (budgetRunRatePercent > 100) budgetStatus = 'critical';
    else if (budgetRunRatePercent > 85) budgetStatus = 'warning';

    return {
      projectedMonthEndSpend,
      dailyAverageSpend,
      daysRemainingInMonth,
      budgetRunRatePercent,
      budgetStatus,
    };
  }, [today, currentYear, currentMonth, overallBudgetProgress]);

  // CRUD Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const importTransactions = (
    newTxs: Array<Omit<Transaction, 'id' | 'createdAt'>>,
    skipDuplicates: boolean = true
  ) => {
    let importedCount = 0;
    let skippedCount = 0;

    setTransactions((prev) => {
      const existingSignatures = new Set(
        prev.map((t) => `${t.date}_${t.amount}_${t.merchant.toLowerCase().trim()}`)
      );

      const toAdd: Transaction[] = [];

      newTxs.forEach((candidate) => {
        const sig = `${candidate.date}_${candidate.amount}_${candidate.merchant.toLowerCase().trim()}`;
        if (skipDuplicates && existingSignatures.has(sig)) {
          skippedCount++;
        } else {
          toAdd.push({
            ...candidate,
            id: `tx-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            createdAt: new Date().toISOString(),
          });
          existingSignatures.add(sig);
          importedCount++;
        }
      });

      return [...toAdd, ...prev];
    });

    return { imported: importedCount, skipped: skippedCount };
  };

  const setBudget = (category: string, monthlyLimit: number) => {
    setBudgets((prev) => {
      const existingIndex = prev.findIndex(
        (b) => b.category.toLowerCase() === category.toLowerCase()
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], monthlyLimit };
        return updated;
      }
      return [
        ...prev,
        {
          id: `b-${Date.now()}`,
          category,
          monthlyLimit,
        },
      ];
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number, account: AccountType = 'Checking') => {
    if (amount <= 0) return;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newCurrent = Math.min(g.targetAmount, g.currentAmount + amount);
          return { ...g, currentAmount: newCurrent };
        }
        return g;
      })
    );

    // Also log an automated transfer transaction for financial integrity
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      addTransaction({
        date: new Date().toISOString().split('T')[0],
        amount,
        type: 'transfer',
        category: 'Investment & Dividends',
        merchant: `Savings: ${goal.title}`,
        account,
        notes: `Direct contribution to savings goal: ${goal.title}`,
      });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const setFilters = (updates: Partial<TransactionFilters>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilterState(defaultFilters);
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setGoals(INITIAL_GOALS);
    setProfile(INITIAL_USER_PROFILE);
    setFilterState(defaultFilters);
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setProfile((prev) => ({ ...prev, isDemoMode: false }));
    setFilterState(defaultFilters);
  };

  const exportDataJSON = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      budgets,
      goals,
      transactions,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (Array.isArray(data.budgets)) setBudgets(data.budgets);
      if (Array.isArray(data.goals)) setGoals(data.goals);
      if (data.profile) setProfile(data.profile);
      return true;
    } catch (e) {
      console.error('Import JSON failed:', e);
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        goals,
        profile,
        filters,
        filteredTransactions,
        totals,
        monthOverMonth,
        categorySpending,
        budgetProgress,
        overallBudgetProgress,
        recurringExpenses,
        spendingForecast,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        setBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        updateProfile,
        setFilters,
        resetFilters,
        resetToDemoData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
