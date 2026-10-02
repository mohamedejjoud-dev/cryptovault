import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
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

// ---------------------------------------------------------------------------
// Watchlist helper (localStorage backed)
// ---------------------------------------------------------------------------
const WATCHLIST_STORAGE_KEY = 'cv_watchlist_coins';

const getStoredWatchlist = () => {
  try {
    const raw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredWatchlist = (list) => {
  try {
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore localStorage write failures
  }
};

// ---------------------------------------------------------------------------
// Star Button Component
// ---------------------------------------------------------------------------
const StarButton = React.memo(({ isStarred, onToggle, coinName }) => (
  <button
    type="button"
    className={`coin-star-btn ${isStarred ? 'is-starred' : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    aria-label={isStarred ? `Remove ${coinName} from watchlist` : `Add ${coinName} to watchlist`}
    title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
  >
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={isStarred ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </button>
));

StarButton.displayName = 'StarButton';

// ---------------------------------------------------------------------------
// CoinRow — memoised to avoid re-renders when sibling rows update
// ---------------------------------------------------------------------------
const CoinRow = React.memo(({ coin, onClick, isStarred, onToggleWatchlist }) => {
  const change1h  = coin.price_change_percentage_1h_in_currency;
  const change24h = coin.price_change_percentage_24h;
  const change7d  = coin.price_change_percentage_7d_in_currency;

  // Supply percentage calculation (if max supply or total supply exists)
  const maxSupply = coin.max_supply || coin.total_supply;
  const supplyPct =
    maxSupply && coin.circulating_supply
      ? Math.min(100, Math.max(0, (coin.circulating_supply / maxSupply) * 100))
      : null;

  return (
    <tr
      className="coin-row"
      onClick={() => onClick(coin.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${coin.name} details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(coin.id);
        }
      }}
    >
      {/* Star */}
      <td className="col-star" onClick={(e) => e.stopPropagation()}>
        <StarButton
          isStarred={isStarred}
          onToggle={() => onToggleWatchlist(coin.id)}
          coinName={coin.name}
        />
      </td>

      {/* Rank */}
      <td className="col-rank tabular-num">{coin.market_cap_rank ?? '—'}</td>

      {/* Name */}
      <td className="col-name">
        <div className="coin-cell">
          <img
            className="coin-cell__logo"
            src={coin.image}
            alt=""
            loading="lazy"
            width={28}
            height={28}
            decoding="async"
          />
          <div className="coin-cell__info">
            <span className="coin-cell__name">{coin.name}</span>
            <span className="coin-cell__symbol">{coin.symbol?.toUpperCase()}</span>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="col-price tabular-num">{formatCurrency(coin.current_price)}</td>

      {/* 1h change — hidden below 1024px */}
      <td className={`col-change tabular-num hide-lg ${getPriceChangeClass(change1h)}`}>
        {change1h !== undefined && change1h !== null ? (
          <span className="change-value">
            <span className="change-arrow" aria-hidden="true">
              {change1h >= 0 ? '▲' : '▼'}
            </span>{' '}
            {formatPercent(Math.abs(change1h))}
          </span>
        ) : (
          '—'
        )}
      </td>

      {/* 24h change */}
      <td className={`col-change tabular-num ${getPriceChangeClass(change24h)}`}>
        {change24h !== undefined && change24h !== null ? (
          <span className="change-value">
            <span className="change-arrow" aria-hidden="true">
              {change24h >= 0 ? '▲' : '▼'}
            </span>{' '}
            {formatPercent(Math.abs(change24h))}
          </span>
        ) : (
          '—'
        )}
      </td>

      {/* 7d change — hidden below 768px */}
      <td className={`col-change tabular-num hide-md ${getPriceChangeClass(change7d)}`}>
        {change7d !== undefined && change7d !== null ? (
          <span className="change-value">
            <span className="change-arrow" aria-hidden="true">
              {change7d >= 0 ? '▲' : '▼'}
            </span>{' '}
            {formatPercent(Math.abs(change7d))}
          </span>
        ) : (
          '—'
        )}
      </td>

      {/* 24h Volume — hidden below 768px */}
      <td className="col-vol tabular-num hide-md">{formatLargeNumber(coin.total_volume)}</td>

      {/* Market Cap — hidden below 600px */}
      <td className="col-mcap tabular-num hide-sm">{formatLargeNumber(coin.market_cap)}</td>

      {/* Circulating supply — hidden below 1024px */}
      <td className="col-supply tabular-num hide-lg">
        <div className="supply-cell">
          <span className="supply-text">
            {coin.circulating_supply
              ? `${formatSupply(coin.circulating_supply)} ${coin.symbol?.toUpperCase()}`
              : '—'}
          </span>
          {supplyPct !== null && (
            <div className="supply-bar" title={`${supplyPct.toFixed(1)}% circulating`}>
              <div className="supply-bar__fill" style={{ width: `${supplyPct}%` }} />
            </div>
          )}
        </div>
      </td>

      {/* 7d sparkline — hidden below 600px */}
      <td className="col-chart hide-sm">
        <Sparkline
          data={coin.sparkline_in_7d?.price}
          isPositive={change7d >= 0}
          width={112}
          height={32}
        />
      </td>
    </tr>
  );
});

CoinRow.displayName = 'CoinRow';

// ---------------------------------------------------------------------------
// Sortable Header Component
// ---------------------------------------------------------------------------
const SortableHeader = ({
  column,
  currentSort,
  onSort,
  children,
  className = '',
}) => {
  const isSorted = currentSort.column === column;
  const isAsc = isSorted && currentSort.direction === 'asc';

  return (
    <th
      scope="col"
      className={`sortable-th ${className} ${isSorted ? 'is-sorted' : ''}`}
      onClick={() => onSort(column)}
      aria-sort={isSorted ? (isAsc ? 'ascending' : 'descending') : 'none'}
    >
      <div className="th-content">
        <span>{children}</span>
        <span className="sort-icon" aria-hidden="true">
          {isSorted ? (isAsc ? '▲' : '▼') : '↕'}
        </span>
      </div>
    </th>
  );
};

// ---------------------------------------------------------------------------
// Main CoinTable
// ---------------------------------------------------------------------------
const CoinTable = ({ coins = [], searchQuery = '', onSearchChange, onRefresh }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'watchlist' | 'gainers' | 'losers'
  const [watchlist, setWatchlist] = useState(getStoredWatchlist);
  const [sortConfig, setSortConfig] = useState({
    column: 'market_cap_rank',
    direction: 'asc',
  });

  const tableRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut: '/' focuses the search box
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle coin in watchlist
  const handleToggleWatchlist = useCallback((coinId) => {
    setWatchlist((prev) => {
      const next = prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId];
      saveStoredWatchlist(next);
      return next;
    });
  }, []);

  // Sort handler
  const handleSort = useCallback((column) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        column,
        direction: column === 'market_cap_rank' || column === 'name' ? 'asc' : 'desc',
      };
    });
    setCurrentPage(1);
  }, []);

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, itemsPerPage]);

  const handleRowClick = useCallback(
    (coinId) => navigate(`/coin/${coinId}`),
    [navigate],
  );

  // Tab counts
  const watchlistCount = useMemo(
    () => coins.filter((c) => watchlist.includes(c.id)).length,
    [coins, watchlist],
  );

  // 1. Filter by tab & search query
  const filteredCoins = useMemo(() => {
    let result = coins;

    // Tab filter
    if (activeTab === 'watchlist') {
      result = result.filter((c) => watchlist.includes(c.id));
    } else if (activeTab === 'gainers') {
      result = result.filter((c) => (c.price_change_percentage_24h ?? 0) > 0);
    } else if (activeTab === 'losers') {
      result = result.filter((c) => (c.price_change_percentage_24h ?? 0) < 0);
    }

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q),
      );
    }

    return result;
  }, [coins, activeTab, watchlist, searchQuery]);

  // 2. Sort coins
  const sortedCoins = useMemo(() => {
    const { column, direction } = sortConfig;
    const factor = direction === 'asc' ? 1 : -1;

    return [...filteredCoins].sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string') {
        return factor * valA.localeCompare(valB);
      }
      return factor * (valA - valB);
    });
  }, [filteredCoins, sortConfig]);

  // 3. Paginate
  const totalPages   = Math.max(1, Math.ceil(sortedCoins.length / itemsPerPage));
  const validPage    = Math.min(currentPage, totalPages);
  const startIndex   = (validPage - 1) * itemsPerPage;
  const currentCoins = useMemo(
    () => sortedCoins.slice(startIndex, startIndex + itemsPerPage),
    [sortedCoins, startIndex, itemsPerPage],
  );

  const startRecord = sortedCoins.length > 0 ? startIndex + 1 : 0;
  const endRecord   = Math.min(startIndex + itemsPerPage, sortedCoins.length);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === validPage) return;
    setCurrentPage(page);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validPage <= 4) {
      return [1, 2, 3, 4, 5, '…', totalPages];
    }
    if (validPage >= totalPages - 3) {
      return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '…', validPage - 1, validPage, validPage + 1, '…', totalPages];
  };

  return (
    <div ref={tableRef} className="table-section">
      {/* ── Tabs & Controls Header ───────────────────────────── */}
      <div className="table-header-bar">
        {/* Category Filter Pills */}
        <div className="table-pills" role="tablist" aria-label="Market views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`pill-btn ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Cryptos
            <span className="pill-count">{coins.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'watchlist'}
            className={`pill-btn ${activeTab === 'watchlist' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('watchlist')}
          >
            <span className="pill-star" aria-hidden="true">★</span> Watchlist
            <span className="pill-count">{watchlistCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'gainers'}
            className={`pill-btn ${activeTab === 'gainers' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('gainers')}
          >
            🚀 Top Gainers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'losers'}
            className={`pill-btn ${activeTab === 'losers' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('losers')}
          >
            📉 Top Losers
          </button>
        </div>

        {/* Search & Actions */}
        <div className="table-actions">
          {/* Search */}
          <div className="table-search">
            <svg
              className="table-search__icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              id="coin-search"
              type="search"
              className="table-search__input"
              placeholder="Search coin or ticker… (/)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search cryptocurrencies"
              autoComplete="off"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                type="button"
                className="table-search__clear"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Rows Per Page */}
          <div className="table-rows-selector">
            <label htmlFor="rows-select" className="table-rows-label">Show:</label>
            <select
              id="rows-select"
              className="table-rows-select"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              aria-label="Rows per page"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              className="table-refresh-btn"
              onClick={onRefresh}
              aria-label="Refresh market prices"
              title="Refresh market prices"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Market Table ─────────────────────────────────────── */}
      <div className="table-card">
        <div className="table-scroll-wrap">
          <table
            className="market-table"
            role="table"
            aria-label="Cryptocurrency market price listing"
          >
            <thead>
              <tr>
                <th scope="col" className="th-star" aria-label="Watchlist">★</th>
                <SortableHeader
                  column="market_cap_rank"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-rank"
                >
                  #
                </SortableHeader>
                <SortableHeader
                  column="name"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-name"
                >
                  Name
                </SortableHeader>
                <SortableHeader
                  column="current_price"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-num"
                >
                  Price
                </SortableHeader>
                <SortableHeader
                  column="price_change_percentage_1h_in_currency"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-num hide-lg"
                >
                  1h %
                </SortableHeader>
                <SortableHeader
                  column="price_change_percentage_24h"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-num"
                >
                  24h %
                </SortableHeader>
                <SortableHeader
                  column="price_change_percentage_7d_in_currency"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-num hide-md"
                >
                  7d %
                </SortableHeader>
                <SortableHeader
                  column="total_volume"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-num hide-md"
                >
                  24h Volume
                </SortableHeader>
                <SortableHeader
                  column="market_cap"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="th-num hide-sm"
                >
                  Market Cap
                </SortableHeader>
                <th scope="col" className="th-num hide-lg">
                  Circulating Supply
                </th>
                <th scope="col" className="th-chart hide-sm">
                  Last 7 Days
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCoins.length > 0 ? (
                currentCoins.map((coin) => (
                  <CoinRow
                    key={coin.id}
                    coin={coin}
                    onClick={handleRowClick}
                    isStarred={watchlist.includes(coin.id)}
                    onToggleWatchlist={handleToggleWatchlist}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="table-empty">
                    {activeTab === 'watchlist' && !searchQuery ? (
                      <div className="empty-watchlist">
                        <span className="empty-icon" aria-hidden="true">⭐</span>
                        <p className="empty-title">Your Watchlist is Empty</p>
                        <p className="empty-desc">
                          Click the star icon next to any cryptocurrency to track it here.
                        </p>
                        <button
                          type="button"
                          className="empty-btn"
                          onClick={() => setActiveTab('all')}
                        >
                          View All Cryptocurrencies
                        </button>
                      </div>
                    ) : (
                      <div className="empty-search">
                        <p className="empty-title">
                          No assets found matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
                        </p>
                        <p className="empty-desc">
                          Check your spelling or search by ticker symbol (e.g. BTC, ETH, SOL).
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Table Footer & Pagination ───────────────────────── */}
      <div className="table-footer">
        <span className="table-count tabular-num">
          {sortedCoins.length > 0
            ? `Showing ${startRecord}–${endRecord} of ${sortedCoins.length} assets`
            : '0 results'}
        </span>

        {totalPages > 1 && (
          <nav className="pagination-bar" aria-label="Table pagination">
            <button
              type="button"
              className="pagination-btn pagination-btn--prev"
              onClick={() => handlePageChange(validPage - 1)}
              disabled={validPage === 1}
              aria-label="Previous page"
            >
              ‹ Prev
            </button>

            <div className="pagination-numbers">
              {getPageNumbers().map((item, index) => {
                if (typeof item === 'string') {
                  return (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                      {item}
                    </span>
                  );
                }
                const isActive = item === validPage;
                return (
                  <button
                    key={`page-${item}`}
                    type="button"
                    className={`pagination-btn pagination-btn--number${isActive ? ' is-active' : ''}`}
                    onClick={() => handlePageChange(item)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Go to page ${item}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="pagination-btn pagination-btn--next"
              onClick={() => handlePageChange(validPage + 1)}
              disabled={validPage === totalPages}
              aria-label="Next page"
            >
              Next ›
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default CoinTable;
