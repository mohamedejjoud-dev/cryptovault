import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import GlobalStats from './components/GlobalStats';
import Footer from './components/Footer';
import Skeleton from './components/Skeleton';

const HomePage = lazy(() => import('./pages/HomePage'));
const CoinDetailPage = lazy(() => import('./pages/CoinDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageFallback = () => (
  <div style={{ padding: '28px 0' }}>
    <div className="container">
      <Skeleton rows={12} />
    </div>
  </div>
);

const App = () => (
  <Router>
    <GlobalStats />
    <Navbar />
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/coin/:coinId" element={<CoinDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    <Footer />
  </Router>
);

export default App;
