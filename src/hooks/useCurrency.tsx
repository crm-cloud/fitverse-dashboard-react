import { useSystemSetting } from './useSystemSettings';

export const useCurrency = () => {
  const currency = useSystemSetting('general', 'currency');
  
  const getCurrencySymbol = (currencyCode?: string) => {
    const code = currencyCode || currency || 'USD';
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'SEK': 'kr',
      'NZD': 'NZ$'
    };
    return symbols[code] || '$';
  };

  const formatCurrency = (amount: number, currencyCode?: string) => {
    const code = currencyCode || currency || 'USD';
    const symbol = getCurrencySymbol(code);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'symbol'
    }).format(amount).replace(/^[^\d-]*/, symbol);
  };

  return {
    currency: currency || 'USD',
    symbol: getCurrencySymbol(),
    formatCurrency,
    getCurrencySymbol
  };
};