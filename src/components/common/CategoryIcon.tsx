import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Zap,
  Car,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  Plane,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Tag,
  Repeat,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Wallet,
  Landmark,
  LucideIcon,
} from 'lucide-react';
import { getCategoryMeta } from '../../data/categories';

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  ShoppingCart,
  Home,
  Zap,
  Car,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  Plane,
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  Tag,
  Repeat,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Wallet,
  Landmark,
};

interface CategoryIconProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showBackground?: boolean;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 'md',
  className = '',
  showBackground = true,
}) => {
  const meta = getCategoryMeta(category);
  const IconComponent = iconMap[meta.iconName] || Tag;

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  if (!showBackground) {
    return (
      <IconComponent
        size={iconSizes[size]}
        style={{ color: meta.color }}
        className={className}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl font-medium shrink-0 shadow-xs ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.color,
      }}
    >
      <IconComponent size={iconSizes[size]} />
    </div>
  );
};
