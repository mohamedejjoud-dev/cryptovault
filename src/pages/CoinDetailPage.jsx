/**
 * src/pages/CoinDetailPage.jsx
 *
 * Detailed view for a single cryptocurrency.
 * Shows: price, 24h/7d/30d changes, market stats, price ranges,
 *        description, and external links.
 */

import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCoinDetail } from '../hooks/useCryptoData';
import ErrorMessage from '../components/ErrorMessage';
import Sparkline from '../components/Sparkline';
import {
  formatCurrency,
  formatLargeNumber,
  formatPercent,
  formatSupply,
  getPriceChangeClass,
} from '../utils/formatters';
import '../styles/CoinDetailPage.css';

// ── Sub-component: single stat card ──────────────────────────────────────────

const StatCard = ({ label, value, valueClass, sub }) => (
  <div className="stat-card">
    <div className="stat-card__label">{label}</div>
    <div className={`stat-card__value ${valueClass || ''}`}>{value}</div>
    {sub && <div className="stat-card__sub">{sub}</div>}
  </div>
);

// ── Sub-component: price range bar ───────────────────────────────────────────

const RangeBar = ({ label, low, high, current }) => {
  const pct = useMemo(() => {
    if (!low || !high || low === high) return 0;
    return Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  }, [low, high, current]);

  return (
    <div>
      <div className="range-bar-row">
        <span className="range-bar-row__label">{label}</span>
        <div style={{ flex: 1 }}>
          <div className="range-bar-track">
            <div className="range-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="range-bar-row__prices">
            <span>{formatCurrency(low)}</span>
            <span>{formatCurrency(high)}</span>
          </div>
        </div>
        <span className="range-bar-row__current">{pct.toFixed(0)}% of range</span>
      </div>
    </div>
  );
};

// ── Sanitize external URLs against javascript: or invalid schemes ─────────────
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
};

// ── Strip HTML tags safely from descriptions ──────────────────────────────────
const stripHtml = (html) => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch {
    return html.replace(/<[^>]+>/g, '').trim();
  }
};

// ── Main Component ────────────────────────────────────────────────────────────

const CoinDetailPage = () => {
  const { coinId } = useParams();
  const navigate   = useNavigate();
  const { coin, loading, error, refetch } = useCoinDetail(coinId);

  // Loading state
  if (loading) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="detail-loading" aria-label="Loading coin details">
            <div className="detail-spinner" aria-hidden="true" />
            <span>Loading {coinId}…</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="detail-page">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <ErrorMessage message={error} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!coin) return null;

  const md = coin.market_data;
  const change24h = md?.price_change_percentage_24h;
  const change7d  = md?.price_change_percentage_7d;
  const change30d = md?.price_change_percentage_30d;
  const change1y  = md?.price_change_percentage_1y;
  const currentPrice = md?.current_price?.usd;

  const description = stripHtml(coin.description?.en);

  return (
    <main className="detail-page">
      <div className="container">

        {/* Back navigation */}
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          ← Back to Markets
        </button>

        {/* ── Header: identity + current price ── */}
        <div className="detail-header">
          <div className="detail-header__identity">
            <img
              className="detail-header__logo"
              src={coin.image?.large}
              alt={coin.name}
              width={56}
              height={56}
            />
            <div>
              <h1 className="detail-header__name">{coin.name}</h1>
              <div className="detail-header__symbol">{coin.symbol?.toUpperCase()}</div>
              {md?.market_cap_rank && (
                <div className="detail-header__rank">
                  Rank #{md.market_cap_rank}
                </div>
              )}
            </div>
          </div>

          <div className="detail-header__price-block">
            <div className="detail-price">
              {formatCurrency(currentPrice)}
            </div>
            <div className={`detail-price-change ${getPriceChangeClass(change24h)}`}>
              {change24h >= 0 ? '▲' : '▼'} {formatPercent(change24h)} (24h)
            </div>
          </div>
        </div>

        {/* ── 7-day sparkline ── */}
        {coin.market_data?.sparkline_7d?.price && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.75rem',
            }}>
              7-Day Price Chart
            </div>
            <Sparkline
              data={coin.market_data.sparkline_7d.price}
              isPositive={change7d >= 0}
              width={700}
              height={100}
              responsive={true}
            />
          </div>
        )}

        {/* ── Stats grid ── */}
        <div className="detail-stats-grid">
          <StatCard
            label="Market Cap"
            value={formatLargeNumber(md?.market_cap?.usd)}
          />
          <StatCard
            label="Fully Diluted MCap"
            value={formatLargeNumber(md?.fully_diluted_valuation?.usd)}
          />
          <StatCard
            label="24h Volume"
            value={formatLargeNumber(md?.total_volume?.usd)}
          />
          <StatCard
            label="Circulating Supply"
            value={`${formatSupply(md?.circulating_supply)} ${coin.symbol?.toUpperCase()}`}
          />
          <StatCard
            label="Total Supply"
            value={md?.total_supply ? `${formatSupply(md.total_supply)} ${coin.symbol?.toUpperCase()}` : '∞'}
          />
          <StatCard
            label="Max Supply"
            value={md?.max_supply ? `${formatSupply(md.max_supply)} ${coin.symbol?.toUpperCase()}` : '∞'}
          />
          <StatCard
            label="7d Change"
            value={formatPercent(change7d)}
            valueClass={getPriceChangeClass(change7d)}
          />
          <StatCard
            label="30d Change"
            value={formatPercent(change30d)}
            valueClass={getPriceChangeClass(change30d)}
          />
          <StatCard
            label="1y Change"
            value={formatPercent(change1y)}
            valueClass={getPriceChangeClass(change1y)}
          />
          <StatCard
            label="All-Time High"
            value={formatCurrency(md?.ath?.usd)}
            sub={md?.ath_date?.usd ? new Date(md.ath_date.usd).toLocaleDateString() : ''}
          />
          <StatCard
            label="ATH Change"
            value={formatPercent(md?.ath_change_percentage?.usd)}
            valueClass={getPriceChangeClass(md?.ath_change_percentage?.usd)}
          />
          <StatCard
            label="All-Time Low"
            value={formatCurrency(md?.atl?.usd)}
            sub={md?.atl_date?.usd ? new Date(md.atl_date.usd).toLocaleDateString() : ''}
          />
        </div>

        {/* ── Price Range Bars ── */}
        <section className="range-section" aria-label="Price ranges">
          <div className="range-section__title">Price Ranges</div>
          <RangeBar
            label="24h"
            low={md?.low_24h?.usd}
            high={md?.high_24h?.usd}
            current={currentPrice}
          />
          <RangeBar
            label="ATH"
            low={md?.atl?.usd}
            high={md?.ath?.usd}
            current={currentPrice}
          />
        </section>

        {/* ── Description ── */}
        {description && (
          <section className="detail-description">
            <h2 className="detail-description__title">About {coin.name}</h2>
            <p className="detail-description__text">
              {description.length > 800
                ? `${description.slice(0, 800)}…`
                : description}
            </p>
          </section>
        )}

        {/* ── External Links ── */}
        <div className="detail-links" aria-label="External links">
          {sanitizeUrl(coin.links?.homepage?.[0]) && (
            <a
              className="detail-link"
              href={sanitizeUrl(coin.links.homepage[0])}
              target="_blank"
              rel="noopener noreferrer"
            >
              🌐 Website
            </a>
          )}
          {sanitizeUrl(coin.links?.whitepaper) && (
            <a
              className="detail-link"
              href={sanitizeUrl(coin.links.whitepaper)}
              target="_blank"
              rel="noopener noreferrer"
            >
              📄 Whitepaper
            </a>
          )}
          {sanitizeUrl(coin.links?.blockchain_site?.filter(Boolean)?.[0]) && (
            <a
              className="detail-link"
              href={sanitizeUrl(coin.links.blockchain_site.filter(Boolean)[0])}
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 Explorer
            </a>
          )}
          {sanitizeUrl(coin.links?.repos_url?.github?.[0]) && (
            <a
              className="detail-link"
              href={sanitizeUrl(coin.links.repos_url.github[0])}
              target="_blank"
              rel="noopener noreferrer"
            >
              ⌥ GitHub
            </a>
          )}
          {coin.links?.twitter_screen_name && (
            <a
              className="detail-link"
              href={`https://twitter.com/${encodeURIComponent(coin.links.twitter_screen_name.replace(/^@/, ''))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              𝕏 Twitter
            </a>
          )}
          {sanitizeUrl(coin.links?.subreddit_url) && (
            <a
              className="detail-link"
              href={sanitizeUrl(coin.links.subreddit_url)}
              target="_blank"
              rel="noopener noreferrer"
            >
              📢 Reddit
            </a>
          )}
        </div>

      </div>
    </main>
  );
};

export default CoinDetailPage;
