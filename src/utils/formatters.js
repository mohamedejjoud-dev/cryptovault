/**
 * Format a USD price with smart decimal precision.
 * - Values ≥ $1   → 2 decimal places  ($42,345.67)
 * - Values ≥ $0.1 → 4 decimal places  ($0.1234)
 * - Values ≥ $0.01 → 5 decimal places ($0.01234)
 * - Very small    → 6 significant figures  ($0.0000012)
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  if (value === 0) return '$0.00';

  const abs = Math.abs(value);
  let decimals = 2;

  if (abs < 0.01) {
    // Very small — show up to 6 significant figures
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumSignificantDigits: 1,
      maximumSignificantDigits: 6,
    }).format(value);
  } else if (abs < 0.1) {
    decimals = 5;
  } else if (abs < 1) {
    decimals = 4;
  } else {
    decimals = 2;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Compact-format a large USD value (market cap, volume, etc.)
 */
export const formatLargeNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`;
  if (abs >= 1e3)  return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

/**
 * Format a percentage change with an explicit + sign for positive values.
 */
export const formatPercent = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Format a large supply number without decimal places.
 */
export const formatSupply = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
};

/**
 * Return a CSS class name for a positive/negative value.
 * Returns empty string when value is null/undefined/NaN.
 */
export const getPriceChangeClass = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return value >= 0 ? 'positive' : 'negative';
};

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export const truncate = (str, maxLength = 120) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}\u2026` : str;
};
