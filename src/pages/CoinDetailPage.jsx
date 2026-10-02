import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import { sanitizeUrl, stripHtml } from '../utils/security';
import '../styles/CoinDetailPage.css';

// ---------------------------------------------------------------------------
// External Link Component (Enforces noopener noreferrer)
// ---------------------------------------------------------------------------
const ExternalLink = ({ href, children }) => {
  const safe = sanitizeUrl(href);
  if (!safe) return null;
  return (
    <a
      className="detail-link-btn"
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{children}</span>
      <span className="detail-link-arrow" aria-hidden="true">↗</span>
    </a>
  );
};

// ---------------------------------------------------------------------------
// Interactive Crypto-to-USD Converter Widget (CoinMarketCap style)
// ---------------------------------------------------------------------------
const CryptoConverter = ({ coinName, symbol, priceUsd }) => {
  const [cryptoAmount, setCryptoAmount] = useState('1');
  const [usdAmount, setUsdAmount] = useState(() => (priceUsd ? priceUsd.toString() : ''));

  if (!priceUsd || priceUsd <= 0) return null;

  const handleCryptoChange = (e) => {
    const val = e.target.value;
    setCryptoAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setUsdAmount((num * priceUsd).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  const handleUsdChange = (e) => {
    const val = e.target.value;
    setUsdAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCryptoAmount((num / priceUsd).toFixed(6).replace(/\.?0+$/, ''));
    } else {
      setCryptoAmount('');
    }
  };

  return (
    <div className="converter-card" aria-label="Currency converter">
      <h3 className="converter-title">
        {coinName} to USD Converter
      </h3>
      <div className="converter-inputs">
        <div className="converter-field">
          <label htmlFor="conv-crypto" className="converter-label">
            {symbol?.toUpperCase()}
          </label>
          <input
            id="conv-crypto"
            type="number"
            min="0"
            step="any"
            value={cryptoAmount}
            onChange={handleCryptoChange}
            className="converter-input tabular-num"
            aria-label={`Amount in ${symbol}`}
          />
        </div>

        <span className="converter-sep" aria-hidden="true">⇄</span>

        <div className="converter-field">
          <label htmlFor="conv-usd" className="converter-label">
            USD ($)
          </label>
          <input
            id="conv-usd"
            type="number"
            min="0"
            step="any"
            value={usdAmount}
            onChange={handleUsdChange}
            className="converter-input tabular-num"
            aria-label="Amount in USD"
          />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CoinDetailPage Component
// ---------------------------------------------------------------------------
const CoinDetailPage = () => {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const { coin, loading, error, refetch } = useCoinDetail(coinId);
  const [descExpanded, setDescExpanded] = useState(false);

  // Position of current price within 24h range (0–100%)
  const range24hPct = useMemo(() => {
    const low     = coin?.market_data?.low_24h?.usd;
    const high    = coin?.market_data?.high_24h?.usd;
    const current = coin?.market_data?.current_price?.usd;
    if (!low || !high || high === low) return 0;
    return Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  }, [coin]);

  // Loading state
  if (loading) {
    return (
      <div className="coin-detail-page">
        <div className="container">
          <div className="detail-loading" role="status" aria-live="polite">
            <span className="detail-loading__spinner" aria-hidden="true" />
            <span>Loading asset valuation and statistics…</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="coin-detail-page">
        <div className="container">
          <nav className="detail-nav" aria-label="Breadcrumb">
            <Link to="/" className="detail-back-link">← Back to Cryptocurrencies</Link>
          </nav>
          <ErrorMessage message={error} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!coin) return null;

  const md           = coin.market_data;
  const currentPrice = md?.current_price?.usd;
  const change1h     = md?.price_change_percentage_1h_in_currency?.usd;
  const change24h    = md?.price_change_percentage_24h;
  const change7d     = md?.price_change_percentage_7d;
  const change14d    = md?.price_change_percentage_14d;
  const change30d    = md?.price_change_percentage_30d;
  const change1y     = md?.price_change_percentage_1y;
  const description  = stripHtml(coin.description?.en);

  // Circulating supply %
  const maxSupply = md?.max_supply || md?.total_supply;
  const circulatingPct =
    maxSupply && md?.circulating_supply
      ? Math.min(100, Math.max(0, (md.circulating_supply / maxSupply) * 100))
      : null;

  // Volume / Market Cap ratio
  const volMcapRatio =
    md?.total_volume?.usd && md?.market_cap?.usd
      ? (md.total_volume.usd / md.market_cap.usd).toFixed(4)
      : null;

  return (
    <main className="coin-detail-page">
      <div className="container">

        {/* ── Breadcrumb ────────────────────────────────────── */}
        <nav className="detail-nav" aria-label="Breadcrumb">
          <button
            type="button"
            className="detail-back-btn"
            onClick={() => navigate('/')}
            aria-label="Go to Cryptocurrencies"
          >
            Cryptocurrencies
          </button>
          <span aria-hidden="true" className="detail-nav__sep">/</span>
          <span className="detail-nav__current">
            {coin.name} ({coin.symbol?.toUpperCase()}) Price
          </span>
        </nav>

        {/* ── Hero Header Card ───────────────────────────────── */}
        <section className="detail-header-card" aria-label={`${coin.name} overview`}>
          <div className="detail-header__main">
            <img
              className="detail-header__logo"
              src={coin.image?.large ?? coin.image?.small}
              alt={`${coin.name} logo`}
              width={48}
              height={48}
              loading="eager"
            />
            <div className="detail-header__identity">
              <div className="detail-header__title-row">
                <h1 className="detail-header__name">{coin.name}</h1>
                <span className="detail-header__symbol">
                  {coin.symbol?.toUpperCase()}
                </span>
                {md?.market_cap_rank && (
                  <span className="detail-header__rank">
                    Rank #{md.market_cap_rank}
                  </span>
                )}
              </div>
              {coin.categories && coin.categories[0] && (
                <span className="detail-header__category">
                  {coin.categories[0]}
                </span>
              )}
            </div>
          </div>

          <div className="detail-header__price-group">
            <div className="detail-header__price tabular-num">
              {formatCurrency(currentPrice)}
            </div>
            {change24h !== undefined && (
              <div
                className={`detail-header__change tabular-num ${getPriceChangeClass(change24h)}`}
              >
                <span>{change24h >= 0 ? '▲' : '▼'}</span> {formatPercent(Math.abs(change24h))} (24h)
              </div>
            )}
          </div>
        </section>

        {/* ── Two-Column Main Layout ─────────────────────────── */}
        <div className="detail-layout">

          {/* ── Left Column: Charts & Analysis ───────────────── */}
          <div className="detail-main">

            {/* 7-Day Sparkline Chart Card */}
            {md?.sparkline_7d?.price && (
              <section className="detail-card" aria-label="7-Day Price Trend">
                <div className="detail-card__header">
                  <div>
                    <h2 className="detail-card__title">7-Day Price Trend</h2>
                    <p className="detail-card__sub">
                      Hourly closing prices over the past 7 days
                    </p>
                  </div>
                  <span
                    className={`detail-card__tag tabular-num ${getPriceChangeClass(change7d)}`}
                  >
                    7d {formatPercent(change7d)}
                  </span>
                </div>
                <div className="detail-chart-wrap">
                  <Sparkline
                    data={md.sparkline_7d.price}
                    isPositive={change7d >= 0}
                    width={720}
                    height={150}
                    responsive
                  />
                </div>
              </section>
            )}

            {/* Trading Range & Extremes */}
            <section className="detail-card" aria-label="Price range and extremes">
              <div className="detail-card__header">
                <div>
                  <h2 className="detail-card__title">Trading Range &amp; Extremes</h2>
                  <p className="detail-card__sub">24-hour range and historical records</p>
                </div>
              </div>
              <div className="detail-range-body">
                {/* 24h Range Bar */}
                <div className="detail-range-item">
                  <div className="detail-range-labels">
                    <span className="detail-range-label">24h Low / 24h High</span>
                    <span className="detail-range-current tabular-num">
                      {range24hPct.toFixed(0)}% of 24h range
                    </span>
                  </div>
                  <div
                    className="detail-range-bar"
                    role="progressbar"
                    aria-valuenow={range24hPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="detail-range-bar__fill"
                      style={{ width: `${range24hPct}%` }}
                    />
                  </div>
                  <div className="detail-range-bounds tabular-num">
                    <span>Low: {formatCurrency(md?.low_24h?.usd)}</span>
                    <span>High: {formatCurrency(md?.high_24h?.usd)}</span>
                  </div>
                </div>

                {/* All-Time High / Low Grid */}
                <div className="detail-extremes-grid">
                  <div className="extreme-metric">
                    <span className="extreme-metric__label">All-Time High</span>
                    <span className="extreme-metric__value tabular-num">
                      {formatCurrency(md?.ath?.usd)}
                    </span>
                    <span
                      className={`extreme-metric__delta tabular-num ${getPriceChangeClass(
                        md?.ath_change_percentage?.usd,
                      )}`}
                    >
                      {formatPercent(md?.ath_change_percentage?.usd)} from ATH
                    </span>
                    {md?.ath_date?.usd && (
                      <span className="extreme-metric__date">
                        {new Date(md.ath_date.usd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  <div className="extreme-metric">
                    <span className="extreme-metric__label">All-Time Low</span>
                    <span className="extreme-metric__value tabular-num">
                      {formatCurrency(md?.atl?.usd)}
                    </span>
                    <span
                      className={`extreme-metric__delta tabular-num ${getPriceChangeClass(
                        md?.atl_change_percentage?.usd,
                      )}`}
                    >
                      {formatPercent(md?.atl_change_percentage?.usd)} from ATL
                    </span>
                    {md?.atl_date?.usd && (
                      <span className="extreme-metric__date">
                        {new Date(md.atl_date.usd).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Interactive Currency Converter */}
            <CryptoConverter
              coinName={coin.name}
              symbol={coin.symbol}
              priceUsd={currentPrice}
            />

            {/* Description / About Asset */}
            {description && (
              <section className="detail-card" aria-label={`About ${coin.name}`}>
                <div className="detail-card__header">
                  <h2 className="detail-card__title">About {coin.name}</h2>
                </div>
                <div className="detail-description">
                  <p>
                    {descExpanded || description.length <= 600
                      ? description
                      : `${description.slice(0, 600)}\u2026`}
                  </p>
                  {description.length > 600 && (
                    <button
                      type="button"
                      className="detail-expand-btn"
                      onClick={() => setDescExpanded((prev) => !prev)}
                    >
                      {descExpanded ? 'Show less ↑' : 'Read more ↓'}
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── Right Column: Statistics & Resources ─────────── */}
          <aside className="detail-sidebar" aria-label="Market statistics and project resources">

            {/* Price Performance Matrix */}
            <div className="detail-card">
              <div className="detail-card__header">
                <h2 className="detail-card__title">Price Performance</h2>
              </div>
              <dl className="stats-list">
                {[
                  { label: '1 hour',  value: change1h },
                  { label: '24 hours', value: change24h },
                  { label: '7 days',  value: change7d },
                  { label: '14 days', value: change14d },
                  { label: '30 days', value: change30d },
                  { label: '1 year',  value: change1y },
                ].map(({ label, value }) => (
                  <div key={label} className="stats-row">
                    <dt className="stats-label">{label}</dt>
                    <dd className={`stats-value tabular-num ${getPriceChangeClass(value)}`}>
                      {value !== undefined && value !== null ? formatPercent(value) : '—'}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Market Statistics Card */}
            <div className="detail-card">
              <div className="detail-card__header">
                <h2 className="detail-card__title">Market Statistics</h2>
              </div>
              <dl className="stats-list">
                <div className="stats-row">
                  <dt className="stats-label">Market Cap</dt>
                  <dd className="stats-value tabular-num">
                    {formatLargeNumber(md?.market_cap?.usd)}
                  </dd>
                </div>

                <div className="stats-row">
                  <dt className="stats-label">24h Trading Volume</dt>
                  <dd className="stats-value tabular-num">
                    {formatLargeNumber(md?.total_volume?.usd)}
                  </dd>
                </div>

                {volMcapRatio && (
                  <div className="stats-row">
                    <dt className="stats-label">Volume / Market Cap</dt>
                    <dd className="stats-value tabular-num">{volMcapRatio}</dd>
                  </div>
                )}

                <div className="stats-row">
                  <dt className="stats-label">Fully Diluted Val.</dt>
                  <dd className="stats-value tabular-num">
                    {formatLargeNumber(md?.fully_diluted_valuation?.usd)}
                  </dd>
                </div>

                <div className="stats-row stats-row--stacked">
                  <div className="stats-row-header">
                    <dt className="stats-label">Circulating Supply</dt>
                    <dd className="stats-value tabular-num">
                      {md?.circulating_supply
                        ? `${formatSupply(md.circulating_supply)} ${coin.symbol?.toUpperCase()}`
                        : '—'}
                    </dd>
                  </div>
                  {circulatingPct !== null && (
                    <div className="stats-supply-bar" title={`${circulatingPct.toFixed(1)}% circulating`}>
                      <div className="stats-supply-bar__fill" style={{ width: `${circulatingPct}%` }} />
                    </div>
                  )}
                </div>

                <div className="stats-row">
                  <dt className="stats-label">Total Supply</dt>
                  <dd className="stats-value tabular-num">
                    {md?.total_supply
                      ? `${formatSupply(md.total_supply)} ${coin.symbol?.toUpperCase()}`
                      : '—'}
                  </dd>
                </div>

                <div className="stats-row">
                  <dt className="stats-label">Max Supply</dt>
                  <dd className="stats-value tabular-num">
                    {md?.max_supply
                      ? `${formatSupply(md.max_supply)} ${coin.symbol?.toUpperCase()}`
                      : 'Unlimited'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Official Resources & External Links */}
            {(sanitizeUrl(coin.links?.homepage?.[0]) ||
              sanitizeUrl(coin.links?.whitepaper) ||
              sanitizeUrl(coin.links?.blockchain_site?.find(Boolean)) ||
              sanitizeUrl(coin.links?.repos_url?.github?.[0])) && (
              <div className="detail-card">
                <div className="detail-card__header">
                  <h2 className="detail-card__title">Official Resources</h2>
                </div>
                <div className="detail-links-list">
                  <ExternalLink href={coin.links?.homepage?.[0]}>Official Website</ExternalLink>
                  <ExternalLink href={coin.links?.whitepaper}>Whitepaper</ExternalLink>
                  <ExternalLink href={coin.links?.blockchain_site?.find(Boolean)}>
                    Block Explorer
                  </ExternalLink>
                  <ExternalLink href={coin.links?.repos_url?.github?.[0]}>
                    GitHub Repository
                  </ExternalLink>
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </main>
  );
};

export default CoinDetailPage;
