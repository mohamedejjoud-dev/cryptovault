/**
 * src/components/CoinTable.jsx
 *
 * The main table listing all cryptocurrencies.
 * Includes: rank, logo, name, price, market cap, volume,
 *           24h change, 7d sparkline.
 * Supports client-side search filtering passed in as a prop.
 */

import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sparkline from './Sparkline';
import {
  formatCurrency,
  formatLargeNumber,
  formatPercent,
  formatSupply,
  getPriceChangeClass,
} from '../utils/formatters';
import '../styles/CoinTable.css';

const ITEMS_PER_PAGE = 10;

// ── Sub-component: single table row ──────────────────────────────────────────

const CoinRow = React.memo(({ coin, index, onClick }) => {
  const change24h = coin.price_change_percentage_24h;
  const change7d  = coin.price_change_percentage_7d_in_currency;
  const isPositive24 = change24h >= 0;

  return (
    <tr
      onClick={() => onClick(coin.id)}
      style={{ animationDelay: `${index * 0.03}s` }}
      role="button"
      tabIndex={0}
      aria-label={`View ${coin.name} details`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(coin.id)}
    >
      {/* Rank */}
      <td className="td-rank">{coin.market_cap_rank}</td>

      {/* Coin identity */}
      <td className="td-coin">
        <div className="coin-identity">
          <img
            className="coin-identity__img"
            src={coin.image}
            alt={coin.name}
            loading="lazy"
            width={36}
            height={36}
          />
          <div>
            <div className="coin-identity__name">{coin.name}</div>
            <div className="coin-identity__symbol">{coin.symbol}</div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="td-price">{formatCurrency(coin.current_price)}</td>

      {/* 24h Change */}
      <td className="td-change">
        <span className={`change-badge ${getPriceChangeClass(change24h)}`}>
          {isPositive24 ? '▲' : '▼'} {formatPercent(change24h)}
        </span>
      </td>

      {/* 7d Change */}
      <td className="td-change hide-md">
        <span className={`change-badge ${getPriceChangeClass(change7d)}`}>
          {change7d >= 0 ? '▲' : '▼'} {formatPercent(change7d)}
        </span>
      </td>

      {/* Market Cap */}
      <td className="td-mcap hide-sm">{formatLargeNumber(coin.market_cap)}</td>

      {/* Volume */}
      <td className="td-vol hide-md">{formatLargeNumber(coin.total_volume)}</td>

      {/* Circulating Supply */}
      <td className="td-supply hide-lg">
        {formatSupply(coin.circulating_supply)}{' '}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          {coin.symbol?.toUpperCase()}
        </span>
      </td>

      {/* 7-day Sparkline */}
      <td className="td-sparkline hide-sm">
        <Sparkline
          data={coin.sparkline_in_7d?.price}
          isPositive={change7d >= 0}
          width={90}
          height={36}
        />
      </td>
    </tr>
  );
});

// ── Main CoinTable Component ──────────────────────────────────────────────────

const CoinTable = ({ coins, searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);

  // Reset to page 1 whenever user searches
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Navigate to detail page on row click
  const handleRowClick = useCallback(
    (coinId) => navigate(`/coin/${coinId}`),
    [navigate]
  );

  // Apply client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return coins;
    const q = searchQuery.toLowerCase();
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(q) ||
        coin.symbol.toLowerCase().includes(q)
    );
  }, [coins, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const currentCoins = useMemo(
    () => filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [filtered, startIndex]
  );

  const startRecord = filtered.length > 0 ? startIndex + 1 : 0;
  const endRecord = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === validPage) return;
    setCurrentPage(page);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (validPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validPage - 1, validPage, validPage + 1, '...', totalPages];
  };

  return (
    <div ref={tableRef} className="coin-table-container">
      {/* Search & count bar */}
      <div className="controls">
        <div className="search-wrapper">
          <input
            className="search-input"
            type="text"
            placeholder="Search coins by name or symbol…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search cryptocurrencies"
          />
          <span className="search-wrapper__icon" aria-hidden="true">⌕</span>
        </div>

        <div className="controls__stats">
          <span className="controls__count">
            Showing {startRecord}–{endRecord} of {filtered.length} coins
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="coin-table-wrapper">
        <table className="coin-table" role="table" aria-label="Cryptocurrency market data">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Coin</th>
              <th scope="col">Price</th>
              <th scope="col">24h %</th>
              <th scope="col" className="hide-md">7d %</th>
              <th scope="col" className="hide-sm">Market Cap</th>
              <th scope="col" className="hide-md">Volume 24h</th>
              <th scope="col" className="hide-lg">Supply</th>
              <th scope="col" className="hide-sm">7d Chart</th>
            </tr>
          </thead>
          <tbody>
            {currentCoins.length > 0 ? (
              currentCoins.map((coin, i) => (
                <CoinRow
                  key={coin.id}
                  coin={coin}
                  index={i}
                  onClick={handleRowClick}
                />
              ))
            ) : (
              <tr>
                <td colSpan="9">
                  <div className="coin-table-empty">
                    No coins match "<strong>{searchQuery}</strong>"
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="pagination" aria-label="Coin table pagination">
          <button
            className="pagination__btn pagination__nav"
            onClick={() => handlePageChange(validPage - 1)}
            disabled={validPage === 1}
            aria-label="Go to previous page"
          >
            ← Previous
          </button>

          <div className="pagination__pages">
            {getPageNumbers().map((item, index) => {
              if (item === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="pagination__ellipsis">
                    …
                  </span>
                );
              }
              const pageNum = Number(item);
              const isActive = pageNum === validPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  className={`pagination__btn pagination__page ${isActive ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="pagination__btn pagination__nav"
            onClick={() => handlePageChange(validPage + 1)}
            disabled={validPage === totalPages}
            aria-label="Go to next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default CoinTable;
