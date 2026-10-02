import React from 'react';
import '../styles/Skeleton.css';

const SkeletonRow = () => (
  <div className="skeleton-row" aria-hidden="true">
    <span className="skeleton" style={{ width: '1.5rem', height: '1rem' }} />
    <span className="skeleton" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
    <span className="skeleton" style={{ width: '70%', height: '1rem' }} />
    <span className="skeleton" style={{ width: '80%', height: '1rem' }} />
    <span className="skeleton" style={{ width: '60%', height: '1rem' }} />
    <span className="skeleton" style={{ width: '55%', height: '1rem' }} />
    <span className="skeleton" style={{ width: '65%', height: '1rem' }} />
    <span className="skeleton" style={{ width: '100%', height: '2rem' }} />
  </div>
);

const Skeleton = ({ rows = 10 }) => (
  <div className="skeleton-container" role="status" aria-label="Loading data">
    {Array.from({ length: rows }, (_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

export default Skeleton;
