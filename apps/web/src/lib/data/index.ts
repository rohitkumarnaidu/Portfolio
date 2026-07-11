export { sections } from './sections';
export { projects } from './projects';
export { skills } from './skills';
export { experience } from './experience';
export type { ExperienceItem } from './experience';
export { blogPosts } from './blog';
export type { BlogPost } from './blog';
export { leads } from './leads';
export { DEMO_CREDENTIALS, DEMO_USER, DEMO_TOKENS } from './auth';

export const analyticsSummary = {
  total_views: 15420,
  unique_visitors: 8920,
  average_session_duration: 184,
  bounce_rate: 32.5,
  top_pages: [
    { path: '/', views: 5200 },
    { path: '/projects', views: 3100 },
    { path: '/blog', views: 2400 },
    { path: '/about', views: 1800 },
    { path: '/contact', views: 1200 },
  ],
  top_sources: [
    { source: 'Direct', visitors: 3500 },
    { source: 'GitHub', visitors: 2200 },
    { source: 'LinkedIn', visitors: 1800 },
    { source: 'Google', visitors: 1200 },
    { source: 'Twitter', visitors: 220 },
  ],
  device_breakdown: { desktop: 65, mobile: 30, tablet: 5 },
  daily_views: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
    views: Math.floor(300 + Math.random() * 700),
  })),
  period: '30d',
};
