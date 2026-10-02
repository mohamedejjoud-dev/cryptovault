import { useState, useEffect, useCallback } from 'react';
import { fetchCoins, fetchCoinDetail, fetchGlobalStats } from '../services/cryptoApi';

/** Polls the top-N coins market list every 60 seconds. */
export const useCoins = (perPage = 100) => {
  const [coins, setCoins]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCoins(perPage);
      setCoins(data);
    } catch (err) {
      setError(err.message ?? 'Failed to load market data.');
    } finally {
      setLoading(false);
    }
  }, [perPage]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  return { coins, loading, error, refetch: load };
};

/** Fetches and caches full coin details for a given coin ID. */
export const useCoinDetail = (coinId) => {
  const [coin, setCoin]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    if (!coinId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCoinDetail(coinId);
      setCoin(data);
    } catch (err) {
      setError(err.message ?? 'Failed to load coin details.');
    } finally {
      setLoading(false);
    }
  }, [coinId]);

  useEffect(() => {
    load();
  }, [load]);

  return { coin, loading, error, refetch: load };
};

/** Fetches global market statistics once on mount. */
export const useGlobalStats = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchGlobalStats();
        if (isMounted) setStats(data);
      } catch (err) {
        if (isMounted) setError(err.message ?? 'Failed to load global stats.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, loading, error };
};
