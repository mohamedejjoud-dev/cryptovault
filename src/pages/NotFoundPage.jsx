import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFoundPage.css';

const NotFoundPage = () => (
  <main className="not-found">
    <div className="not-found__code" aria-hidden="true">404</div>
    <h1 className="not-found__title">Page not found</h1>
    <p className="not-found__sub">
      The requested page could not be found.
    </p>
    <Link to="/" className="not-found__btn">
      Back to Markets
    </Link>
  </main>
);

export default NotFoundPage;
