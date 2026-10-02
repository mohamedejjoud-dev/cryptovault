import {
  formatCurrency,
  formatLargeNumber,
  formatPercent,
  formatSupply,
  getPriceChangeClass,
  truncate,
} from './formatters';

describe('formatters utility', () => {
  describe('formatCurrency', () => {
    it('returns placeholder for null, undefined, or NaN', () => {
      expect(formatCurrency(null)).toBe('—');
      expect(formatCurrency(undefined)).toBe('—');
      expect(formatCurrency(NaN)).toBe('—');
    });

    it('formats 0 correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats standard prices (>= $1) to 2 decimals', () => {
      expect(formatCurrency(1234.567)).toBe('$1,234.57');
      expect(formatCurrency(1.5)).toBe('$1.50');
      expect(formatCurrency(68500)).toBe('$68,500.00');
    });

    it('formats small prices ($0.1 to <$1) with 4 decimals', () => {
      expect(formatCurrency(0.56789)).toBe('$0.5679');
    });

    it('formats very small prices ($0.01 to <$0.1) with 5 decimals', () => {
      expect(formatCurrency(0.054321)).toBe('$0.05432');
    });

    it('formats micro prices (<$0.01) with up to 6 significant digits', () => {
      const res = formatCurrency(0.000123456);
      expect(res).toContain('0.000123456');
    });
  });

  describe('formatLargeNumber', () => {
    it('handles null, undefined, and NaN', () => {
      expect(formatLargeNumber(null)).toBe('—');
      expect(formatLargeNumber(undefined)).toBe('—');
      expect(formatLargeNumber(NaN)).toBe('—');
    });

    it('formats trillions, billions, millions, and thousands', () => {
      expect(formatLargeNumber(2.5e12)).toBe('$2.50T');
      expect(formatLargeNumber(1.23e9)).toBe('$1.23B');
      expect(formatLargeNumber(45.6e6)).toBe('$45.60M');
      expect(formatLargeNumber(7.8e3)).toBe('$7.80K');
      expect(formatLargeNumber(500)).toBe('$500.00');
    });
  });

  describe('formatPercent', () => {
    it('handles null, undefined, and NaN', () => {
      expect(formatPercent(null)).toBe('—');
      expect(formatPercent(undefined)).toBe('—');
      expect(formatPercent(NaN)).toBe('—');
    });

    it('prepends + for positive values and keeps - for negative values', () => {
      expect(formatPercent(5.241)).toBe('+5.24%');
      expect(formatPercent(0)).toBe('+0.00%');
      expect(formatPercent(-3.1415)).toBe('-3.14%');
    });
  });

  describe('formatSupply', () => {
    it('handles null, undefined, and NaN', () => {
      expect(formatSupply(null)).toBe('—');
      expect(formatSupply(undefined)).toBe('—');
      expect(formatSupply(NaN)).toBe('—');
    });

    it('formats numbers with thousands separators and no fractions', () => {
      expect(formatSupply(19750000)).toBe('19,750,000');
      expect(formatSupply(21000000.5)).toBe('21,000,001');
    });
  });

  describe('getPriceChangeClass', () => {
    it('returns empty string for null, undefined, or NaN', () => {
      expect(getPriceChangeClass(null)).toBe('');
      expect(getPriceChangeClass(undefined)).toBe('');
      expect(getPriceChangeClass(NaN)).toBe('');
    });

    it('returns positive for >= 0, negative for < 0', () => {
      expect(getPriceChangeClass(1.5)).toBe('positive');
      expect(getPriceChangeClass(0)).toBe('positive');
      expect(getPriceChangeClass(-0.01)).toBe('negative');
    });
  });

  describe('truncate', () => {
    it('returns empty string if falsy', () => {
      expect(truncate(null)).toBe('');
      expect(truncate('')).toBe('');
    });

    it('returns original string if within limit', () => {
      expect(truncate('Hello world', 20)).toBe('Hello world');
    });

    it('truncates and adds ellipsis if over limit', () => {
      expect(truncate('Bitcoin is a decentralized cryptocurrency', 10)).toBe('Bitcoin is…');
    });
  });
});
