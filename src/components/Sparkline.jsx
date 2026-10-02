import React, { useId, useMemo } from 'react';
import '../styles/Sparkline.css';

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 36;
const PADDING = 2;

/**
 * High-performance SVG sparkline chart with subtle gradient fill.
 */
const Sparkline = ({
  data = [],
  isPositive = true,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  responsive = false,
}) => {
  const gradientId = useId();

  const { linePath, fillPath } = useMemo(() => {
    if (!data || data.length < 2) return { linePath: '', fillPath: '' };

    const values = data.map((d) => (Array.isArray(d) ? d[1] : d));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const innerHeight = height - PADDING * 2;
    const innerWidth = width - PADDING * 2;

    const points = values.map((v, i) => ({
      x: PADDING + (i / (values.length - 1)) * innerWidth,
      y: PADDING + innerHeight - ((v - min) / range) * innerHeight,
    }));

    // Build smooth cubic/quadratic bezier curve
    const line = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      const prev = points[i - 1];
      const cpx = ((prev.x + point.x) / 2).toFixed(1);
      return `${acc} Q ${cpx},${prev.y.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }, '');

    const lastX = points[points.length - 1].x.toFixed(1);
    const firstX = points[0].x.toFixed(1);
    const fill = `${line} L ${lastX},${height} L ${firstX},${height} Z`;

    return { linePath: line, fillPath: fill };
  }, [data, width, height]);

  if (!linePath) {
    return <span className="sparkline-placeholder">—</span>;
  }

  const strokeColor = isPositive ? 'var(--green)' : 'var(--red)';
  const cls = isPositive ? 'sparkline--positive' : 'sparkline--negative';

  return (
    <svg
      className={`sparkline ${cls} ${responsive ? 'sparkline--responsive' : ''}`}
      width={responsive ? '100%' : width}
      height={responsive ? '100%' : height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={responsive ? 'none' : 'xMidYMid meet'}
      style={responsive ? { width: '100%', height: `${height}px`, display: 'block' } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-grad-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        className="sparkline__fill"
        d={fillPath}
        fill={`url(#spark-grad-${gradientId})`}
      />
      <path
        className="sparkline__path"
        d={linePath}
        stroke={strokeColor}
      />
    </svg>
  );
};

export default React.memo(Sparkline);
