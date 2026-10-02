import React from 'react';
import { useGlobalStats } from '../hooks/useCryptoData';
import {
  formatLargeNumber,
  formatPercent,
  getPriceChangeClass,
} from '../utils/formatters';
import '../styles/GlobalStats.css';

/**
 * Top ticker strip showing global cryptocurrency market statistics.
 * Mimics CoinMarketCap and CoinGecko's institutional header bar.
 */
const GlobalStats = () => {
  const { stats, loading } = useGlobalStats();

  if (loading || !stats) {
    return (
      <div className="market-summary market-summary--loading" aria-hidden="true">
        <div className="container market-summary__inner">
          <span className="market-summary__loading-text">Loading market data…</span>
        </div>
      </div>
    );
  }

  const mcapChange = stats.market_cap_change_percentage_24h_usd;
  const isMcapPositive = mcapChange !== undefined && mcapChange >= 0;

  return (
    <div className="market-summary" role="region" aria-label="Global cryptocurrency market overview">
      <div className="container market-summary__inner">
        {/* Cryptos */}
        <div className="market-summary__item">
          <span className="market-summary__label">Cryptos:</span>
          <span className="market-summary__value tabular-num">
            {stats.active_cryptocurrencies?.toLocaleString()}
          </span>
        </div>

        <span className="market-summary__sep" aria-hidden="true">•</span>

        {/* Markets / Exchanges */}
        {stats.markets !== undefined && (
          <>
            <div className="market-summary__item">
              <span className="market-summary__label">Exchanges:</span>
              <span className="market-summary__value tabular-num">
                {stats.markets?.toLocaleString()}
              </span>
            </div>
            <span className="market-summary__sep" aria-hidden="true">•</span>
          </>
        )}

        {/* Total Market Cap */}
        <div className="market-summary__item">
          <span className="market-summary__label">Market Cap:</span>
          <span className="market-summary__value tabular-num">
            {formatLargeNumber(stats.total_market_cap?.usd)}
          </span>
          {mcapChange !== undefined && (
            <span className={`market-summary__badge tabular-num ${getPriceChangeClass(mcapChange)}`}>
              {isMcapPositive ? '▲' : '▼'} {formatPercent(Math.abs(mcapChange))}
            </span>
          )}
        </div>

        <span className="market-summary__sep" aria-hidden="true">•</span>

        {/* 24h Trading Volume */}
        <div className="market-summary__item">
          <span className="market-summary__label">24h Vol:</span>
          <span className="market-summary__value tabular-num">
            {formatLargeNumber(stats.total_volume?.usd)}
          </span>
        </div>

        <span className="market-summary__sep" aria-hidden="true">•</span>

        {/* Dominance */}
        <div className="market-summary__item">
          <span className="market-summary__label">Dominance:</span>
          <span className="market-summary__value tabular-num">
            BTC&nbsp;<strong className="market-summary__strong">{stats.market_cap_percentage?.btc?.toFixed(1)}%</strong>
          </span>
          <span className="market-summary__sub-value tabular-num">
            ETH&nbsp;<strong className="market-summary__strong">{stats.market_cap_percentage?.eth?.toFixed(1)}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalStats;
