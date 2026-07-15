'use client';

import { useEffect, useState } from 'react';
import { getAnalyticsSummary } from '@/lib/api';
import { Card } from '@portfolio/ui';

// ── Types ──────────────────────────────────────────────────

interface AnalyticsSummary {
  total_views: number;
  unique_visitors: number;
  average_session_duration: number;
  bounce_rate: number;
  top_pages: Array<{ path: string; views: number }>;
  top_sources: Array<{ source: string; visitors: number }>;
  device_breakdown: { desktop: number; mobile: number; tablet: number };
  daily_views: Array<{ date: string; views: number }>;
  period: string;
}

const PERIODS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

// ── Stat Card ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent-500/10 text-accent-500 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-h3 font-display text-text-primary">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-caption text-text-tertiary mt-0.5">{sub}</p>}
    </div>
  );
}

// ── SVG Line Chart ─────────────────────────────────────────

function DailyViewsChart({ data }: { data: Array<{ date: string; views: number }> }) {
  if (!data.length)
    return <div className="text-sm text-text-tertiary text-center py-8">No data yet</div>;

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxViews = Math.max(...data.map((d) => d.views), 1);
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (d.views / maxViews) * chartH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');
  const areaPath =
    linePath +
    ` L${points[points.length - 1]?.x},${padding.top + chartH} L${points[0]?.x},${padding.top + chartH} Z`;

  // Format date for display
  const fmtDate = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = padding.top + chartH - frac * chartH;
        return (
          <g key={frac}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="var(--border-primary)"
              strokeWidth="1"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-text-tertiary text-[10px]"
              fontSize="10"
            >
              {Math.round(maxViews * frac)}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#gradient)" opacity={0.15} />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="var(--accent-500)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gradient def */}
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-500)" />
          <stop offset="100%" stopColor="var(--accent-500)" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Dots */}
      {points
        .filter((_, i) =>
          data.length > 10 ? i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 : true,
        )
        .map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="var(--accent-500)"
            stroke="var(--surface-secondary)"
            strokeWidth="2"
          />
        ))}

      {/* X-axis labels */}
      {points
        .filter((_, i) =>
          data.length > 10 ? i % Math.ceil(data.length / 6) === 0 || i === data.length - 1 : true,
        )
        .map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-text-tertiary text-[10px]"
            fontSize="10"
          >
            {fmtDate(p.date)}
          </text>
        ))}
    </svg>
  );
}

// ── Donut Chart ────────────────────────────────────────────

function DonutChart({ data }: { data: { desktop: number; mobile: number; tablet: number } }) {
  const total = data.desktop + data.mobile + data.tablet || 1;
  const segments = [
    {
      label: 'Desktop',
      value: data.desktop,
      color: 'var(--accent-500)',
      pct: data.desktop / total,
    },
    { label: 'Mobile', value: data.mobile, color: '#06b6d4', pct: data.mobile / total },
    { label: 'Tablet', value: data.tablet, color: '#8b5cf6', pct: data.tablet / total },
  ];

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth="20"
        />
        {segments.map((seg) => {
          const length = seg.pct * circumference;
          const dash = `${length} ${circumference - length}`;
          const o = -offset;
          offset += length;
          return (
            <circle
              key={seg.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="20"
              strokeDasharray={dash}
              strokeDashoffset={o}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          );
        })}
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-text-primary text-xl font-display font-bold"
          fontSize="20"
        >
          {Math.round(data.desktop * 100)}%
        </text>
        <text
          x="80"
          y="92"
          textAnchor="middle"
          className="fill-text-tertiary text-[10px]"
          fontSize="10"
        >
          Desktop
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-text-secondary">{seg.label}</span>
            <span className="text-xs text-text-tertiary ml-auto">{Math.round(seg.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export function AnalyticsCharts() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAnalyticsSummary(period)
      .then((res) => setSummary(res as unknown as AnalyticsSummary))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {PERIODS.map((p) => (
            <div key={p.value} className="h-8 w-20 rounded-lg bg-surface-elevated animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-surface-secondary border border-border-primary animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-surface-secondary border border-border-primary animate-pulse" />
      </div>
    );
  }

  if (!summary) {
    return (
      <Card variant="elevated" padding="md" className="text-center py-12">
        <p className="text-text-secondary text-sm">
          No analytics data available yet. Start tracking by visiting the portfolio site!
        </p>
      </Card>
    );
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              period === p.value
                ? 'bg-accent-500 text-white'
                : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            {p.label}
          </button>
        ))}
        {loading && (
          <svg
            className="animate-spin w-4 h-4 text-accent-500 ml-2"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Page Views"
          value={summary.total_views}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          }
        />
        <StatCard
          label="Unique Visitors"
          value={summary.unique_visitors}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Avg. Session"
          value={formatDuration(summary.average_session_duration)}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Bounce Rate"
          value={`${Math.round(summary.bounce_rate * 100)}%`}
          icon={
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Views Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Daily Views</h3>
          <DailyViewsChart data={summary.daily_views} />
        </div>

        {/* Device Breakdown */}
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Devices</h3>
          <DonutChart data={summary.device_breakdown} />
        </div>
      </div>

      {/* Top Pages & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Top Pages</h3>
          {summary.top_pages.length === 0 ? (
            <p className="text-sm text-text-tertiary">No page data yet</p>
          ) : (
            <div className="space-y-2">
              {summary.top_pages.map((page, i) => {
                const maxViews = summary.top_pages[0]?.views || 1;
                const barWidth = (page.views / maxViews) * 100;
                return (
                  <div key={page.path} className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary w-5 text-right font-mono">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary truncate">{page.path}</span>
                        <span className="text-xs text-text-tertiary font-mono ml-2">
                          {page.views}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-500/60 transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Sources */}
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Traffic Sources</h3>
          {summary.top_sources.length === 0 ? (
            <p className="text-sm text-text-tertiary">No source data yet</p>
          ) : (
            <div className="space-y-2">
              {summary.top_sources.map((src, i) => {
                const maxVisitors = summary.top_sources[0]?.visitors || 1;
                const barWidth = (src.visitors / maxVisitors) * 100;
                return (
                  <div key={src.source} className="flex items-center gap-3">
                    <span className="text-xs text-text-tertiary w-5 text-right font-mono">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary capitalize truncate">
                          {src.source}
                        </span>
                        <span className="text-xs text-text-tertiary font-mono ml-2">
                          {src.visitors}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-500/60 transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
