// SHARED SCHEMAS - Source of Truth
// These Zod schemas define the data contracts shared between web and api.
// NestJS DTOs (apps/api/src/modules/*/dto/) should mirror these schemas.
// When adding new fields, update BOTH the Zod schema AND the class-validator DTO.

import { z } from 'zod';

// ============================================
// Branded Types
// ============================================

export type UserId = string & { readonly __brand: 'UserId' };
export type ProjectId = string & { readonly __brand: 'ProjectId' };
export type SectionId = string & { readonly __brand: 'SectionId' };
export type SkillId = string & { readonly __brand: 'SkillId' };
export type LeadId = string & { readonly __brand: 'LeadId' };
export type TestimonialId = string & { readonly __brand: 'TestimonialId' };
export type BlogPostId = string & { readonly __brand: 'BlogPostId' };
export type ServiceId = string & { readonly __brand: 'ServiceId' };
export type FAQId = string & { readonly __brand: 'FAQId' };
export type ExperienceId = string & { readonly __brand: 'ExperienceId' };

// ============================================
// Zod Schemas (runtime validation)
// ============================================

export const SectionSchema = z.object({
  id: z.string().uuid(),
  section_key: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z_]+$/),
  section_label: z.string().min(1).max(100),
  section_type: z.string().optional(),
  is_live: z.boolean().default(false),
  style_preset: z.string().default('default'),
  display_order: z.number().int().min(0).default(0),
  min_items: z.number().int().min(1).default(1),
  auto_publish: z.boolean().default(false),
  is_always_visible: z.boolean().default(false),
  style_config: z.record(z.unknown()).default({}),
  content: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateSectionSchema = SectionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateSectionSchema = CreateSectionSchema.partial();

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  tech_stack: z.array(z.string()).max(20).default([]),
  live_url: z.string().url().optional().or(z.literal('')),
  github_url: z.string().url().optional().or(z.literal('')),
  cover_image: z.string().optional(),
  thumbnail_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_private: z.boolean().default(false),
  category: z.enum(['web', 'mobile', 'ai', 'devops', 'design', 'other']).optional(),
  display_order: z.number().int().min(0).default(0),
  content: z.record(z.unknown()).default({}),
  metrics: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const SkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  category: z.string().min(1),
  proficiency: z.number().int().min(0).max(100),
  icon_url: z.string().optional(),
  lottie_url: z.string().optional(),
  display_order: z.number().int().min(0).default(0),
  is_featured: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateSkillSchema = SkillSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateSkillSchema = CreateSkillSchema.partial();

export const LeadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10).max(5000),
  source: z.enum(['contact_form', 'ai_chat', 'referral', 'direct']).default('contact_form'),
  status: z.enum(['new', 'read', 'replied', 'converted', 'archived']).default('new'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.record(z.unknown()).default({}),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateLeadSchema = LeadSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

export const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  display_name: z.string().min(2).max(100),
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string().min(1),
});

// ============================================
// TypeScript Interfaces (compile-time types)
// ============================================

export interface Section {
  id: SectionId | string;
  section_key: string;
  section_label: string;
  section_type?: string;
  is_live: boolean;
  style_preset: string;
  display_order: number;
  min_items: number;
  auto_publish: boolean;
  is_always_visible: boolean;
  style_config: Record<string, unknown>;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: ProjectId | string;
  slug: string;
  title: string;
  description?: string;
  tech_stack: string[];
  live_url?: string;
  github_url?: string;
  cover_image?: string;
  thumbnail_url?: string;
  is_featured: boolean;
  is_private: boolean;
  category?: 'web' | 'mobile' | 'ai' | 'devops' | 'design' | 'other';
  display_order: number;
  content: Record<string, unknown>;
  metrics: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: SkillId | string;
  name: string;
  category: string;
  proficiency: number;
  icon_url?: string;
  lottie_url?: string;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: LeadId | string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  source: 'contact_form' | 'ai_chat' | 'referral' | 'direct';
  status: 'new' | 'read' | 'replied' | 'converted' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: UserId | string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer';
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    status_code: number;
    details?: Array<{
      field?: string;
      message: string;
      code: string;
    }>;
    correlation_id?: string;
    timestamp: string;
  };
}

// ============================================
// Phase 2: Extended Domain Types
// ============================================

// ── Experience ──────────────────────────────────────────────

export const ExperienceSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1).max(200),
  role: z.string().min(2).max(200),
  description: z.string().optional(),
  technologies: z.array(z.string().min(1).max(50)).max(20),
  companyLogoUrl: z.string().url().optional().or(z.literal('')),
  companyUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
  isCurrent: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface Experience {
  id: ExperienceId | string;
  company: string;
  role: string;
  description?: string;
  technologies: string[];
  companyLogoUrl?: string;
  companyUrl?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Testimonial ─────────────────────────────────────────────

export const TestimonialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  role: z.string().min(1).max(100),
  company: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
  content: z.string().min(20).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  displayOrder: z.number().int().min(0).default(0),
  isVerified: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface Testimonial {
  id: TestimonialId | string;
  name: string;
  role: string;
  company: string;
  avatarUrl?: string;
  content: string;
  rating: number;
  displayOrder: number;
  isVerified: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Blog Post ───────────────────────────────────────────────

export const BlogPostSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(5).max(200),
  excerpt: z.string().optional(),
  content: z.string().min(50),
  coverImage: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  authorName: z.string().min(1).max(100),
  readTimeMinutes: z.number().int().min(1).max(120),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  publishedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface BlogPost {
  id: BlogPostId | string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;
  tags: string[];
  authorName: string;
  readTimeMinutes: number;
  isPublished: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Service ─────────────────────────────────────────────────

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  icon: z.string().min(1).max(10),
  features: z.array(z.string().min(3).max(200)).min(1).max(10),
  pricingTier: z.string().optional(),
  priceCents: z.number().int().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional(),
  is_highlighted: z.boolean().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface Service {
  id: ServiceId | string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  pricingTier?: string;
  priceCents?: number;
  ctaText?: string;
  ctaUrl?: string;
  is_highlighted?: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── FAQ ─────────────────────────────────────────────────────

export const FAQSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(5).max(300),
  answer: z.string().min(10).max(2000),
  category: z.string().min(1).max(50).optional(),
  display_order: z.number().int().min(0).default(0),
  is_visible: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export interface FAQ {
  id: FAQId | string;
  question: string;
  answer: string;
  category?: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// ── Chat ─────────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  tokensUsed: z.number().int().nonnegative().default(0),
  responseTimeMs: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime().or(z.date()),
});

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed: number;
  responseTimeMs: number;
  createdAt: string | Date;
}

export const ChatConversationSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().max(200),
  visitorId: z.string().optional().nullable(),
  pageContext: z.string().max(500).optional().nullable(),
  messageCount: z.number().int().nonnegative().default(0),
  createdAt: z.string().datetime().or(z.date()),
  lastActivityAt: z.string().datetime().or(z.date()),
});

export interface ChatConversation {
  id: string;
  sessionId: string;
  visitorId?: string | null;
  pageContext?: string | null;
  messageCount: number;
  createdAt: string | Date;
  lastActivityAt: string | Date;
}

export const SendChatMessageSchema = z.object({
  sessionId: z.string().max(200),
  content: z.string().min(1).max(5000),
  pageContext: z.string().max(500).optional(),
});

export interface SendChatMessage {
  sessionId: string;
  content: string;
  pageContext?: string;
}

export const ChatStreamChunkSchema = z.object({
  type: z.enum(['token', 'error', 'done']),
  content: z.string().optional(),
});

export interface ChatStreamChunk {
  type: 'token' | 'error' | 'done';
  content?: string;
}

export * from './env';
