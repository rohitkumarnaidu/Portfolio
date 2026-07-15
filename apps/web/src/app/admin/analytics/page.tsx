'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsSummary, getAnalyticsSessions } from '@/lib/api';
import type { AnalyticsSummary, AnalyticsSession } from '@/lib/api';
import { Card } from '@portfolio/ui';

const PERIODS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
];

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

function TrafficChart({
  data,
}: {
  data: Array<{ date: string; visitors: number; page_views: number }>;
}) {
  if (!data.length)
    return <div className="text-sm text-text-tertiary text-center py-8">No data yet</div>;

  const width = 700;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map((d) => Math.max(d.visitors, d.page_views)), 1);
  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    return {
      x,
      yVisitors: padding.top + chartH - (d.visitors / maxVal) * chartH,
      yViews: padding.top + chartH - (d.page_views / maxVal) * chartH,
      ...d,
    };
  });

  const visitorsPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.yVisitors.toFixed(1)}`)
    .join(' ');
  const viewsAreaPath =
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.yViews.toFixed(1)}`)
      .join(' ') +
    ` L${points[points.length - 1]?.x},${padding.top + chartH} L${points[0]?.x},${padding.top + chartH} Z`;

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
              {Math.round(maxVal * frac)}
            </text>
          </g>
        );
      })}
      <path d={viewsAreaPath} fill="url(#viewsGradient)" opacity={0.1} />
      <path
        d={visitorsPath}
        fill="none"
        stroke="var(--accent-500)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-500)" />
          <stop offset="100%" stopColor="var(--accent-500)" stopOpacity={0} />
        </linearGradient>
      </defs>
      {points
        .filter((_, i) =>
          data.length > 10 ? i % Math.ceil(data.length / 8) === 0 || i === data.length - 1 : true,
        )
        .map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.yVisitors}
            r="3"
            fill="var(--accent-500)"
            stroke="var(--surface-secondary)"
            strokeWidth="2"
          />
        ))}
      {points
        .filter((_, i) =>
          data.length > 10 ? i % Math.ceil(data.length / 6) === 0 || i === data.length - 1 : true,
        )
        .map((p, i) => (
          <text
            key={`l${i}`}
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

function BarList({ items }: { items: Array<{ label: string; value: number }> }) {
  if (!items.length)
    return <p className="text-sm text-text-tertiary text-center py-8">No data yet</p>;
  const maxVal = items[0]?.value || 1;
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-text-tertiary w-5 text-right font-mono">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-secondary truncate">
                {item.label === '' ? '(direct)' : item.label}
              </span>
              <span className="text-xs text-text-tertiary font-mono ml-2">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-500/60 transition-all"
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function parseUA(ua: string | null): { browser: string; device: string } {
  if (!ua) return { browser: 'Unknown', device: 'Unknown' };
  const browser = ua.includes('Chrome')
    ? 'Chrome'
    : ua.includes('Firefox')
      ? 'Firefox'
      : ua.includes('Safari')
        ? 'Safari'
        : ua.includes('Edge')
          ? 'Edge'
          : 'Other';
  const device = ua.includes('Mobile') ? 'Mobile' : ua.includes('Tablet') ? 'Tablet' : 'Desktop';
  return { browser, device };
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAnalyticsSummary(period), getAnalyticsSessions({ per_page: 300 })])
      .then(([s, sess]) => {
        setSummary(s);
        setSessions(sess);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  sessions.forEach((s) => {
    const { device, browser } = parseUA(s.user_agent);
    deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
  });
  const devices = [...deviceMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
  const browsers = [...browserMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const referrerMap = new Map<string, number>();
  sessions.forEach((s) => {
    const src = s.referrer || 'Direct';
    referrerMap.set(src, (referrerMap.get(src) || 0) + 1);
  });
  const referrers = [...referrerMap.entries()]
    .map(([label, value]) => ({ label: label === 'Direct' ? 'Direct' : label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const countryMap = new Map<string, number>();
  sessions.forEach((s) => {
    if (s.referrer) {
      try {
        const host = new URL(s.referrer).hostname;
        countryMap.set(host, (countryMap.get(host) || 0) + 1);
      } catch { /* empty */ }
    }
  });
  const countries = [...countryMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);

  const topPages = summary?.top_pages ?? [];

  const loadingEl = (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {PERIODS.map((p) => (
          <div key={p.value} className="h-8 w-20 rounded-lg bg-surface-elevated animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-surface-secondary border border-border-primary animate-pulse"
          />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-surface-secondary border border-border-primary animate-pulse" />
    </div>
  );

  if (loading && !summary)
    return (
      <div>
        <h1 className="font-display text-h2 text-text-primary mb-8">Analytics</h1>
        {loadingEl}
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Analytics</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Traffic, engagement, and visitor insights
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-6">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${period === p.value ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}`}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Visitors"
          value={summary?.total_visitors ?? 0}
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
          label="Page Views"
          value={summary?.total_page_views ?? 0}
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
          label="Bounce Rate"
          value={summary ? `${Math.round(summary.bounce_rate * 100)}%` : '0%'}
          sub="Page exits without interaction"
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
        <StatCard
          label="Active Now"
          value={summary?.active_visitors ?? 0}
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
      </div>

      <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5 mb-6">
        <h3 className="font-display text-h4 text-text-primary mb-4">Traffic Over Time</h3>
        {summary?.visitors_over_time ? (
          <TrafficChart data={summary.visitors_over_time} />
        ) : (
          <p className="text-sm text-text-tertiary text-center py-8">No data yet</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Top Pages</h3>
          <BarList items={topPages.map((p) => ({ label: p.path, value: p.views }))} />
        </div>
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Referrer Breakdown</h3>
          <BarList items={referrers} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Device Breakdown</h3>
          <BarList items={devices} />
        </div>
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Browser Breakdown</h3>
          <BarList items={browsers} />
        </div>
      </div>

      <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5 mb-6">
        <h3 className="font-display text-h4 text-text-primary mb-4">
          Geographic Distribution (by referrer domain)
        </h3>
        <BarList items={countries} />
      </div>

      <Card variant="elevated" padding="md" className="mb-6">
        <h3 className="font-display text-h4 text-text-primary mb-2">About Analytics Data</h3>
        <p className="text-sm text-text-tertiary leading-relaxed">
          Analytics data is collected via the API analytics service. Geographic data is inferred
          from referrer domains. For more detailed analytics, consider integrating a third-party
          service like PostHog or Google Analytics via the Settings page.
        </p>
      </Card>
    </div>
  );
}
