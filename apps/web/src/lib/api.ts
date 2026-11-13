import type {
  Section,
  Project,
  Skill,
  Lead,
  Experience,
  Testimonial,
  BlogPost,
  Service,
  FAQ,
} from '@portfolio/shared';
import { CACHE_TAGS } from './cache-tags';

const SERVER_API_ORIGIN =
  process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const API_BASE = typeof window === 'undefined' ? `${SERVER_API_ORIGIN}/api` : '/api';

interface FetchOptions extends RequestInit {
  next?: { tags?: string[]; revalidate?: number };
}

// ── Error Types ─────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status_code: number,
    public code: string,
    message: string,
    public details?: Array<{ field?: string; message: string; code: string }>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Response Envelope ──────────────────────────────────────

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

// ── Fetch Wrapper ───────────────────────────────────────────

let refreshPromise: Promise<unknown> | null = null;

// These endpoints must never trigger the automatic refresh-and-replay loop:
// login failures are real 401s, and refresh/logout handle tokens themselves.
const REFRESH_EXCLUDED_ENDPOINTS = [
  '/admin/auth/login',
  '/admin/auth/refresh',
  '/admin/auth/logout',
];

async function request<T>(
  endpoint: string,
  options: FetchOptions = {},
  useServerBase = false,
  skipAuthRefresh = false,
): Promise<T> {
  const base = useServerBase ? `${SERVER_API_ORIGIN}/api` : API_BASE;
  const url = `${base}${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {};
  if (!isFormData && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  // Access tokens are short-lived; refresh once and replay the request.
  // Server components have no cookie jar, so this only runs in the browser.
  if (
    res.status === 401 &&
    !skipAuthRefresh &&
    typeof window !== 'undefined' &&
    !REFRESH_EXCLUDED_ENDPOINTS.some((path) => endpoint.startsWith(path))
  ) {
    try {
      refreshPromise ??= refreshToken().finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      return request<T>(endpoint, options, useServerBase, true);
    } catch {
      // Fall through to the original 401 so the caller sees the real error.
    }
  }

  if (!res.ok) {
    let body: Record<string, unknown>;
    try {
      body = await res.json();
    } catch {
      throw new ApiError(res.status, 'UNKNOWN_ERROR', 'An unexpected error occurred');
    }

    const error = (body?.error || body) as Record<string, unknown>;
    throw new ApiError(
      res.status,
      (error?.code as string) || 'UNKNOWN_ERROR',
      (error?.message as string) || 'An unexpected error occurred',
      error?.details as Array<{ field?: string; message: string; code: string }> | undefined,
    );
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json()) as ApiResponse<T> | T;
  // Normalize both the enveloped contract and any legacy bare responses.
  if (body !== null && typeof body === 'object' && 'data' in (body as Record<string, unknown>)) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
}

function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') sp.set(key, String(value));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

// ── Auth ────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export async function login(email: string, password: string) {
  return request<LoginResponse>('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(token?: string) {
  return request<LoginResponse>(
    '/admin/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify(token ? { refresh_token: token } : {}),
    },
    false,
    true,
  );
}

export async function logout() {
  return request<void>('/admin/auth/logout', { method: 'POST' });
}

export async function getProfile() {
  return request<AuthUser>('/admin/auth/profile');
}

// ── Public: Sections ────────────────────────────────────────

export async function getSection(idOrKey: string) {
  return request<Section>(`/portfolio/sections/${idOrKey}`);
}

// ── Public: Projects ────────────────────────────────────────

export async function getProjects(params?: {
  page?: number;
  per_page?: number;
  perPage?: number;
  category?: string;
  tech?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  return request<Project[]>(
    `/portfolio/projects${toQuery({
      page: params?.page,
      perPage: params?.perPage ?? params?.per_page,
      category: params?.category,
      featured: params?.featured,
    })}`,
    { next: { tags: [CACHE_TAGS.PROJECTS] } },
  );
}

export async function getProject(slugOrId: string) {
  return request<Project>(`/portfolio/projects/${slugOrId}`);
}

// ── Public: Blog ────────────────────────────────────────────

export async function getPublishedBlogPosts(params?: {
  category?: string;
  page?: number;
  per_page?: number;
  perPage?: number;
}) {
  return request<BlogPost[]>(
    `/portfolio/blog${toQuery({
      category: params?.category,
      page: params?.page,
      perPage: params?.perPage ?? params?.per_page,
    })}`,
    { next: { tags: [CACHE_TAGS.BLOG] } },
  );
}

export async function getPublishedBlogPost(slugOrId: string) {
  return request<BlogPost>(`/portfolio/blog/${slugOrId}`, {
    next: { tags: [CACHE_TAGS.BLOG] },
  });
}

// ── Public: Achievements ────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  description: string;
  badgeImageUrl?: string;
  category?: string;
  achievedDate?: string;
  credentialUrl?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── Public: Press Features ──────────────────────────────────

export interface PressFeature {
  id: string;
  publication: string;
  title: string;
  url: string;
  logoUrl?: string;
  description?: string;
  featuredDate?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── Public: Guest Appearances ───────────────────────────────

export interface GuestAppearance {
  id: string;
  type: 'podcast' | 'talk' | 'interview' | 'webinar';
  title: string;
  host: string;
  url?: string;
  description?: string;
  date: string;
  duration?: string;
  embedUrl?: string;
  createdAt: string;
}

// ── Public: Reading List ────────────────────────────────────

export interface ReadingListItem {
  id: string;
  title: string;
  author: string;
  category: 'currently_reading' | 'books' | 'articles' | 'recommendations';
  coverUrl?: string;
  url?: string;
  description?: string;
  completedDate?: string;
  createdAt: string;
}

// ── Public: Availability ────────────────────────────────────

export interface AvailabilityStatus {
  id: string;
  isAvailable: boolean;
  statusLabel: string;
  availableUntil: string | null;
  preferredContact: string;
  updatedAt: string;
}

// ── Public: Media ───────────────────────────────────────────

export interface MediaAsset {
  id: string;
  fileName: string;
  filePath: string;
  bucketName: string;
  mimeType: string;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  variants: Record<string, unknown>;
  createdAt: string;
  deletedAt: string | null;
}

// ── Public: Case Studies ────────────────────────────────────

export interface CaseStudy {
  id: string;
  projectId: string;
  challenge?: string;
  approach?: string;
  solution?: string;
  impact?: string;
  architectureDiagrams: string[];
  codeSnippets: string[];
  metrics: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export async function getCaseStudies(projectId?: string) {
  return request<CaseStudy[]>(`/portfolio/case-studies${toQuery({ projectId })}`, {
    next: { tags: [CACHE_TAGS.CASE_STUDIES] },
  });
}

export async function getCaseStudy(id: string) {
  return request<CaseStudy>(`/portfolio/case-studies/${id}`);
}

// ── Public: Chat ────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

// ── Public: Leads ───────────────────────────────────────────

export async function submitLead(data: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}) {
  return request<Lead>('/portfolio/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Admin: Blog Posts ───────────────────────────────────────

export async function getBlogPosts(params?: { page?: number; per_page?: number; search?: string }) {
  return request<BlogPost[]>(
    `/admin/blog${toQuery({
      page: params?.page,
      perPage: params?.per_page,
      search: params?.search,
    })}`,
  );
}

export const getAdminBlogPosts = getBlogPosts;

export async function getBlogPost(slugOrId: string) {
  return request<BlogPost>(`/admin/blog/${slugOrId}`);
}

export async function createBlogPost(data: Partial<BlogPost>) {
  return request<BlogPost>('/admin/blog', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>) {
  return request<BlogPost>(`/admin/blog/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteBlogPost(id: string) {
  return request<void>(`/admin/blog/${id}`, { method: 'DELETE' });
}

// ── Admin: Blog Tags ────────────────────────────────────────

export interface BlogTag {
  name: string;
  postCount: number;
}

export async function getBlogTags() {
  return request<BlogTag[]>('/admin/blog/tags');
}

export async function addBlogTag(postId: string, tag: string) {
  return request<string[]>(`/admin/blog/${postId}/tags`, {
    method: 'POST',
    body: JSON.stringify({ tag }),
  });
}

export async function removeBlogTag(postId: string, tag: string) {
  return request<string[]>(`/admin/blog/${postId}/tags/${encodeURIComponent(tag)}`, {
    method: 'DELETE',
  });
}

// ── Admin: Services ─────────────────────────────────────────

export async function getAdminServices() {
  return request<Service[]>('/admin/services');
}

export async function createAdminService(data: Partial<Service>) {
  return request<Service>('/admin/services', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAdminService(id: string, data: Partial<Service>) {
  return request<Service>(`/admin/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminService(id: string) {
  return request<void>(`/admin/services/${id}`, { method: 'DELETE' });
}

// ── Admin: FAQs ─────────────────────────────────────────────

export async function getAdminFAQs(params?: { category?: string }) {
  return request<FAQ[]>(`/admin/faqs${toQuery({ category: params?.category })}`);
}

export async function createFAQ(data: Partial<FAQ>) {
  return request<FAQ>('/admin/faqs', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateFAQ(id: string, data: Partial<FAQ>) {
  return request<FAQ>(`/admin/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteFAQ(id: string) {
  return request<void>(`/admin/faqs/${id}`, { method: 'DELETE' });
}

// ── Admin: Activities ───────────────────────────────────────

export interface Activity {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  adminId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export async function getActivities(params?: { page?: number; perPage?: number }) {
  return request<Activity[]>(
    `/admin/activities${toQuery({ page: params?.page, perPage: params?.perPage })}`,
  );
}

export async function getActivity(id: string) {
  return request<Activity>(`/admin/activities/${id}`);
}

export function getActivitiesExportUrl() {
  return '/api/admin/activities/export';
}

// ── Admin: Media Assets ─────────────────────────────────────

export async function getMediaAssets(params?: { page?: number; per_page?: number }) {
  return request<MediaAsset[]>(
    `/admin/media${toQuery({ page: params?.page, perPage: params?.per_page })}`,
  );
}

export async function uploadMediaAsset(file: File, altText?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (altText) formData.append('altText', altText);

  return request<MediaAsset>('/admin/media/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteMediaAsset(id: string) {
  return request<void>(`/admin/media/${id}`, { method: 'DELETE' });
}

// ── Admin: Case Studies ─────────────────────────────────────

export async function getAdminCaseStudies(projectId?: string) {
  return request<CaseStudy[]>(`/admin/case-studies${toQuery({ projectId })}`);
}

export async function createCaseStudy(data: Partial<CaseStudy>) {
  return request<CaseStudy>('/admin/case-studies', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCaseStudy(id: string, data: Partial<CaseStudy>) {
  return request<CaseStudy>(`/admin/case-studies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCaseStudy(id: string) {
  return request<void>(`/admin/case-studies/${id}`, { method: 'DELETE' });
}

// ── Admin: Projects ─────────────────────────────────────────

export async function getAdminProjects(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  featured?: boolean;
  search?: string;
}) {
  return request<Project[]>(
    `/admin/projects${toQuery({
      page: params?.page,
      perPage: params?.per_page,
      category: params?.category,
      featured: params?.featured,
      search: params?.search,
    })}`,
  );
}

export async function createProject(data: Partial<Project>) {
  return request<Project>('/admin/projects', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProject(id: string, data: Partial<Project>) {
  return request<Project>(`/admin/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string) {
  return request<void>(`/admin/projects/${id}`, { method: 'DELETE' });
}

// ── Admin: Sections ─────────────────────────────────────────

export async function getAdminSections(params?: {
  page?: number;
  per_page?: number;
  search?: string;
}) {
  return request<Section[]>(
    `/admin/sections${toQuery({
      page: params?.page,
      perPage: params?.per_page,
      search: params?.search,
    })}`,
  );
}

export async function createSection(data: Record<string, unknown>) {
  return request<Section>('/admin/sections', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateSection(id: string, data: Record<string, unknown>) {
  return request<Section>(`/admin/sections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteSection(id: string) {
  return request<void>(`/admin/sections/${id}`, { method: 'DELETE' });
}

export async function reorderSections(order: Array<{ id: string; display_order: number }>) {
  return request<Section[]>('/admin/sections/reorder', {
    method: 'PUT',
    body: JSON.stringify(
      order.map(({ id, display_order }) => ({ id, displayOrder: display_order })),
    ),
  });
}

// ── Admin: Skills ───────────────────────────────────────────

export async function getAdminSkills(category?: string) {
  return request<Skill[]>(`/admin/skills${toQuery({ category })}`);
}

export async function createSkill(data: Partial<Skill>) {
  return request<Skill>('/admin/skills', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateSkill(id: string, data: Partial<Skill>) {
  return request<Skill>(`/admin/skills/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteSkill(id: string) {
  return request<void>(`/admin/skills/${id}`, { method: 'DELETE' });
}

// ── Admin: Experiences ──────────────────────────────────────

export async function getAdminExperiences() {
  return request<Experience[]>('/admin/experiences');
}

export async function createExperience(data: Partial<Experience>) {
  return request<Experience>('/admin/experiences', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExperience(id: string, data: Partial<Experience>) {
  return request<Experience>(`/admin/experiences/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteExperience(id: string) {
  return request<void>(`/admin/experiences/${id}`, { method: 'DELETE' });
}

// ── Admin: Testimonials ─────────────────────────────────────

export async function getAdminTestimonials() {
  return request<Testimonial[]>('/admin/testimonials');
}

export async function createTestimonial(data: Partial<Testimonial>) {
  return request<Testimonial>('/admin/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>) {
  return request<Testimonial>(`/admin/testimonials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(id: string) {
  return request<void>(`/admin/testimonials/${id}`, { method: 'DELETE' });
}

// ── Admin: Leads ────────────────────────────────────────────

export async function getLeads(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  source?: string;
  search?: string;
}) {
  return request<Lead[]>(
    `/admin/leads${toQuery({
      page: params?.page,
      perPage: params?.per_page,
      status: params?.status,
      source: params?.source,
      search: params?.search,
    })}`,
  );
}

export async function getLead(id: string) {
  return request<Lead>(`/admin/leads/${id}`);
}

export async function updateLead(id: string, data: Partial<Lead>) {
  return request<Lead>(`/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function getLeadsExportUrl() {
  return '/api/admin/leads/export';
}

// ── Admin: Analytics ────────────────────────────────────────

export interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  totalSessions: number;
  avgSessionDurationSeconds: number;
  bounceRate: number;
  pageViewsByUrl: Record<string, number>;
  period: string;
  // snake_case aliases included by the API response envelope.
  total_page_views: number;
  total_visitors: number;
  active_visitors: number;
  avg_session_duration: number;
  bounce_rate: number;
  top_pages: Array<{ path: string; views: number }>;
  visitors_over_time: Array<{ date: string; visitors: number; page_views: number }>;
}

export interface AnalyticsSession {
  id: string;
  visitor_id: string;
  path: string;
  referrer: string | null;
  duration_seconds: number;
  is_bounce: boolean;
  user_agent: string | null;
  created_at: string;
}

export async function getAnalyticsSummary(period?: string) {
  return request<AnalyticsSummary>(`/admin/analytics/summary${toQuery({ period })}`);
}

export async function getAnalyticsSessions(params?: {
  page?: number;
  per_page?: number;
  from?: string;
}) {
  return request<AnalyticsSession[]>(
    `/admin/analytics/sessions${toQuery({
      page: params?.page,
      perPage: params?.per_page,
      from: params?.from,
    })}`,
  );
}

// ── Admin: Achievements ─────────────────────────────────────

export async function getAdminAchievements() {
  return request<Achievement[]>('/admin/achievements');
}

export async function getAchievement(id: string) {
  return request<Achievement>(`/admin/achievements/${id}`);
}

export async function createAchievement(data: Partial<Achievement>) {
  return request<Achievement>('/admin/achievements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAchievement(id: string, data: Partial<Achievement>) {
  return request<Achievement>(`/admin/achievements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteAchievement(id: string) {
  return request<void>(`/admin/achievements/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteAchievements(ids: string[]) {
  await Promise.all(ids.map((id) => deleteAchievement(id)));
}

// ── Admin: Press Features ───────────────────────────────────

export async function getAdminPressFeatures() {
  return request<PressFeature[]>('/admin/press-features');
}

export async function getPressFeature(id: string) {
  return request<PressFeature>(`/admin/press-features/${id}`);
}

export async function createPressFeature(data: Partial<PressFeature>) {
  return request<PressFeature>('/admin/press-features', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePressFeature(id: string, data: Partial<PressFeature>) {
  return request<PressFeature>(`/admin/press-features/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deletePressFeature(id: string) {
  return request<void>(`/admin/press-features/${id}`, { method: 'DELETE' });
}

export async function bulkDeletePressFeatures(ids: string[]) {
  await Promise.all(ids.map((id) => deletePressFeature(id)));
}

// ── Admin: System Settings ──────────────────────────────────

export interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  settingGroup: string;
  settingType: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeSetting(raw: Record<string, unknown>): SystemSetting {
  return {
    ...(raw as unknown as SystemSetting),
    settingType: (raw.settingType ?? raw.dataType ?? 'string') as SystemSetting['settingType'],
  };
}

export async function getSettings() {
  const settings = await request<Record<string, unknown>[]>('/admin/settings');
  return settings.map(normalizeSetting);
}

export async function getSetting(key: string) {
  const setting = await request<Record<string, unknown>>(`/admin/settings/${key}`);
  return normalizeSetting(setting);
}

export async function upsertSetting(key: string, data: Partial<SystemSetting>) {
  const setting = await request<Record<string, unknown>>(`/admin/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({
      settingValue: data.settingValue,
      settingGroup: data.settingGroup,
      description: data.description,
      dataType: data.settingType,
    }),
  });
  return normalizeSetting(setting);
}

export async function deleteSetting(key: string) {
  return request<void>(`/admin/settings/${key}`, { method: 'DELETE' });
}

// ── Admin: Guest Appearances ────────────────────────────────

export async function getAdminGuestAppearances() {
  return request<GuestAppearance[]>('/admin/guest-appearances');
}

export async function getGuestAppearance(id: string) {
  return request<GuestAppearance>(`/admin/guest-appearances/${id}`);
}

export async function createGuestAppearance(data: Partial<GuestAppearance>) {
  return request<GuestAppearance>('/admin/guest-appearances', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateGuestAppearance(id: string, data: Partial<GuestAppearance>) {
  return request<GuestAppearance>(`/admin/guest-appearances/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteGuestAppearance(id: string) {
  return request<void>(`/admin/guest-appearances/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteGuestAppearances(ids: string[]) {
  await Promise.all(ids.map((id) => deleteGuestAppearance(id)));
}

// ── Admin: Reading List Items ───────────────────────────────

export async function getAdminReadingListItems(params?: { category?: string }) {
  return request<ReadingListItem[]>(
    `/admin/reading-list-items${toQuery({ category: params?.category })}`,
  );
}

export async function getReadingListItem(id: string) {
  return request<ReadingListItem>(`/admin/reading-list-items/${id}`);
}

export async function createReadingListItem(data: Partial<ReadingListItem>) {
  return request<ReadingListItem>('/admin/reading-list-items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateReadingListItem(id: string, data: Partial<ReadingListItem>) {
  return request<ReadingListItem>(`/admin/reading-list-items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteReadingListItem(id: string) {
  return request<void>(`/admin/reading-list-items/${id}`, { method: 'DELETE' });
}

export async function bulkDeleteReadingListItems(ids: string[]) {
  await Promise.all(ids.map((id) => deleteReadingListItem(id)));
}

// ── Admin: Availability ─────────────────────────────────────

export async function getAdminAvailabilityStatus() {
  return request<AvailabilityStatus>('/admin/availability-status');
}

export async function updateAvailabilityStatus(data: Partial<AvailabilityStatus>) {
  return request<AvailabilityStatus>('/admin/availability-status', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Admin: Users ────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export async function getUsers(params?: {
  page?: number;
  perPage?: number;
  search?: string;
  role?: string;
}) {
  return request<User[]>(`/admin/users${toQuery(params ?? {})}`);
}

export async function getUser(id: string) {
  return request<User>(`/admin/users/${id}`);
}

export async function createUser(data: {
  email: string;
  displayName: string;
  password?: string;
  role?: string;
}) {
  return request<User>('/admin/users', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateUser(id: string, data: Partial<User>) {
  return request<User>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function updateUserRole(id: string, role: string) {
  return request<User>(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function unlockUser(id: string) {
  return request<void>(`/admin/users/${id}/unlock`, { method: 'POST' });
}

export async function deleteUser(id: string) {
  return request<void>(`/admin/users/${id}`, { method: 'DELETE' });
}

// ── Admin: Notifications ────────────────────────────────────

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  channel: string;
  createdAt: string;
}

export async function getNotifications(params?: {
  page?: number;
  perPage?: number;
  isRead?: boolean;
  type?: string;
}) {
  return request<Notification[]>(`/admin/notifications${toQuery(params ?? {})}`);
}

export async function getUnreadNotificationCount() {
  return request<{ count: number }>('/admin/notifications/unread-count');
}

export async function markNotificationRead(id: string) {
  return request<void>(`/admin/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return request<void>('/admin/notifications/read-all', { method: 'PATCH' });
}

export async function deleteNotification(id: string) {
  return request<void>(`/admin/notifications/${id}`, { method: 'DELETE' });
}

// ── Admin: API Keys ─────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string | null;
  isRevoked: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export async function getApiKeys(params?: { page?: number; perPage?: number }) {
  return request<ApiKey[]>(`/admin/api-keys${toQuery(params ?? {})}`);
}

export async function getApiKey(id: string) {
  return request<ApiKey>(`/admin/api-keys/${id}`);
}

export async function createApiKey(data: { name: string; permissions?: string }) {
  return request<{ apiKey: ApiKey; rawKey: string }>('/admin/api-keys', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function revokeApiKey(id: string) {
  return request<void>(`/admin/api-keys/${id}/revoke`, { method: 'POST' });
}

export async function deleteApiKey(id: string) {
  return request<void>(`/admin/api-keys/${id}`, { method: 'DELETE' });
}

// ── Admin: Feature Flags ────────────────────────────────────

export interface FeatureFlag {
  id: string;
  flagKey: string;
  description: string | null;
  isEnabled: boolean;
  targetingRules: Record<string, unknown> | null;
  rolloutPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export async function getFeatureFlags() {
  return request<FeatureFlag[]>('/admin/feature-flags');
}

export async function getFeatureFlag(key: string) {
  return request<FeatureFlag>(`/admin/feature-flags/${key}`);
}

export async function createFeatureFlag(data: Partial<FeatureFlag>) {
  return request<FeatureFlag>('/admin/feature-flags', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateFeatureFlag(key: string, data: Partial<FeatureFlag>) {
  return request<FeatureFlag>(`/admin/feature-flags/${key}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteFeatureFlag(key: string) {
  return request<void>(`/admin/feature-flags/${key}`, { method: 'DELETE' });
}

// ── Admin: Chat Conversations ───────────────────────────────

export interface ChatConversation {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export async function getChatConversations(params?: { page?: number; perPage?: number }) {
  return request<ChatConversation[]>(`/admin/chat/conversations${toQuery(params ?? {})}`);
}

export async function getChatConversationMessages(
  id: string,
  params?: { page?: number; perPage?: number },
) {
  return request<ChatMessage[]>(`/admin/chat/${id}/messages${toQuery(params ?? {})}`);
}

export async function deleteChatConversation(id: string) {
  return request<void>(`/admin/chat/${id}`, { method: 'DELETE' });
}
