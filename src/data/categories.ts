export interface CategoryMeta {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  iconName: string;
  type: 'expense' | 'income' | 'both';
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'food-dining',
    name: 'Food & Dining',
    color: '#F97316',
    bgColor: '#FFEDD5',
    iconName: 'Utensils',
    type: 'expense',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    color: '#10B981',
    bgColor: '#D1FAE5',
    iconName: 'ShoppingCart',
    type: 'expense',
  },
  {
    id: 'housing-rent',
    name: 'Housing & Rent',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    iconName: 'Home',
    type: 'expense',
  },
  {
    id: 'utilities-bills',
    name: 'Utilities & Bills',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    iconName: 'Zap',
    type: 'expense',
  },
  {
    id: 'transportation',
    name: 'Transportation',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    iconName: 'Car',
    type: 'expense',
  },
  {
    id: 'shopping-retail',
    name: 'Shopping & Retail',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    iconName: 'ShoppingBag',
    type: 'expense',
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare & Medical',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    iconName: 'HeartPulse',
    type: 'expense',
  },
  {
    id: 'entertainment-leisure',
    name: 'Entertainment & Leisure',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    iconName: 'Film',
    type: 'expense',
  },
  {
    id: 'education',
    name: 'Education',
    color: '#14B8A6',
    bgColor: '#CCFBF1',
    iconName: 'GraduationCap',
    type: 'expense',
  },
  {
    id: 'travel',
    name: 'Travel',
    color: '#0284C7',
    bgColor: '#E0F2FE',
    iconName: 'Plane',
    type: 'expense',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    color: '#A855F7',
    bgColor: '#F3E8FF',
    iconName: 'Repeat',
    type: 'expense',
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    color: '#F43F5E',
    bgColor: '#FFE4E6',
    iconName: 'Sparkles',
    type: 'expense',
  },
  {
    id: 'salary-wages',
    name: 'Salary & Wages',
    color: '#059669',
    bgColor: '#D1FAE5',
    iconName: 'Briefcase',
    type: 'income',
  },
  {
    id: 'freelance-side-gig',
    name: 'Freelance & Side Gig',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    iconName: 'Laptop',
    type: 'income',
  },
  {
    id: 'investment-dividends',
    name: 'Investment & Dividends',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    iconName: 'TrendingUp',
    type: 'income',
  },
  {
    id: 'gifts-donations',
    name: 'Gifts & Donations',
    color: '#D946EF',
    bgColor: '#FAE8FF',
    iconName: 'Gift',
    type: 'both',
  },
  {
    id: 'other',
    name: 'Other',
    color: '#64748B',
    bgColor: '#F1F5F9',
    iconName: 'Tag',
    type: 'both',
  },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type === 'expense' || c.type === 'both').map((c) => c.name);
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type === 'income' || c.type === 'both').map((c) => c.name);

export function getCategoryMeta(name: string): CategoryMeta {
  const match = CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (match) return match;
  return {
    id: 'other',
    name: name || 'Other',
    color: '#64748B',
    bgColor: '#F1F5F9',
    iconName: 'Tag',
    type: 'both',
  };
}
