/**
 * src/components/Sparkline.jsx
 *
 * Lightweight SVG sparkline chart.
 * Renders price history as a smooth curve — no chart library needed.
 */

import React, { useMemo } from 'react';
import '../styles/Sparkline.css';

const WIDTH  = 100;
const HEIGHT = 36;

const Sparkline = ({ data = [], isPositive, width = WIDTH, height = HEIGHT, responsive = false }) => {
  // Normalize data to SVG coordinate paths
  const { linePath, fillPath } = useMemo(() => {
    if (!data || data.length < 2) return { linePath: '', fillPath: '' };

    const values = data.map((d) => (Array.isArray(d) ? d[1] : d));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // Map each value to x/y SVG coordinates
    const points = values.map((v, i) => ({
      x: (i / (values.length - 1)) * width,
      y: height - ((v - min) / range) * height,
    }));

    // Build a smooth SVG path using quadratic bezier curves
    const line = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = points[i - 1];
      const cpx = (prev.x + point.x) / 2;
      return `${acc} Q ${cpx},${prev.y} ${point.x},${point.y}`;
    }, '');

    const fill = `${line} L ${width},${height} L 0,${height} Z`;

    return { linePath: line, fillPath: fill };
  }, [data, width, height]);

  if (!linePath) return null;

  const cls = isPositive ? 'sparkline--positive' : 'sparkline--negative';

  return (
    <svg
      className={`sparkline ${cls} ${responsive ? 'sparkline--responsive' : ''}`}
      width={responsive ? '100%' : width}
      height={responsive ? '100%' : height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={responsive ? 'none' : undefined}
      style={responsive ? { width: '100%', height: `${height}px`, display: 'block' } : undefined}
      aria-hidden="true"
    >
      <path className="sparkline__fill" d={fillPath} />
      <path className="sparkline__path" d={linePath} />
    </svg>
  );
};

export default Sparkline;
