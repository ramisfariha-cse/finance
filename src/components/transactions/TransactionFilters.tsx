import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import { TransactionType, DateRangeOption } from '../../types/finance';

export const TransactionFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useFinance();

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
      {/* Search and Main Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Search merchant, notes, amount..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="lg:col-span-2">
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters({ type: e.target.value as 'all' | TransactionType })
            }
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
            <option value="transfer">Transfers</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-3">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ category: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Filter */}
        <div className="lg:col-span-2">
          <select
            value={filters.account}
            onChange={(e) => setFilters({ account: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none font-medium cursor-pointer"
          >
            <option value="all">All Accounts</option>
            <option value="Checking">Checking</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Cash">Cash</option>
            <option value="Savings">Savings</option>
          </select>
        </div>

        {/* Reset Filters */}
        <div className="lg:col-span-1 flex items-center">
          <button
            type="button"
            onClick={resetFilters}
            title="Reset filters"
            className="w-full h-full min-h-[34px] flex items-center justify-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sort row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({
                sortBy: e.target.value as
                  | 'date-desc'
                  | 'date-asc'
                  | 'amount-desc'
                  | 'amount-asc',
              })
            }
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="date-desc">Newest Date First</option>
            <option value="date-asc">Oldest Date First</option>
            <option value="amount-desc">Highest Amount First</option>
            <option value="amount-asc">Lowest Amount First</option>
          </select>
        </div>
      </div>
    </div>
  );
};
