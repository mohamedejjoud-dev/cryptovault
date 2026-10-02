# CryptoVault 🔐

An institutional-grade cryptocurrency market intelligence platform and real-time dashboard built with **React 18** and the **CoinGecko API**, inspired by the design and UX of **CoinMarketCap** and **CoinGecko**.

CryptoVault provides live market feeds, interactive charts, customizable watchlists, multi-column sorting, and comprehensive asset metrics — all with zero mock data and without requiring a paid API key.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![CoinGecko API](https://img.shields.io/badge/API-CoinGecko%20v3-8dc63f.svg)](https://www.coingecko.com/en/api)

---

## ✨ Features

### 📊 Market Overview & Highlights
- **Global Ticker Strip**: Real-time cryptocurrency count, total exchanges, total market cap with 24h change indicators, 24h volume, and BTC/ETH market dominance.
- **Market Highlights**: Instant glance cards showcasing the **Market Leader (Bitcoin)**, **Top 24h Gainer**, and **Top 24h Trading Volume** asset.
- **Dynamic Valuation Summary**: Headline summarizing real-time global crypto market capitalization and 24-hour trends.

### 📋 Institutional Coin Table
- **Interactive Multi-Column Sorting**: Sort by Rank (`#`), Name, Price, 1h %, 24h %, 7d %, 24h Volume, and Market Cap in ascending or descending order.
- **Persistent Watchlist**: Star any cryptocurrency to track it in your personal favorites list (persisted across sessions via `localStorage`).
- **Category Filter Tabs**: Switch between **All Cryptos**, **⭐ Watchlist**, **🚀 Top Gainers**, and **📉 Top Losers**.
- **Keyboard-Enabled Search**: Press <kbd>/</kbd> anywhere on the page to focus the search bar instantly.
- **Circulating Supply Progress**: Visual ratio bar illustrating circulating supply relative to max/total supply.
- **7-Day Sparkline Trends**: High-performance SVG sparkline charts with smooth Bezier interpolation and color gradients.
- **Customizable Pagination**: Choose between 20, 50, or 100 assets per page with clean ellipsis navigation.

### 🔍 Comprehensive Asset Details (`/coin/:id`)
- **Hero Price Card**: High-resolution asset emblem, real-time price, rank pill, category badge, and 24h change badge.
- **Trading Range & Extremes**: Visual 24h low/high range bar showing current price position, plus All-Time High (ATH) and All-Time Low (ATL) with dates and percentage deltas.
- **Interactive Currency Converter**: Bi-directional calculator converting any quantity of the cryptocurrency to USD and vice-versa in real-time.
- **Performance Matrix**: 1h, 24h, 7d, 14d, 30d, and 1-year historical return comparison.
- **Key Financial Statistics**: Market cap, fully diluted valuation (FDV), 24h volume, Volume/Market Cap ratio, circulating supply, total supply, and max supply.
- **Verified Official Links**: Direct, secured links (`rel="noopener noreferrer"`) to official websites, whitepapers, block explorers, and open-source GitHub repositories.
- **Sanitized Project Description**: Rich asset description sanitized against XSS attacks with expandable reading toggle.

### 🎨 Design & Accessibility
- **Financial Color Palette**: High-contrast, institutional slate dark theme and clean light theme.
- **System Preference Detection**: Automatically syncs with `prefers-color-scheme` with manual toggle persistence.
- **Tabular Numerals**: Uses monospaced figures (`JetBrains Mono`) for all financial prices and percentages to prevent layout jitter.
- **Responsive Layout**: Designed for mobile, tablet, and widescreen desktop monitors.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 16.x (LTS recommended)
- **npm** ≥ 8.x

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/cryptovault.git
cd cryptovault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment (Optional)
The application works immediately out-of-the-box using CoinGecko's public demo API tier. For higher rate limits, get a free API key at [CoinGecko API](https://www.coingecko.com/en/api).

```bash
cp .env.example .env
```

Open `.env` and add your key:
```env
REACT_APP_COINGECKO_API_KEY=your_coingecko_api_key_here
```

> 🔒 **Security Notice:** `.env` is excluded by `.gitignore` and must never be committed to a public repository.

### 4. Start development server
```bash
npm start
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📦 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Start Dev Server** | `npm start` | Runs the app in development mode on port 3000 |
| **Production Build** | `npm run build` | Compiles optimized static assets into the `/build` directory |
| **Run Tests** | `npm test` | Executes Jest test suites in single-pass mode |
| **Code Linting** | `npm run lint` | Runs ESLint across `src/` to verify code quality and style |
| **Security Audit** | `npm run audit` | Audits dependencies for high and critical security vulnerabilities |

---

## 🔒 Security & Code Quality

- **Zero Hardcoded Secrets**: All API keys and environment variables are loaded strictly from `.env` via `process.env`.
- **Sanitized External URLs**: All user/API-provided hyperlinks are verified to begin with `https://` or `http://`, explicitly blocking dangerous URI schemes (`javascript:`, `data:`, `vbscript:`).
- **XSS Protection**: HTML content from third-party API descriptions is sanitized using browser-native `DOMParser` text extraction.
- **Safe Outbound Links**: All external anchor tags enforce `rel="noopener noreferrer"` and `target="_blank"`.
- **Robust Error Handling**: API errors, rate limits (HTTP 429), and network failures are intercepted and surfaced with actionable feedback and retry triggers.
- **Clean Repository State**: `.gitignore` comprehensively excludes build artifacts (`/build`), dependencies (`node_modules`), logs, and local environment files (`.env*.local`).

---

## 🗂️ Project Architecture

```
cryptovault/
├── public/
│   ├── index.html           # HTML template with SEO tags & Google Fonts
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── CoinTable.jsx    # Sortable table, Watchlist, filter pills & pagination
│   │   ├── ErrorMessage.jsx # Graceful error banner with retry trigger
│   │   ├── Footer.jsx       # Financial disclaimer & CoinGecko attribution
│   │   ├── GlobalStats.jsx  # Top ticker strip for global market metrics
│   │   ├── Navbar.jsx       # Brand navigation, live indicator & theme switch
│   │   ├── Skeleton.jsx     # Shimmer skeleton loader
│   │   └── Sparkline.jsx    # SVG sparkline chart with Bezier curves & gradients
│   ├── context/
│   │   └── ThemeContext.js  # Dark/light theme context & local storage persistence
│   ├── hooks/
│   │   └── useCryptoData.js # Custom hooks: useCoins, useCoinDetail, useGlobalStats
│   ├── pages/
│   │   ├── CoinDetailPage.jsx # Comprehensive asset valuation & converter page
│   │   ├── HomePage.jsx       # Market highlights & coin listings
│   │   └── NotFoundPage.jsx   # 404 handler
│   ├── services/
│   │   ├── cryptoApi.js     # Axios client with interceptors & CoinGecko endpoints
│   │   └── cryptoApi.test.js
│   ├── styles/              # Component-scoped Vanilla CSS stylesheets
│   │   ├── global.css       # Design tokens, variables & typography
│   │   ├── CoinTable.css
│   │   ├── CoinDetailPage.css
│   │   └── ...
│   ├── utils/
│   │   ├── formatters.js    # Currency, percent, and compact number formatting
│   │   ├── formatters.test.js
│   │   ├── security.js      # URL & HTML sanitization utilities
│   │   └── security.test.js
│   ├── App.js               # Router layout shell
│   └── index.js             # React DOM entry point
├── .env.example             # Safe template for environment configuration
├── .gitignore               # Excludes secrets, dependencies, and build artifacts
├── package.json
└── vercel.json              # Client-side routing configuration for SPA deployments
```

---

## 🌐 Deployment

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com).
3. If using an API key, add `REACT_APP_COINGECKO_API_KEY` under **Settings → Environment Variables**.
4. Click **Deploy**. SPA rewrites are pre-configured in [`vercel.json`](file:///c:/Users/EJJOUD/Desktop/allFiles/allF/cryptovault/vercel.json).

### Deploy to Netlify / Static Hosts
Set the build command to `npm run build` and publish directory to `build`.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
