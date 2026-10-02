import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CoinTable from '../components/CoinTable';
import Skeleton from '../components/Skeleton';
import ErrorMessage from '../components/ErrorMessage';
import { useCoins, useGlobalStats } from '../hooks/useCryptoData';
import {
  formatCurrency,
  formatLargeNumber,
  formatPercent,
  getPriceChangeClass,
} from '../utils/formatters';
import '../styles/HomePage.css';

/**
 * Quick-glance Market Highlights cards (inspired by CoinMarketCap / CoinGecko).
 * Automatically derived from the active 100-coin dataset.
 */
const MarketHighlights = ({ coins }) => {
  const navigate = useNavigate();

  const highlights = useMemo(() => {
    if (!coins || coins.length === 0) return null;

    // Top Gainer (24h)
    const topGainer = [...coins]
      .filter((c) => typeof c.price_change_percentage_24h === 'number')
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0];

    // Top Volume (24h)
    const topVolume = [...coins]
      .filter((c) => typeof c.total_volume === 'number')
      .sort((a, b) => b.total_volume - a.total_volume)[0];

    // Market Leader (Rank 1 / Bitcoin)
    const leader = coins.find((c) => c.market_cap_rank === 1) || coins[0];

    return { topGainer, topVolume, leader };
  }, [coins]);

  if (!highlights) return null;

  const { topGainer, topVolume, leader } = highlights;

  return (
    <section className="market-highlights" aria-label="Market Highlights">
      {/* Card 1: Market Leader */}
      {leader && (
        <div
          className="highlight-card"
          onClick={() => navigate(`/coin/${leader.id}`)}
          role="button"
          tabIndex={0}
          aria-label={`View ${leader.name} details`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`/coin/${leader.id}`);
            }
          }}
        >
          <div className="highlight-card__header">
            <span className="highlight-card__tag">👑 Market Leader</span>
            <span className="highlight-card__action">View ↗</span>
          </div>
          <div className="highlight-card__body">
            <img
              src={leader.image}
              alt=""
              width={28}
              height={28}
              className="highlight-card__icon"
              loading="lazy"
            />
            <div className="highlight-card__info">
              <span className="highlight-card__name">{leader.name}</span>
              <span className="highlight-card__symbol">{leader.symbol?.toUpperCase()}</span>
            </div>
          </div>
          <div className="highlight-card__footer">
            <span className="highlight-card__price tabular-num">
              {formatCurrency(leader.current_price)}
            </span>
            <span
              className={`highlight-card__change tabular-num ${getPriceChangeClass(
                leader.price_change_percentage_24h,
              )}`}
            >
              {formatPercent(leader.price_change_percentage_24h)}
            </span>
          </div>
        </div>
      )}

      {/* Card 2: Top 24h Gainer */}
      {topGainer && (
        <div
          className="highlight-card"
          onClick={() => navigate(`/coin/${topGainer.id}`)}
          role="button"
          tabIndex={0}
          aria-label={`View ${topGainer.name} details`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`/coin/${topGainer.id}`);
            }
          }}
        >
          <div className="highlight-card__header">
            <span className="highlight-card__tag">🚀 Top 24h Gainer</span>
            <span className="highlight-card__action">View ↗</span>
          </div>
          <div className="highlight-card__body">
            <img
              src={topGainer.image}
              alt=""
              width={28}
              height={28}
              className="highlight-card__icon"
              loading="lazy"
            />
            <div className="highlight-card__info">
              <span className="highlight-card__name">{topGainer.name}</span>
              <span className="highlight-card__symbol">{topGainer.symbol?.toUpperCase()}</span>
            </div>
          </div>
          <div className="highlight-card__footer">
            <span className="highlight-card__price tabular-num">
              {formatCurrency(topGainer.current_price)}
            </span>
            <span
              className={`highlight-card__change tabular-num ${getPriceChangeClass(
                topGainer.price_change_percentage_24h,
              )}`}
            >
              {formatPercent(topGainer.price_change_percentage_24h)}
            </span>
          </div>
        </div>
      )}

      {/* Card 3: Top Trading Volume */}
      {topVolume && (
        <div
          className="highlight-card"
          onClick={() => navigate(`/coin/${topVolume.id}`)}
          role="button"
          tabIndex={0}
          aria-label={`View ${topVolume.name} details`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              navigate(`/coin/${topVolume.id}`);
            }
          }}
        >
          <div className="highlight-card__header">
            <span className="highlight-card__tag">🔥 Top 24h Volume</span>
            <span className="highlight-card__action">View ↗</span>
          </div>
          <div className="highlight-card__body">
            <img
              src={topVolume.image}
              alt=""
              width={28}
              height={28}
              className="highlight-card__icon"
              loading="lazy"
            />
            <div className="highlight-card__info">
              <span className="highlight-card__name">{topVolume.name}</span>
              <span className="highlight-card__symbol">{topVolume.symbol?.toUpperCase()}</span>
            </div>
          </div>
          <div className="highlight-card__footer">
            <span className="highlight-card__price tabular-num">
              Vol: {formatLargeNumber(topVolume.total_volume)}
            </span>
            <span
              className={`highlight-card__change tabular-num ${getPriceChangeClass(
                topVolume.price_change_percentage_24h,
              )}`}
            >
              {formatPercent(topVolume.price_change_percentage_24h)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { coins, loading, error, refetch } = useCoins(100);
  const { stats } = useGlobalStats();

  const mcapTotal = stats?.total_market_cap?.usd;
  const mcapChange = stats?.market_cap_change_percentage_24h_usd;
  const isMcapUp = mcapChange !== undefined && mcapChange >= 0;

  return (
    <main className="markets-page">
      <div className="container">
        {/* Page Header */}
        <header className="markets-header">
          <div className="markets-header__titles">
            <h1 className="markets-header__title">
              Today&apos;s Cryptocurrency Prices by Market Cap
            </h1>
            <p className="markets-header__description">
              {mcapTotal ? (
                <>
                  The global cryptocurrency market cap today is{' '}
                  <strong className="markets-header__highlight">
                    {formatLargeNumber(mcapTotal)}
                  </strong>
                  , a{' '}
                  <span className={`tabular-num ${isMcapUp ? 'positive' : 'negative'}`}>
                    {formatPercent(mcapChange)}
                  </span>{' '}
                  {isMcapUp ? 'increase' : 'decrease'} over the last 24 hours.
                </>
              ) : (
                'Real-time valuation, 24-hour trading volumes, and 7-day price movements for top digital assets.'
              )}
            </p>
          </div>
        </header>

        {/* Highlights Bar */}
        {!loading && !error && coins.length > 0 && (
          <MarketHighlights coins={coins} />
        )}

        {/* Loading State */}
        {loading && <Skeleton rows={12} />}

        {/* Error State */}
        {error && !loading && (
          <ErrorMessage
            message={error}
            onRetry={refetch}
          />
        )}

        {/* Coin Table */}
        {!loading && !error && coins.length > 0 && (
          <CoinTable
            coins={coins}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={refetch}
          />
        )}
      </div>
    </main>
  );
};

export default HomePage;
