import axios from 'axios';

// ---------------------------------------------------------------------------
// Axios instance — base URL and optional API key from environment
// ---------------------------------------------------------------------------
const apiClient = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    // Conditionally inject the API key only when it is provided.
    // The key is read from .env and NEVER hard-coded here.
    ...(process.env.REACT_APP_COINGECKO_API_KEY && {
      'x-cg-demo-api-key': process.env.REACT_APP_COINGECKO_API_KEY,
    }),
  },
});

// ---------------------------------------------------------------------------
// Global response interceptor — normalise error messages
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      return Promise.reject(
        new Error('CoinGecko API rate limit reached. Please wait a minute and click Refresh or try again.')
      );
    }
    const message =
      error.response?.data?.status?.error_message ??
      error.response?.data?.error ??
      error.message ??
      'An unexpected error occurred while communicating with the market data provider.';
    return Promise.reject(new Error(message));
  },
);

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/**
 * Fetch the top-N coins ordered by market cap.
 * Requests 1h, 24h, and 7d price change percentages plus sparkline data.
 *
 * @param {number} perPage - Number of coins to return (max 250 for demo key).
 * @param {number} page    - Page number (1-indexed).
 */
export const fetchCoins = async (perPage = 100, page = 1) => {
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
 * Fetch full detail for a single coin.
 *
 * @param {string} coinId - The CoinGecko coin ID (e.g. "bitcoin").
 */
export const fetchCoinDetail = async (coinId) => {
  if (!coinId) throw new Error('Coin ID is required.');
  // Sanitise the ID to prevent path-traversal or injection via the URL segment
  const safeId = encodeURIComponent(String(coinId).trim());
  const { data } = await apiClient.get(`/coins/${safeId}`, {
    params: {
      localization:     false,
      tickers:          false,
      market_data:      true,
      community_data:   false,
      developer_data:   false,
      sparkline:        true,
    },
  });
  return data;
};

/**
 * Fetch OHLC candlestick data for a coin.
 *
 * @param {string} coinId - CoinGecko coin ID.
 * @param {number} days   - Number of days of data (1, 7, 14, 30, 90, 180, 365).
 */
export const fetchCoinOhlc = async (coinId, days = 7) => {
  if (!coinId) throw new Error('Coin ID is required.');
  const safeId = encodeURIComponent(String(coinId).trim());
  const { data } = await apiClient.get(`/coins/${safeId}/ohlc`, {
    params: { vs_currency: 'usd', days },
  });
  return data;
};

/**
 * Fetch global cryptocurrency market statistics.
 */
export const fetchGlobalStats = async () => {
  const { data } = await apiClient.get('/global');
  return data.data;
};

/**
 * Search for coins, exchanges, and categories by keyword.
 *
 * @param {string} query - The search term.
 */
export const searchCoins = async (query) => {
  const { data } = await apiClient.get('/search', { params: { query } });
  return data;
};
