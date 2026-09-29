/**
 * src/services/cryptoApi.js
 *
 * Centralized API service for CoinGecko.
 * All API calls go through this module — keeping concerns separated
 * and making it trivial to swap providers later.
 */

import axios from 'axios';

// ── Axios Instance ──────────────────────────────────────────────────────────

const BASE_URL = 'https://api.coingecko.com/api/v3';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    // API key injected from environment variable — never hardcoded
    ...(process.env.REACT_APP_COINGECKO_API_KEY && {
      'x-cg-demo-api-key': process.env.REACT_APP_COINGECKO_API_KEY,
    }),
  },
});

// ── Response Interceptor: Normalize Errors ──────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── API Methods ─────────────────────────────────────────────────────────────

/**
 * Fetch the top N coins by market cap.
 * @param {number} perPage - Results per page (default: 50)
 * @param {number} page    - Page number (default: 1)
 */
export const fetchCoins = async (perPage = 50, page = 1) => {
  const { data } = await apiClient.get('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: perPage,
      page,
      sparkline: true,
      price_change_percentage: '1h,24h,7d',
    },
  });
  return data;
};

/**
 * Fetch detailed data for a single coin.
 * @param {string} coinId - CoinGecko coin ID (e.g. "bitcoin")
 */
export const fetchCoinDetail = async (coinId) => {
  if (!coinId) throw new Error('Coin ID is required');
  const safeId = encodeURIComponent(String(coinId).trim());
  const { data } = await apiClient.get(`/coins/${safeId}`, {
    params: {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: true,
    },
  });
  return data;
};

/**
 * Fetch OHLC chart data for a coin.
 * @param {string} coinId - CoinGecko coin ID
 * @param {number} days   - Time range in days (1, 7, 14, 30, 90, 180, 365)
 */
export const fetchCoinOhlc = async (coinId, days = 7) => {
  if (!coinId) throw new Error('Coin ID is required');
  const safeId = encodeURIComponent(String(coinId).trim());
  const { data } = await apiClient.get(`/coins/${safeId}/ohlc`, {
    params: { vs_currency: 'usd', days },
  });
  return data;
};

/**
 * Fetch global crypto market stats.
 */
export const fetchGlobalStats = async () => {
  const { data } = await apiClient.get('/global');
  return data.data;
};

/**
 * Search coins by query string.
 * @param {string} query
 */
export const searchCoins = async (query) => {
  const { data } = await apiClient.get('/search', { params: { query } });
  return data;
};
