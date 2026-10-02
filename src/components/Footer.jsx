import React from 'react';
import '../styles/Footer.css';

const Footer = () => (
  <footer className="footer" role="contentinfo">
    <div className="container footer__inner">
      <div className="footer__brand-col">
        <div className="footer__brand">
          <span className="footer__brand-title">CryptoVault</span>
          <span className="footer__badge">PRO</span>
        </div>
        <p className="footer__disclaimer">
          Real-time cryptocurrency valuation, interactive charts, and institutional market analytics.
          Data provided for informational purposes only and does not constitute financial advice.
        </p>
      </div>

      <div className="footer__meta-col">
        <p className="footer__credit">
          Market Data Powered by{' '}
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__credit-link"
          >
            CoinGecko API
          </a>
        </p>
        <p className="footer__copy">
          &copy; {new Date().getFullYear()} CryptoVault. Open-source cryptocurrency dashboard.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
