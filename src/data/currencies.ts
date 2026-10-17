import { CurrencyConfig } from '../types/finance';

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    position: 'prefix',
  },
  BDT: {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    locale: 'en-BD',
    position: 'prefix',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    position: 'prefix',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    position: 'prefix',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
    position: 'prefix',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    position: 'prefix',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    locale: 'en-AU',
    position: 'prefix',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    locale: 'ja-JP',
    position: 'prefix',
  },
};

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options: { compact?: boolean; hideDecimals?: boolean } = {}
): string {
  const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
  const num = Number(amount) || 0;

  if (options.compact && Math.abs(num) >= 1000) {
    if (Math.abs(num) >= 1000000) {
      return `${config.symbol}${(num / 1000000).toFixed(1)}M`;
    }
    return `${config.symbol}${(num / 1000).toFixed(1)}k`;
  }

  const fractionDigits = options.hideDecimals || currencyCode === 'JPY' ? 0 : 2;

  try {
    const formattedNum = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(Math.abs(num));

    const sign = num < 0 ? '-' : '';
    return config.position === 'prefix'
      ? `${sign}${config.symbol}${formattedNum}`
      : `${sign}${formattedNum} ${config.symbol}`;
  } catch {
    const sign = num < 0 ? '-' : '';
    return `${sign}${config.symbol}${Math.abs(num).toFixed(fractionDigits)}`;
  }
}
