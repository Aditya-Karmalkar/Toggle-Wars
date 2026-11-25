// Financial Year Month definitions (1 = Apr, 12 = Mar)
export const FY_MONTHS = [
  { no: 1, code: 'Apr', name: 'April' },
  { no: 2, code: 'May', name: 'May' },
  { no: 3, code: 'Jun', name: 'June' },
  { no: 4, code: 'Jul', name: 'July' },
  { no: 5, code: 'Aug', name: 'August' },
  { no: 6, code: 'Sep', name: 'September' },
  { no: 7, code: 'Oct', name: 'October' },
  { no: 8, code: 'Nov', name: 'November' },
  { no: 9, code: 'Dec', name: 'December' },
  { no: 10, code: 'Jan', name: 'January' },
  { no: 11, code: 'Feb', name: 'February' },
  { no: 12, code: 'Mar', name: 'March' },
];

export const FY_MONTH_ORDER: Record<string, number> = {
  Apr: 1, May: 2, Jun: 3, Jul: 4, Aug: 5, Sep: 6,
  Oct: 7, Nov: 8, Dec: 9, Jan: 10, Feb: 11, Mar: 12
};

export type CurrencyFormatType = 'INR_LAKHS' | 'INR_FULL' | 'USD' | 'EUR' | 'GBP';

export const FX_CONFIG: Record<CurrencyFormatType, { symbol: string; rate: number; code: string; label: string }> = {
  INR_LAKHS: { symbol: '₹', rate: 1, code: 'INR', label: 'Indian Lakhs / Crores' },
  INR_FULL: { symbol: '₹', rate: 1, code: 'INR', label: 'Full Indian Rupee' },
  USD: { symbol: '$', rate: 1 / 83.5, code: 'USD', label: 'US Dollar' },
  EUR: { symbol: '€', rate: 1 / 90.5, code: 'EUR', label: 'Euro' },
  GBP: { symbol: '£', rate: 1 / 105.8, code: 'GBP', label: 'British Pound' },
};

let currentCurrencyFormat: CurrencyFormatType = (() => {
  try {
    const saved = localStorage.getItem('gran_asia_currency_format_v1');
    if (saved && (saved === 'INR_LAKHS' || saved === 'INR_FULL' || saved === 'USD' || saved === 'EUR' || saved === 'GBP')) {
      return saved as CurrencyFormatType;
    }
  } catch {}
  return 'INR_LAKHS';
})();

export function setGlobalCurrencyFormat(fmt: CurrencyFormatType): void {
  currentCurrencyFormat = fmt;
  try {
    localStorage.setItem('gran_asia_currency_format_v1', fmt);
  } catch {}
}

export function getGlobalCurrencyFormat(): CurrencyFormatType {
  return currentCurrencyFormat;
}

export function getCurrencySymbol(): string {
  return FX_CONFIG[currentCurrencyFormat]?.symbol || '₹';
}

/**
 * Format currency according to the active global currency configuration.
 * (Maintains backwards compatibility for all formatINR calls)
 */
export function formatINR(val: number | null | undefined, includeSymbol: boolean = true): string {
  if (val === null || val === undefined || isNaN(val)) {
    return includeSymbol ? `${getCurrencySymbol()} 0.00` : '0.00';
  }

  const fmt = currentCurrencyFormat;
  const config = FX_CONFIG[fmt] || FX_CONFIG.INR_LAKHS;
  const converted = val * config.rate;

  if (fmt === 'USD') {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(converted);
    return includeSymbol ? `$ ${formatted}` : formatted;
  }

  if (fmt === 'EUR') {
    const formatted = new Intl.NumberFormat('de-DE', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(converted);
    return includeSymbol ? `€ ${formatted}` : formatted;
  }

  if (fmt === 'GBP') {
    const formatted = new Intl.NumberFormat('en-GB', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(converted);
    return includeSymbol ? `£ ${formatted}` : formatted;
  }

  // INR formats (en-IN)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(val);
  return includeSymbol ? `₹ ${formatted}` : formatted;
}

/**
 * Format compact currency representation according to active currency format.
 * (Maintains backwards compatibility for all formatCompactINR calls)
 */
export function formatCompactINR(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return `${getCurrencySymbol()} 0`;

  const fmt = currentCurrencyFormat;
  const config = FX_CONFIG[fmt] || FX_CONFIG.INR_LAKHS;
  const converted = val * config.rate;
  const absConverted = Math.abs(converted);
  const sign = converted < 0 ? '-' : '';
  const symbol = config.symbol;

  if (fmt === 'INR_LAKHS') {
    const absVal = Math.abs(val);
    if (absVal >= 10000000) {
      return `${sign}₹ ${(absVal / 10000000).toFixed(2)} Cr`;
    } else if (absVal >= 100000) {
      return `${sign}₹ ${(absVal / 100000).toFixed(2)} L`;
    } else if (absVal >= 1000) {
      return `${sign}₹ ${(absVal / 1000).toFixed(1)} K`;
    }
    return `${sign}₹ ${absVal.toFixed(0)}`;
  }

  if (fmt === 'INR_FULL') {
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.abs(val));
    return `${sign}₹ ${formatted}`;
  }

  // USD, EUR, GBP compact formatting (K, M, B)
  if (absConverted >= 1000000) {
    return `${sign}${symbol} ${(absConverted / 1000000).toFixed(2)} M`;
  } else if (absConverted >= 1000) {
    return `${sign}${symbol} ${(absConverted / 1000).toFixed(1)} K`;
  }
  return `${sign}${symbol} ${absConverted.toFixed(0)}`;
}

/**
 * Format percentage with + or - sign
 */
export function formatPercent(val: number | null | undefined, decimals: number = 1): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
}

/**
 * Calculate Growth percentage safely: ((Current - Previous) / Previous) * 100
 * Handles zero previous values gracefully
 */
export function calculateGrowth(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined || previous === 0) {
    return null; // Not applicable or base period
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Format date nicely: '2021-04-03' -> '03 Apr 2021'
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[monthIdx] || parts[1]} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Mask GST number for confidentiality: e.g. '27AAPPG1234F1Z5' -> '27AAP****1Z5'
 */
export function maskGST(gst: string, showFull: boolean = false): string {
  if (!gst || gst.trim() === '') return 'N/A (Unregistered)';
  if (showFull) return gst;
  const clean = gst.trim();
  if (clean.length <= 6) return clean;
  return `${clean.substring(0, 5)}****${clean.substring(clean.length - 3)}`;
}
