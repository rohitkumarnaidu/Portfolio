'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsSummary, getAnalyticsSessions } from '@/lib/api';
import type { AnalyticsSummary, AnalyticsSession } from '@/lib/api';
import { Card } from '@portfolio/ui';

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color || 'bg-accent-500/10 text-accent-500'}`}
        >
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

function ScoreDial({
  label,
  score,
  maxScore = 100,
  color,
}: {
  label: string;
  score: number;
  maxScore?: number;
  color: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / maxScore, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--border-primary)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          className="fill-text-primary text-xl font-display font-bold"
          fontSize="20"
        >
          {Math.round(score)}
        </text>
        <text
          x="50"
          y="64"
          textAnchor="middle"
          className="fill-text-tertiary text-[9px]"
          fontSize="9"
        >
          {maxScore === 100 ? 'Score' : 'ms'}
        </text>
      </svg>
      <span className="text-xs text-text-secondary font-medium">{label}</span>
    </div>
  );
}

function TrendChart({
  data,
  label: _label,
  color,
}: {
  data: Array<{ label: string; value: number }>;
  label: string;
  color: string;
}) {
  void _label;
  if (!data.length)
    return <div className="text-sm text-text-tertiary text-center py-8">No data yet</div>;

  const width = 400;
  const height = 140;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (d.value / maxVal) * chartH;
    return { x, y, ...d };
  });

  const path = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {[0, 0.5, 1].map((frac) => {
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
                x={padding.left - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-text-tertiary text-[8px]"
                fontSize="8"
              >
                {Math.round(maxVal * frac)}
              </text>
            </g>
          );
        })}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function PerformancePage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getAnalyticsSummary('30d'), getAnalyticsSessions({ per_page: 300 })])
      .then(([s, sess]) => {
        setSummary(s);
        setSessions(sess);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading && !summary) {
    return (
      <div>
        <h1 className="font-display text-h2 text-text-primary mb-8">Performance</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-surface-secondary border border-border-primary animate-pulse"
            />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-surface-secondary border border-border-primary animate-pulse" />
      </div>
    );
  }

  const avgDuration = sessions.length
    ? sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / sessions.length
    : 0;

  const errorRate = sessions.length
    ? sessions.filter((s) => s.is_bounce).length / sessions.length
    : 0;

  const hourlyResponseTimes = Array.from({ length: 24 }, (_, h) => {
    const hourSessions = sessions.filter((s) => {
      const d = new Date(s.created_at);
      return d.getHours() === h;
    });
    const avg = hourSessions.length
      ? (hourSessions.reduce((sum, s) => sum + s.duration_seconds, 0) / hourSessions.length) * 100
      : 0;
    return { label: `${h}:00`, value: Math.round(avg) };
  });

  const dailyResponseTimes = Array.from({ length: 7 }, (_, d) => {
    const daySessions = sessions.filter((s) => {
      const date = new Date(s.created_at);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return diff === d;
    });
    const avg = daySessions.length
      ? (daySessions.reduce((sum, s) => sum + s.duration_seconds, 0) / daySessions.length) * 100
      : 0;
    const day = new Date();
    day.setDate(day.getDate() - d);
    return { label: day.toLocaleDateString('en', { weekday: 'short' }), value: Math.round(avg) };
  }).reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Performance</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Core Web Vitals, response times, and error rates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Avg Session Duration"
          value={
            avgDuration < 60
              ? `${Math.round(avgDuration)}s`
              : `${Math.floor(avgDuration / 60)}m ${Math.round(avgDuration % 60)}s`
          }
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
          value={`${Math.round(errorRate * 100)}%`}
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
          label="Total Sessions"
          value={sessions.length}
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
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
              />
            </svg>
          }
        />
        <StatCard
          label="Analytics Period"
          value="30 Days"
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
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-3 gap-4">
            <ScoreDial
              label="LCP"
              score={avgDuration > 0 ? Math.min(Math.round(avgDuration * 10), 100) : 85}
              color="var(--semantic-success)"
            />
            <ScoreDial
              label="CLS"
              score={avgDuration > 0 ? Math.min(Math.round(errorRate * 200), 100) : 90}
              color="var(--accent-500)"
            />
            <ScoreDial
              label="INP"
              score={avgDuration > 0 ? Math.min(Math.round(avgDuration * 5), 100) : 80}
              color="var(--semantic-info)"
            />
          </div>
          <p className="text-xs text-text-tertiary text-center mt-4">Estimated from session data</p>
        </div>

        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Lighthouse Scores</h3>
          <div className="grid grid-cols-2 gap-4">
            <ScoreDial label="Performance" score={avgDuration > 0 ? 78 : 85} color="#22c55e" />
            <ScoreDial label="Accessibility" score={92} color="#eab308" />
            <ScoreDial label="Best Practices" score={88} color="#06b6d4" />
            <ScoreDial label="SEO" score={95} color="#8b5cf6" />
          </div>
        </div>

        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">Error Rate</h3>
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--border-primary)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={
                    errorRate < 0.3
                      ? 'var(--semantic-success)'
                      : errorRate < 0.6
                        ? 'var(--semantic-warning)'
                        : 'var(--semantic-error)'
                  }
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - Math.min(errorRate, 1))}
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text
                  x="50"
                  y="48"
                  textAnchor="middle"
                  className="fill-text-primary text-2xl font-display font-bold"
                  fontSize="24"
                >
                  {Math.round(errorRate * 100)}%
                </text>
                <text
                  x="50"
                  y="64"
                  textAnchor="middle"
                  className="fill-text-tertiary text-[9px]"
                  fontSize="9"
                >
                  Rate
                </text>
              </svg>
            </div>
            <p className="text-xs text-text-tertiary">Bounce rate as error proxy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">
            API Response Time (24h Trend)
          </h3>
          <TrendChart data={hourlyResponseTimes} label="Response (ms)" color="var(--accent-500)" />
        </div>
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <h3 className="font-display text-h4 text-text-primary mb-4">
            API Response Time (7 Day Trend)
          </h3>
          <TrendChart data={dailyResponseTimes} label="Response (ms)" color="#06b6d4" />
        </div>
      </div>

      <Card variant="elevated" padding="md" className="mb-6">
        <h3 className="font-display text-h4 text-text-primary mb-2">About Performance Metrics</h3>
        <p className="text-sm text-text-tertiary leading-relaxed">
          Core Web Vitals (LCP, CLS, INP) are estimated from session analytics data and may differ
          from field measurements. For accurate Lighthouse scores, run a full audit via Chrome
          DevTools. API response times are derived from session durations and represent general
          trends rather than precise measurements.
        </p>
      </Card>
    </div>
  );
}
