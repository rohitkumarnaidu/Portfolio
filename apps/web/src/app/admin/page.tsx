'use client';

import { Card } from '@portfolio/ui';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { useSections } from '@/lib/hooks/useSections';
import { useProjects } from '@/lib/hooks/useProjects';
import { useSkills } from '@/lib/hooks/useSkills';
import { useLeads } from '@/lib/hooks/useLeads';

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card variant="elevated" padding="md" className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-h3 font-display text-text-primary">{value}</p>
        <p className="text-body-sm text-text-secondary">{label}</p>
        {sub && <p className="text-caption text-text-tertiary mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

function QuickAction({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 rounded-xl border border-border-primary bg-surface-secondary hover:bg-surface-elevated transition-all duration-200 hover:no-underline group"
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary group-hover:text-accent-500 transition-colors">
          {label}
        </p>
        <p className="text-xs text-text-tertiary mt-0.5">{desc}</p>
      </div>
      <svg
        className="w-5 h-5 text-text-tertiary group-hover:text-accent-500 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

export default function DashboardPage() {
  const { data: sections } = useSections();
  const { data: projects } = useProjects({ per_page: 100 });
  const { data: skills } = useSkills();
  const { data: newLeads } = useLeads({ per_page: 1, status: 'new' });
  const { data: allLeads } = useLeads({ per_page: 1 });

  const stats = {
    totalSections: sections?.length ?? 0,
    liveSections: sections?.filter((s) => s.is_live).length ?? 0,
    totalProjects: Array.isArray(projects) ? projects.length : 0,
    featuredProjects: Array.isArray(projects) ? projects.filter((p) => p.is_featured).length : 0,
    totalSkills: skills?.length ?? 0,
    newLeads: Array.isArray(newLeads) ? newLeads.length : 0,
    totalLeads: Array.isArray(allLeads) ? allLeads.length : 0,
  };

  const loading = !sections || !projects || !skills || !newLeads || !allLeads;

  if (loading) {
    return (
      <div>
        <h1 className="font-display text-h2 text-text-primary mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-surface-secondary border border-border-primary p-6 h-24"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Dashboard</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Portfolio overview and quick actions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Sections"
          value={stats.totalSections}
          sub={`${stats.liveSections} live`}
          color="bg-accent-500/10 text-accent-500"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
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
          label="Projects"
          value={stats.totalProjects}
          sub={`${stats.featuredProjects} featured`}
          color="bg-accent-500/10 text-accent-500"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
              />
            </svg>
          }
        />
        <StatCard
          label="Skills"
          value={stats.totalSkills}
          color="bg-accent-500/10 text-accent-500"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          }
        />
        <StatCard
          label="Leads"
          value={stats.totalLeads}
          sub={`${stats.newLeads} new`}
          color="bg-semantic-success/10 text-semantic-success"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          }
        />
      </div>

      <div className="mb-10">
        <AnalyticsCharts />
      </div>

      <div>
        <h2 className="font-display text-h3 text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAction
            href="/admin/blog"
            label="Write Blog Post"
            desc="Create a new blog post with rich text editor"
          />
          <QuickAction
            href="/admin/projects"
            label="Add Project"
            desc="Add a new project to your portfolio"
          />
          <QuickAction
            href="/admin/leads"
            label="View Leads"
            desc="Check and respond to contact form submissions"
          />
          <QuickAction
            href="/admin/sections"
            label="Manage Sections"
            desc="Toggle section visibility and reorder"
          />
        </div>
      </div>
    </div>
  );
}
