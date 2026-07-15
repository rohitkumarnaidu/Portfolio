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

const API_BASE =
  typeof window === 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`
    : '/api';

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

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('admin_access_token');
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: FetchOptions = {},
  useServerBase = false,
): Promise<T> {
  const base = useServerBase
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`
    : API_BASE;
  const url = `${base}${endpoint}`;

  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

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

  const body: ApiResponse<T> = await res.json();
  return body.data;
}

// ── Sections ────────────────────────────────────────────────

export async function getSections(is_live?: boolean, type?: string) {
  const params = new URLSearchParams();
  if (is_live !== undefined) params.set('is_live', String(is_live));
  if (type) params.set('type', type);
  const qs = params.toString();
  return request<Section[]>(`/sections${qs ? `?${qs}` : ''}`, {
    next: { tags: [CACHE_TAGS.SECTIONS] },
  });
}

export async function getSection(idOrKey: string) {
  return request<Section>(`/sections/${idOrKey}`);
}

// ── Projects ────────────────────────────────────────────────

export async function getProjects(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  tech?: string;
  featured?: boolean;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  if (params?.category) searchParams.set('category', params.category);
  if (params?.tech) searchParams.set('tech', params.tech);
  if (params?.featured !== undefined) searchParams.set('featured', String(params.featured));
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.order) searchParams.set('order', params.order);
  const qs = searchParams.toString();
  return request<Project[]>(`/projects${qs ? `?${qs}` : ''}`, {
    next: { tags: [CACHE_TAGS.PROJECTS] },
  });
}

export async function getProject(slugOrId: string) {
  return request<Project>(`/projects/${slugOrId}`);
}

// ── Skills ──────────────────────────────────────────────────

export async function getSkills(category?: string) {
  return request<Skill[]>(`/skills${category ? `?category=${encodeURIComponent(category)}` : ''}`, {
    next: { tags: [CACHE_TAGS.SKILLS] },
  });
}

// ── Auth ───────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    display_name: string;
    role: string;
  };
}

export async function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(token: string) {
  return request<LoginResponse>('/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ refresh_token: token }),
  });
}

export async function logout() {
  return request<void>('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getProfile() {
  return request<LoginResponse['user']>('/auth/profile');
}

// ── Experiences ─────────────────────────────────────────────

export async function getExperiences() {
  return request<Experience[]>('/experiences', {
    next: { tags: [CACHE_TAGS.EXPERIENCES] },
  });
}

export async function createExperience(data: Partial<Experience>) {
  return request<Experience>('/experiences', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateExperience(id: string, data: Partial<Experience>) {
  return request<Experience>(`/experiences/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteExperience(id: string) {
  return request<void>(`/experiences/${id}`, { method: 'DELETE' });
}

// ── Testimonials ────────────────────────────────────────────

export async function getTestimonials() {
  return request<Testimonial[]>('/testimonials', {
    next: { tags: [CACHE_TAGS.TESTIMONIALS] },
  });
}

export async function createTestimonial(data: Partial<Testimonial>) {
  return request<Testimonial>('/testimonials', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTestimonial(id: string, data: Partial<Testimonial>) {
  return request<Testimonial>(`/testimonials/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(id: string) {
  return request<void>(`/testimonials/${id}`, { method: 'DELETE' });
}

// ── Admin: Blog Posts ───────────────────────────────────────

export async function getBlogPosts() {
  return request<BlogPost[]>('/admin/blog', {
    next: { tags: [CACHE_TAGS.BLOG] },
  });
}

export async function getBlogPost(slugOrId: string) {
  return request<BlogPost>(`/admin/blog/${slugOrId}`, {
    next: { tags: [CACHE_TAGS.BLOG] },
  });
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
  return request<Service[]>('/services');
}

export async function createAdminService(data: Partial<Service>) {
  return request<Service>('/services', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAdminService(id: string, data: Partial<Service>) {
  return request<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteAdminService(id: string) {
  return request<void>(`/services/${id}`, { method: 'DELETE' });
}

// ── Admin: FAQs ─────────────────────────────────────────────

export async function getFAQs() {
  return request<FAQ[]>('/faqs');
}

export async function createFAQ(data: Partial<FAQ>) {
  return request<FAQ>('/faqs', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateFAQ(id: string, data: Partial<FAQ>) {
  return request<FAQ>(`/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteFAQ(id: string) {
  return request<void>(`/faqs/${id}`, { method: 'DELETE' });
}

// ── Admin: Activities ───────────────────────────────────────

export interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  actor_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function getActivities(params?: { page?: number; per_page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  const qs = searchParams.toString();
  return request<Activity[]>(`/activities${qs ? `?${qs}` : ''}`);
}

export async function getActivity(id: string) {
  return request<Activity>(`/activities/${id}`);
}

export function getActivitiesExportUrl() {
  const token = getAuthToken();
  return `/api/activities/export?token=${token ? encodeURIComponent(token) : ''}`;
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
}) {
  return request<Lead>('/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Admin: Media Assets ─────────────────────────────────────

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

export async function getMediaAssets(params?: { page?: number; per_page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.per_page) searchParams.set('per_page', String(params.per_page));
  const qs = searchParams.toString();
  return request<MediaAsset[]>(`/media${qs ? `?${qs}` : ''}`);
}

export async function uploadMediaAsset(file: File, altText?: string) {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append('file', file);
  if (altText) formData.append('altText', altText);

  const url = `${API_BASE}/media`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'UPLOAD_FAILED', 'Failed to upload file');
  }

  const body = await res.json();
  return body.data as MediaAsset;
}

export async function deleteMediaAsset(id: string) {
  return request<void>(`/media/${id}`, { method: 'DELETE' });
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
  const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  return request<CaseStudy[]>(`/case-studies${qs}`, {
    next: { tags: [CACHE_TAGS.CASE_STUDIES] },
  });
}

export async function getCaseStudy(id: string) {
  return request<CaseStudy>(`/case-studies/${id}`);
}

// ── Public: Chat ────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  createdAt: string;
}

export async function sendChatMessage(sessionId: string, content: string, pageContext?: string) {
  return request<{ conversationId: string; message: ChatMessage }>('/chat/messages', {
    method: 'POST',
    body: JSON.stringify({ sessionId, content, pageContext }),
  });
}

export async function getChatMessages(sessionId: string) {
  return request<ChatMessage[]>(`/chat/${sessionId}/messages`);
}

// ── Admin: Case Studies ─────────────────────────────────────

export async function createCaseStudy(data: Partial<CaseStudy>) {
  return request<CaseStudy>('/case-studies', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCaseStudy(id: string, data: Partial<CaseStudy>) {
  return request<CaseStudy>(`/case-studies/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteCaseStudy(id: string) {
  return request<void>(`/case-studies/${id}`, { method: 'DELETE' });
}

// ── Admin: Projects CRUD ────────────────────────────────────

export async function createProject(data: Partial<Project>) {
  return request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProject(id: string, data: Partial<Project>) {
  return request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteProject(id: string) {
  return request<void>(`/projects/${id}`, { method: 'DELETE' });
}

// ── Admin: Sections CRUD ────────────────────────────────────

export async function createSection(data: Record<string, unknown>) {
  return request<Section>('/sections', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateSection(id: string, data: Record<string, unknown>) {
  return request<Section>(`/sections/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteSection(id: string) {
  return request<void>(`/sections/${id}`, { method: 'DELETE' });
}

export async function reorderSections(ids: string[]) {
  return request<void>('/sections/reorder', { method: 'POST', body: JSON.stringify({ ids }) });
}

// ── Admin: Skills CRUD ──────────────────────────────────────

export async function createSkill(data: Partial<Skill>) {
  return request<Skill>('/skills', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateSkill(id: string, data: Partial<Skill>) {
  return request<Skill>(`/skills/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteSkill(id: string) {
  return request<void>(`/skills/${id}`, { method: 'DELETE' });
}

// ── Admin: Leads ────────────────────────────────────────────

export async function getLeads(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  source?: string;
  search?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.per_page) sp.set('per_page', String(params.per_page));
  if (params?.status) sp.set('status', params.status);
  if (params?.source) sp.set('source', params.source);
  if (params?.search) sp.set('search', params.search);
  return request<Lead[]>(`/leads${sp.toString() ? `?${sp.toString()}` : ''}`);
}

export async function getLead(id: string) {
  return request<Lead>(`/leads/${id}`);
}

export async function updateLead(id: string, data: Partial<Lead>) {
  return request<Lead>(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function getLeadsExportUrl(_page?: number, _perPage?: number, status?: string) {
  const token = getAuthToken();
  const sp = new URLSearchParams();
  sp.set('token', token ? encodeURIComponent(token) : '');
  if (status) sp.set('status', status);
  return `/api/leads/export?${sp.toString()}`;
}

// ── Admin: Analytics ────────────────────────────────────────

export interface AnalyticsSummary {
  total_visitors: number;
  total_page_views: number;
  active_visitors: number;
  bounce_rate: number;
  avg_session_duration: number;
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
  const qs = period ? `?period=${encodeURIComponent(period)}` : '';
  return request<AnalyticsSummary>(`/analytics/summary${qs}`);
}

export async function getAnalyticsSessions(params?: {
  page?: number;
  per_page?: number;
  from?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.per_page) sp.set('per_page', String(params.per_page));
  if (params?.from) sp.set('from', params.from);
  return request<AnalyticsSession[]>(
    `/analytics/sessions${sp.toString() ? `?${sp.toString()}` : ''}`,
  );
}

// ── Admin: Achievements ─────────────────────────────────────

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

export async function getAchievements(params?: { category?: string }) {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  const qs = sp.toString();
  return request<Achievement[]>(`/portfolio/achievements${qs ? `?${qs}` : ''}`);
}

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

export async function getPressFeatures() {
  return request<PressFeature[]>('/portfolio/press-features');
}

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

export async function getSettings() {
  return request<SystemSetting[]>('/admin/system-settings');
}

export async function getSetting(key: string) {
  return request<SystemSetting>(`/admin/system-settings/${key}`);
}

export async function upsertSetting(key: string, data: Partial<SystemSetting>) {
  return request<SystemSetting>(`/admin/system-settings/${key}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteSetting(key: string) {
  return request<void>(`/admin/system-settings/${key}`, { method: 'DELETE' });
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

export async function getGuestAppearances(params?: { type?: string }) {
  const sp = new URLSearchParams();
  if (params?.type) sp.set('type', params.type);
  const qs = sp.toString();
  return request<GuestAppearance[]>(`/portfolio/guest-appearances${qs ? `?${qs}` : ''}`);
}

export async function getAdminGuestAppearances() {
  return request<GuestAppearance[]>('/admin/guest-appearances');
}

// ── Public: Reading List Items ──────────────────────────────

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

export async function getReadingListItems(params?: { category?: string }) {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  const qs = sp.toString();
  return request<ReadingListItem[]>(`/portfolio/reading-list-items${qs ? `?${qs}` : ''}`);
}

// ── Public: Availability Status ─────────────────────────────

export interface AvailabilityStatus {
  id: string;
  status: 'available' | 'limited' | 'unavailable';
  label: string;
  description?: string;
  updatedAt: string;
}

export async function getAvailabilityStatus() {
  return request<AvailabilityStatus>('/portfolio/availability-status');
}

export async function getAdminAvailabilityStatus() {
  return request<AvailabilityStatus>('/admin/availability-status');
}

export async function updateAvailabilityStatus(data: Partial<AvailabilityStatus>) {
  return request<AvailabilityStatus>('/admin/availability-status', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Admin: Guest Appearances CRUD ────────────────────────────────

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

// ── Admin: Reading List Items CRUD ───────────────────────────────

export async function getAdminReadingListItems(params?: { category?: string }) {
  const sp = new URLSearchParams();
  if (params?.category) sp.set('category', params.category);
  const qs = sp.toString();
  return request<ReadingListItem[]>(`/admin/reading-list-items${qs ? `?${qs}` : ''}`);
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

// ── Admin: Users ─────────────────────────────────────────────────

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
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.perPage) sp.set('perPage', String(params.perPage));
  if (params?.search) sp.set('search', params.search);
  if (params?.role) sp.set('role', params.role);
  const qs = sp.toString();
  return request<User[]>(`/admin/users${qs ? `?${qs}` : ''}`);
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

// ── Admin: Notifications ──────────────────────────────────────────

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
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.perPage) sp.set('perPage', String(params.perPage));
  if (params?.isRead !== undefined) sp.set('isRead', String(params.isRead));
  if (params?.type) sp.set('type', params.type);
  const qs = sp.toString();
  return request<Notification[]>(`/admin/notifications${qs ? `?${qs}` : ''}`);
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

// ── Admin: API Keys ──────────────────────────────────────────────

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
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.perPage) sp.set('perPage', String(params.perPage));
  const qs = sp.toString();
  return request<ApiKey[]>(`/admin/api-keys${qs ? `?${qs}` : ''}`);
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

// ── Admin: Feature Flags ─────────────────────────────────────────

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

// ── Admin: Chat Conversations ────────────────────────────────────────

export interface ChatConversation {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { messages: number };
}

export async function getChatConversations(params?: { page?: number; perPage?: number }) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.perPage) sp.set('perPage', String(params.perPage));
  const qs = sp.toString();
  return request<ChatConversation[]>(`/admin/chat/conversations${qs ? `?${qs}` : ''}`);
}

export async function getChatConversationMessages(
  id: string,
  params?: { page?: number; perPage?: number },
) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set('page', String(params.page));
  if (params?.perPage) sp.set('perPage', String(params.perPage));
  const qs = sp.toString();
  return request<ChatMessage[]>(`/admin/chat/${id}/messages${qs ? `?${qs}` : ''}`);
}

export async function deleteChatConversation(id: string) {
  return request<void>(`/admin/chat/${id}`, { method: 'DELETE' });
}
