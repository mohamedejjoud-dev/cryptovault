import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/Navbar.css';

/** Professional Vault Emblem SVG */
const VaultLogo = () => (
  <svg
    className="navbar__logo"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 2L3 7V13C3 18.25 6.84 21.74 12 22C17.16 21.74 21 18.25 21 13V7L12 2Z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
    <path d="M12 15.5V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SunIcon = () => (
  <svg
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
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg
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
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="navbar" role="banner">
      <div className="container navbar__inner">
        {/* Brand Group */}
        <div className="navbar__brand-group">
          <Link to="/" className="navbar__brand" aria-label="CryptoVault — Home">
            <VaultLogo />
            <div className="navbar__brand-text">
              <span className="navbar__brand-name">CryptoVault</span>
              <span className="navbar__badge">MARKETS</span>
            </div>
          </Link>

          {/* Primary Nav */}
          <nav className="navbar__nav" aria-label="Primary navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `navbar__nav-link${isActive ? ' is-active' : ''}`
              }
            >
              Cryptocurrencies
            </NavLink>
          </nav>
        </div>

        {/* Utilities */}
        <div className="navbar__utilities">
          {/* Live Data Badge */}
          <div
            className="navbar__live-indicator"
            title="Market prices automatically refresh every 60 seconds"
            aria-label="Real-time market feeds"
          >
            <span className="navbar__live-dot" aria-hidden="true" />
            <span className="navbar__live-text">Live Feeds</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark ? (
              <>
                <SunIcon />
                <span className="navbar__theme-text">Light</span>
              </>
            ) : (
              <>
                <MoonIcon />
                <span className="navbar__theme-text">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
