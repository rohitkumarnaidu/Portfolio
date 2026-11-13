'use client';

import { useSections } from '@/lib/hooks/useSections';
import { useProjects } from '@/lib/hooks/useProjects';
import { useSkills } from '@/lib/hooks/useSkills';
import { useBlogPosts } from '@/lib/hooks/useBlogPosts';
import { useTestimonials } from '@/lib/hooks/useTestimonials';
import { useAdminServices } from '@/lib/hooks/useServices';
import { useFAQs } from '@/lib/hooks/useFAQs';
import { useExperiences } from '@/lib/hooks/useExperiences';
import { useAdminAchievements } from '@/lib/hooks/useAchievements';
import { useAdminPressFeatures } from '@/lib/hooks/usePressFeatures';
import { useAdminGuestAppearances } from '@/lib/hooks/useGuestAppearances';
import { useLeads } from '@/lib/hooks/useLeads';

type ContentType = {
  key: string;
  label: string;
  href: string;
  total: number;
  published: number;
  color: string;
  icon: React.ReactNode;
};

function ContentCard({ item }: { item: ContentType }) {
  return (
    <a
      href={item.href}
      className="rounded-2xl bg-surface-secondary border border-border-primary p-5 hover:border-accent-500/30 transition-all duration-200 hover:no-underline group"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
        >
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary group-hover:text-accent-500 transition-colors">
            {item.label}
          </p>
          <p className="text-xs text-text-tertiary">{item.total} items</p>
        </div>
        <svg
          className="w-4 h-4 text-text-tertiary group-hover:text-accent-500 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <span className="text-text-secondary">
          <span className="font-medium text-text-primary">{item.published}</span> published
        </span>
        <span className="text-text-secondary">
          <span className="font-medium text-text-primary">{item.total - item.published}</span>{' '}
          drafts
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-500/60 transition-all"
          style={{ width: `${item.total > 0 ? (item.published / item.total) * 100 : 0}%` }}
        />
      </div>
    </a>
  );
}

export default function ContentPage() {
  const { data: sections } = useSections();
  const { data: projects } = useProjects({ per_page: 100 });
  const { data: skills } = useSkills();
  const { data: blogPosts } = useBlogPosts();
  const { data: testimonials } = useTestimonials();
  const { data: services } = useAdminServices();
  const { data: faqs } = useFAQs();
  const { data: experiences } = useExperiences();
  const { data: achievements } = useAdminAchievements();
  const { data: pressFeatures } = useAdminPressFeatures();
  const { data: guestAppearances } = useAdminGuestAppearances();
  const { data: leads } = useLeads({ per_page: 100 });

  const contentTypes: ContentType[] = [
    {
      key: 'sections',
      label: 'Sections',
      href: '/admin/sections',
      total: sections?.length ?? 0,
      published: sections?.filter((s) => s.is_live).length ?? 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
      ),
    },
    {
      key: 'projects',
      label: 'Projects',
      href: '/admin/projects',
      total: Array.isArray(projects) ? projects.length : 0,
      published: Array.isArray(projects) ? projects.filter((p) => p.is_featured).length : 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
      ),
    },
    {
      key: 'skills',
      label: 'Skills',
      href: '/admin/skills',
      total: skills?.length ?? 0,
      published: skills?.filter((s) => s.is_featured).length ?? 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
      ),
    },
    {
      key: 'blog',
      label: 'Blog Posts',
      href: '/admin/blog',
      total: blogPosts?.length ?? 0,
      published: blogPosts?.filter((p) => p.isPublished).length ?? 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
      ),
    },
    {
      key: 'services',
      label: 'Services',
      href: '/admin/services',
      total: services?.length ?? 0,
      published: services?.filter((s) => s.is_highlighted).length ?? 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
            d="M11.42 15.17l-4.04-2.02a2 2 0 010-3.54l4.04-2.02a2 2 0 013.16 0l4.04 2.02a2 2 0 010 3.54l-4.04 2.02a2 2 0 01-3.16 0z"
          />
        </svg>
      ),
    },
    {
      key: 'testimonials',
      label: 'Testimonials',
      href: '/admin/testimonials',
      total: testimonials?.length ?? 0,
      published: testimonials?.filter((t) => t.isVisible).length ?? 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      ),
    },
    {
      key: 'faqs',
      label: 'FAQs',
      href: '/admin/faqs',
      total: faqs?.length ?? 0,
      published: faqs?.filter((f) => f.is_visible).length ?? 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
            d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
          />
        </svg>
      ),
    },
    {
      key: 'experiences',
      label: 'Experiences',
      href: '/admin/experiences',
      total: experiences?.length ?? 0,
      published: experiences?.filter((e) => e.isVisible).length ?? 0,
      color: 'bg-accent-500/10 text-accent-500',
      icon: (
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
      ),
    },
    {
      key: 'achievements',
      label: 'Achievements',
      href: '/admin/achievements',
      total: achievements?.length ?? 0,
      published: achievements?.filter((a) => a.badgeImageUrl).length ?? 0,
      color: 'bg-amber-500/10 text-amber-500',
      icon: (
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
            d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m0 0a6.03 6.03 0 01-3 0m0 0a6.022 6.022 0 01-2.77-.896"
          />
        </svg>
      ),
    },
    {
      key: 'press',
      label: 'Press Features',
      href: '/admin/press-features',
      total: pressFeatures?.length ?? 0,
      published: pressFeatures?.length ?? 0,
      color: 'bg-rose-500/10 text-rose-500',
      icon: (
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
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
          />
        </svg>
      ),
    },
    {
      key: 'appearances',
      label: 'Guest Appearances',
      href: '/admin/guest-appearances',
      total: guestAppearances?.length ?? 0,
      published: guestAppearances?.length ?? 0,
      color: 'bg-purple-500/10 text-purple-500',
      icon: (
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
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      key: 'leads',
      label: 'Leads',
      href: '/admin/leads',
      total: Array.isArray(leads) ? leads.length : 0,
      published: Array.isArray(leads) ? leads.filter((l) => l.status === 'new').length : 0,
      color: 'bg-semantic-success/10 text-semantic-success',
      icon: (
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
      ),
    },
  ];

  const totalItems = contentTypes.reduce((sum, t) => sum + t.total, 0);
  const totalPublished = contentTypes.reduce((sum, t) => sum + t.published, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Content</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Overview of all content types across your portfolio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <p className="text-h3 font-display text-text-primary">{totalItems}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Total items across all types</p>
        </div>
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <p className="text-h3 font-display text-text-primary">{totalPublished}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Published / visible items</p>
        </div>
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-5">
          <p className="text-h3 font-display text-text-primary">{totalItems - totalPublished}</p>
          <p className="text-xs text-text-tertiary mt-0.5">Drafts / hidden items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentTypes.map((type) => (
          <ContentCard key={type.key} item={type} />
        ))}
      </div>
    </div>
  );
}
