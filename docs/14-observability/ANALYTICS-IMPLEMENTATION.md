# Analytics Implementation ��� Domain Analytics, Implementation Patterns, Validation & Governance

> **Document:** `AnalyticsImplementation.md` | **Version:** 2.0 | **Last Updated:** June 2026  
> **Status:** ? Active | **Owner:** Product Owner | **Review Cadence:** Monthly  
> **Classification:** Implementation + Analysis Guide | **Companion To:** `AnalyticsArchitecture.md` (v5.0)  
> **Analytics Stack:** Umami + PostHog + Vercel Analytics + Custom DB (Supabase)  
> **Total Events:** 90 across 12 domains | \*\*Est.

## Volume:\*\* ~41,800 events/month

## Executive SummaryThis document catalogs **90 analytics events** across **12 domains** (Visitor, Content, Projects, Skills, Blog, Contact, Auth, Search, AI Chat, Admin, Performance, Security) with an estimated monthly volume of ~41,800 events.

Each event includes a unique ID, domain classification, trigger context, payload schema, destination platform (Umami, PostHog, Vercel Analytics, or Custom DB), validation rules, and governance requirements.
The implementation follows a three-tier architecture: client-side auto-capture (Umami), product analytics (PostHog), and custom business events (Supabase).
A 14-event validation framework ensures data quality with automated monitoring and alerting.

## Cross-References| Reference | Description |

|-----------|-------------|
| `docs/21-operations/AnalyticsArchitecture.md` | Analytics strategy and architecture (v5.0) |
| `docs/21-operations/22-OBSERVABILITY.md` | Observability stack (logging, metrics, tracing) |
| `docs/09-database/DatabaseArchitecture.md` | Database schema for custom analytics tables |
| `docs/10-api/12-API.md` | Analytics API endpoints |
| `docs/11-security/PRIVACY.md` | Data privacy and GDPR compliance |
| `docs/01-product/37-IMPLEMENTATION_PLAN.md` | Implementation sequencing |
| `docs/35-quality/TestingArchitecture.md` | Analytics QA and validation |---

## Table of Contents1. [Purpose & Scope](#1-purpose--scope)2. [Event Schema Registry](#2-event-schema-registry)3. [Validation & Testing](#3-validation--testing)4. [Tracking Plan Process](#4-tracking-plan-process)5. [Implementation Patterns](#5-implementation-patterns)6. [Funnel Analytics](#6-funnel-analytics)7. [Lead Analytics](#7-lead-analytics)8. [AI & Agent Analytics](#8-ai--agent-analytics)9. [SEO Analytics](#9-seo-analytics)10. [Content & Portfolio Analytics](#10-content--portfolio-analytics)11. [Performance Analytics](#11-performance-analytics)12. [Executive & Business Metrics](#12-executive--business-metrics)13. [Data Quality Monitoring](#13-data-quality-monitoring)14. [Dashboard Implementation](#14-dashboard-implementation)15. [Enterprise Governance](#15-enterprise-governance)16. [Change Log](#16-change-log)

---

## 1.

Purpose & Scope

## 1.1 Why This Document Exists`AnalyticsArchitecture.md` (v5.0) defines the **what and why** of analytics ��� the strategy, taxonomy, 90-event catalog, 9 metric categories, 4 dashboard specs, and 8-stage funnel.

This document defines the **how** ��� the implementation patterns, validation mechanisms, tracking plan process, and governance needed to turn that strategy into running code.

## 1.2 What This Document Covers| # | Topic | Why It Exists | Coverage Gap Addressed |

|---|-------|--------------|------------------------|
| 1 | **Event Schema Registry** | No central schema definitions exist for the 90 events | ? Zero current coverage |
| 2 | **Validation & Testing** | No event validation anywhere in the codebase | ? Biggest single gap |
| 3 | **Tracking Plan Process** | No process for proposing, approving, or QAing events | ? Zero current coverage |
| 4 | **Implementation Patterns** | No documented SDK usage or event emitter conventions | ? Zero current coverage |
| 5 | **Funnel Analytics** | No analytical treatment of conversion funnels | ? Zero current coverage |
| 6 | **Lead Analytics** | No lead pipeline metrics, queries, or dashboards | ? Zero current coverage |
| 7 | **AI & Agent Analytics** | No AI cost/quality/agent performance analysis | ? Zero current coverage |
| 8 | **SEO Analytics** | No SEO keyword/index/backlink analysis layer | ? Zero current coverage |
| 9 | **Content & Portfolio Analytics** | No content engagement metrics or queries | ? Zero current coverage |
| 10 | **Performance Analytics** | No CWV/Lighthouse/API performance analysis | ? Zero current coverage |
| 11 | **Executive & Business Metrics** | No top-level KPI dashboard or health score | ? Zero current coverage |
| 12 | **Data Quality Monitoring** | No completeness/accuracy metrics for analytics data | ? Zero current coverage |
| 13 | **Dashboard Implementation** | Reifies 4 dashboards from ���15 of the strategy doc | ? Referenced from AnalyticsArchitecture.md ���15 |
| 14 | **Enterprise Governance** | Cross-document standards, ownership, review cadence | ? Zero current coverage |

## 1.3 How to Use This Document| Role | Read These Sections | Action |

|------|---------------------|--------|
| **Frontend Developer** | ���5.1 (Browser SDK), ���5.3 (React Hooks), ���3 (Validation) | Implement events per schema |
| **Backend Developer (NestJS)** | ���5.2 (NestJS Module), ���3 (Validation), ���8 (AI Analytics) | Implement AnalyticsModule + AI events |
| **AI Engineer (FastAPI)** | ���5.4 (AI Service), ���3 (Validation), ���8 (AI Analytics) | Implement AI event emissions |
| **QA Engineer** | ���3.3 (Test Cases), ���3.4 (CI Checks), ���6������12 (Domain queries) | Write validation tests + funnel tests |
| **Product Owner** | ���4 (Tracking Plan), ���12 (Executive Metrics), ���15 (Governance) | Own the process, review KPIs |
| **Data Steward** | ���6 (Funnels), ���7 (Leads), ���13 (Data Quality) | Monitor data quality, run analytics queries |
| **DevOps Lead** | ���3.4 (CI Integration), ���11 (Performance), ���13 (Data Quality) | Add CI pipeline checks, monitor uptime |
| **SEO Specialist** | ���9 (SEO Analytics), ���2.5.11 (SEO Events) | Track keyword rankings, index coverage |
| **Content Manager** | ���10 (Content Analytics), ���2.5.2���3 (Content Events) | Monitor content performance, optimize strategy |

## 1.4 Relationship to Other Documents| Document | Section(s) | Relationship |

|----------|-----------|-------------|
| `AnalyticsArchitecture.md` (v5.0) | All 19 sections | **Strategy companion** ��� this doc implements those specs |
| `46-EVENT-ARCHITECTURE.md` (v1.0) | ���1 Event Inventory, ���2 Event Envelope | Backend domain events (20 events) ��� complements analytics events |
| `50-DATA-CONTRACTS.md` (v1.0) | ���2.1 `packages/shared/src/schemas/analytics.ts` | Zod schemas are the source of truth for event shapes |
| `25-CICD.md` (v5.0) | ���2 Pipeline Architecture | CI pipeline where validation checks run |
| `TestingArchitecture.md` (v5.0) | ���7 Integration Testing, ���18 Testing Pipeline | Testing infrastructure for event validation |
| `22-OBSERVABILITY.md` (v5.0) | ���6 Correlation IDs, ���10 Service Instrumentation | Correlation IDs ride along with events |
| `21-MONITORING.md` (v5.0) | ���3 Application Monitoring, ���14 Alerting | Alert rules triggered by data quality metrics |
| `17-AI_INSTRUCTIONS.md` (v5.0) | ���18 AI Analytics, ���19 AI Monitoring | AI-specific events and alert rules |
| `18-AGENTS.md` (v5.0) | ���13 Analytics Agent, ���20 Agent Evaluation | Agent-level analytics queries and scorecards |
| `SEOArchitecture.md` (v5.0) | ���17 Analytics SEO, ���19 SEO Monitoring | SEO KPI tracking and GSC integration |
| `PerformanceArchitecture.md` (v5.0) | ���5 Core Web Vitals, ���6 Performance Budgets | Performance metric tracking |
| `44-API-STANDARDS.md` (v1.0) | All sections | API conventions for analytics endpoints |
| `DatabaseArchitecture.md` (v5.0) | ���12 Analytics Tables | Database schema for custom events |
| `12-API.md` (v5.0) | Analytics endpoints | REST endpoints for dashboard data |
| `16-COMPLIANCE.md` (v3.0) | GDPR/CCPA sections | Privacy rules governing event data |---

## 2.

Event Schema Registry

## 2.1 PurposeA central registry that defines the **exact shape, properties, and constraints** for every analytics event.

Without this, two developers can emit the same event name with different property shapes, producing corrupted data.

## 2.2 Registry LocationThe **source of truth** lives in `packages/shared/src/schemas/analytics.ts` (Zod schemas), per the data contract standard defined in `50-DATA-CONTRACTS.md` ���2.1.

This registry is a human-readable companion that mirrors the Zod definitions.

## 2.3 Schema TemplateEvery event must define these fields:| Field | Type | Required | Description |

|-------|------|----------|-------------|
| `event_type` | `string` | ? | Fully qualified name: `domain_action_detail` |
| `event_id` | `UUID v4` | ? | Globally unique event identifier |
| `timestamp` | `ISO 8601 UTC` | ? | When the event occurred |
| `session_id` | `UUID v4` | ? | Visitor session identifier |
| `source` | `enum` | ? | One of: `web`, `api`, `ai`, `worker` |
| `correlation_id` | `string` | ? | Request trace ID (from `22-OBSERVABILITY.md` ���3.3) |
| `actor` | `object` | ? | `{ id: string\|null, role: "admin"\|"visitor", ip: string }` |
| `properties` | `object` | ? | Event-specific payload (see ���2.4) |
| `metadata` | `object` | ? | `{ version: string, environment: string }` |

## 2.4 Property Type SystemRefer to `AnalyticsArchitecture.md` ���4.1 for the 8 property types (string, number, boolean, enum, UUID, timestamp, duration, nested).

Every event is properties object must conform to one of these types for each field.

## 2.5 Event Schema Registry ��� Full CatalogBelow is the complete registry for all 90 events across 35 domains.

Each entry includes: event name, source, properties schema, validation rules, and Zod schema reference.

> **Note:** The 20 backend domain events (`lead.created`, `user.logged_in`, etc.) are defined in `46-EVENT-ARCHITECTURE.md` ���1.1 and are not duplicated here.
> This registry covers the **analytics-specific** events from `AnalyticsArchitecture.md` ���16.#

## 2.5.1 Navigation & Page Events (Domain: `page`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `page_view` | web | `path`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign` | `analytics.ts ? PageViewSchema` |
| `page_scroll` | web | `path`, `scroll_depth_pct`, `section_id`, `time_on_page_ms` | `analytics.ts ? PageScrollSchema` |
| `page_time_on_page` | web | `path`, `duration_ms`, `interaction_count` | `analytics.ts ? PageTimeSchema` |
| `page_section_visible` | web | `path`, `section_id`, `section_type`, `viewport_pct` | `analytics.ts ? SectionVisibleSchema` |
| `page_exit_intent` | web | `path`, `exit_x`, `exit_y`, `time_on_page_ms` | `analytics.ts ? ExitIntentSchema` |
| `page_404` | web | `path`, `referrer`, `user_agent` | `analytics.ts ? Page404Schema` |**Validation Rules:**- `scroll_depth_pct`: integer 0���100- `duration_ms`: positive integer- `path`: must start with `/`- `utm_*`: optional, max 200 chars each#

## 2.5.2 Portfolio Content Events (Domain: `project`, `skill`, `experience`, `testimonial`, `case_study`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `project_click` | web | `project_id`, `project_title`, `category` | `analytics.ts ? ProjectClickSchema` |
| `project_detail_view` | web | `project_id`, `project_title`, `duration_ms` | `analytics.ts ? ProjectDetailSchema` |
| `skill_hover` | web | `skill_name`, `category`, `hover_duration_ms` | `analytics.ts ? SkillHoverSchema` |
| `skill_filter` | web | `filter_category`, `result_count` | `analytics.ts ? SkillFilterSchema` |
| `experience_click` | web | `experience_id`, `company`, `role` | `analytics.ts ? ExperienceClickSchema` |
| `testimonial_next` | web | `testimonial_id`, `author_name`, `carousel_position` | `analytics.ts ? TestimonialNavSchema` |
| `testimonial_prev` | web | `testimonial_id`, `author_name`, `carousel_position` | `analytics.ts ? TestimonialNavSchema` |
| `case_study_view` | web | `case_study_id`, `title`, `industry` | `analytics.ts ? CaseStudyViewSchema` |**Validation Rules:**- `project_id`: UUID v4- `skill_name`: must exist in skills knowledge base- `hover_duration_ms`: 0���300000 (5 min max)- `carousel_position`: integer = 0#

## 2.5.3 Blog & Content Events (Domain: `blog`, `article`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `blog_post_click` | web | `post_id`, `post_title`, `category` | `analytics.ts ? BlogPostClickSchema` |
| `article_view` | web | `article_id`, `title`, `read_time_est_min`, `scroll_depth_pct` | `analytics.ts ? ArticleViewSchema` |
| `article_read_complete` | web | `article_id`, `title`, `duration_ms` | `analytics.ts ? ArticleCompleteSchema` |
| `article_share` | web | `article_id`, `platform` (enum), `share_method` | `analytics.ts ? ArticleShareSchema` |**Validation Rules:**- `platform`: one of `twitter`, `linkedin`, `email`, `copy_link`, `whatsapp`- `read_time_est_min`: positive integer- `scroll_depth_pct`: integer 0���100#

## 2.5.4 Lead Events (Domain: `lead`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `lead_created` | api, web | `lead_id`, `source` (enum), `inquiry_type` | `analytics.ts ? LeadCreatedSchema` (also in `46-EVENT-ARCHITECTURE.md` ���1.1) |
| `lead_status_changed` | api | `lead_id`, `previous_status`, `new_status`, `changed_by` | `analytics.ts ? LeadStatusSchema` |
| `lead_qualified` | api | `lead_id`, `qualification_score`, `qualification_criteria` | `analytics.ts ? LeadQualifiedSchema` |
| `lead_converted` | api | `lead_id`, `conversion_type`, `value` | `analytics.ts ? LeadConvertedSchema` |
| `lead_exported` | api | `export_count`, `export_format`, `date_range` | `analytics.ts ? LeadExportedSchema` |**Validation Rules:**- `source`: one of `contact_form`, `ai_chat`, `referral`, `direct`, `social`, `email`- `inquiry_type`: one of `hiring`, `freelance`, `collaboration`, `general`, `other`- `qualification_score`: integer 0���100- `lead_id`: UUID v4#

## 2.5.5 AI Chat Events (Domain: `chat`, `ai`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `chat_session_started` | web | `session_id`, `source_page`, `visitor_id` | `analytics.ts ? ChatSessionSchema` |
| `chat_message_sent` | web | `session_id`, `message_length`, `intent_classification`, `sentiment` | `analytics.ts ? ChatMessageSchema` |
| `chat_response_received` | ai | `session_id`, `response_time_ms`, `model`, `token_count`, `response_length` | `analytics.ts ? ChatResponseSchema` |
| `chat_feedback` | web | `session_id`, `rating` (1���5), `feedback_text`, `resolved` | `analytics.ts ? ChatFeedbackSchema` |
| `chat_abandoned` | web | `session_id`, `message_count`, `duration_s` | `analytics.ts ? ChatAbandonedSchema` |
| `ai_cost_tracking` | ai | `model`, `prompt_tokens`, `completion_tokens`, `cost_usd`, `request_type` | `analytics.ts ? AICostSchema` |
| `ai_model_fallback` | ai | `primary_model`, `fallback_model`, `reason`, `response_time_ms` | `analytics.ts ? ModelFallbackSchema` |
| `ai_hallucination_flagged` | ai | `session_id`, `confidence_score`, `flagged_content_snippet` | `analytics.ts ? HallucinationSchema` |**Validation Rules:**- `rating`: integer 1���5- `response_time_ms`: positive integer- `cost_usd`: decimal, 6 decimal places max- `token_count`: positive integer- `model`: one of `gpt-4`, `gpt-3.5-turbo`, `gpt-4o-mini`, `claude-3-haiku`#

## 2.5.6 Agent Events (Domain: `agent`)Refer to `18-AGENTS.md` ���13 Analytics Agent for context.| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `agent_routing` | ai | `agent_name`, `intent`, `confidence`, `response_time_ms` | `analytics.ts ? AgentRoutingSchema` |
| `agent_handoff` | ai | `from_agent`, `to_agent`, `reason`, `context_size` | `analytics.ts ? AgentHandoffSchema` |
| `agent_failure` | ai | `agent_name`, `failure_reason`, `fallback_triggered` | `analytics.ts ? AgentFailureSchema` |
| `agent_evaluation` | ai | `agent_name`, `accuracy_score`, `completion_rate`, `avg_response_time` | `analytics.ts ? AgentEvalSchema` |**Validation Rules:**- `agent_name`: one of `portfolio`, `resume`, `projects`, `blog`, `case_study`, `career`, `lead_qualification`, `admin`, `analytics`, `knowledge`, `supervisor`- `confidence`: decimal 0.0���1.0- `accuracy_score`: decimal 0.0���1.0- `completion_rate`: decimal 0.0���1.0#

## 2.5.7 RAG Events (Domain: `rag`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `rag_query` | ai | `query_text_hash`, `chunks_retrieved`, `avg_relevance_score`, `response_time_ms` | `analytics.ts ? RAGQuerySchema` |
| `rag_embedding_generated` | ai | `source`, `chunk_count`, `embedding_model`, `duration_ms` | `analytics.ts ? RAGEmbeddingSchema` |
| `rag_source_attribution` | ai | `source_name`, `chunk_id`, `relevance_score` | `analytics.ts ? RAGSourceSchema` |**Validation Rules:**- `query_text_hash`: SHA-256 hex string (privacy ��� never log raw query text)- `avg_relevance_score`: decimal 0.0���1.0- `chunks_retrieved`: integer 0���20#

## 2.5.8 Social & Engagement Events (Domain: `social`, `resume`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `social_link_click` | web | `platform` (enum), `url`, `placement` | `analytics.ts ? SocialClickSchema` |
| `resume_download` | web | `format` (enum), `download_method` | `analytics.ts ? ResumeDownloadSchema` |
| `contact_form_submit` | web | `form_type`, `field_count`, `validation_errors` | `analytics.ts ? ContactFormSchema` |**Validation Rules:**- `platform`: one of `github`, `linkedin`, `twitter`, `email`, `dribbble`, `medium`, `devto`, `stackoverflow`- `format`: one of `pdf`, `docx`, `json`- `form_type`: one of `contact`, `hire_me`, `freelance`, `feedback`- `field_count`: integer 1���20#

## 2.5.9 Search & Filter Events (Domain: `search`, `filter`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `search_performed` | web | `query_length`, `result_count`, `search_type`, `filters_applied` | `analytics.ts ? SearchSchema` |
| `filter_applied` | web | `filter_type`, `filter_value`, `result_count` | `analytics.ts ? FilterSchema` |
| `search_no_results` | web | `query_length`, `search_type`, `suggestions_shown` | `analytics.ts ? SearchNoResultsSchema` |**Validation Rules:**- `query_length`: integer 1���500- `result_count`: integer = 0- `filter_type`: one of `category`, `skill`, `technology`, `year`, `industry`#

## 2.5.10 System & Build Events (Domain: `build`, `deploy`, `uptime`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `build_started` | ci | `build_id`, `branch`, `commit_hash`, `triggered_by` | `analytics.ts ? BuildSchema` |
| `build_completed` | ci | `build_id`, `duration_s`, `status`, `error_count` | `analytics.ts ? BuildSchema` |
| `deploy_started` | ci | `deploy_id`, `target_env`, `version` | `analytics.ts ? DeploySchema` |
| `deploy_completed` | ci | `deploy_id`, `target_env`, `duration_s`, `status` | `analytics.ts ? DeploySchema` |
| `uptime_check` | monitoring | `service`, `status`, `response_time_ms`, `region` | `analytics.ts ? UptimeSchema` |
| `uptime_incident` | monitoring | `service`, `downtime_s`, `affected_users`, `root_cause` | `analytics.ts ? UptimeSchema` |#

## 2.5.11 SEO Events (Domain: `seo`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `seo_keyword_ranking` | api | `keyword`, `position`, `previous_position`, `search_volume` | `analytics.ts ? SEOKeywordSchema` |
| `seo_indexed_pages` | api | `page_count`, `coverage_state`, `errors` | `analytics.ts ? SEOIndexSchema` |
| `seo_backlink_discovered` | api | `source_domain`, `page_url`, `link_type`, `domain_authority` | `analytics.ts ? SEOBacklinkSchema` |**Validation Rules:**- `position`: integer 1���100- `search_volume`: integer = 0- `domain_authority`: integer 0���100- `coverage_state`: one of `submitted`, `indexed`, `excluded`, `error`#

## 2.5.12 Performance Events (Domain: `vital`, `lh`)| Event | Source | Key Properties | Zod Ref |

|-------|--------|---------------|---------|
| `vital_lcp` | web | `value_ms`, `rating`, `element`, `viewport_size` | `analytics.ts ? VitalSchema` |
| `vital_cls` | web | `value`, `rating`, `cumulative_score` | `analytics.ts ? VitalSchema` |
| `vital_inp` | web | `value_ms`, `rating`, `interaction_type` | `analytics.ts ? VitalSchema` |
| `vital_ttfb` | web | `value_ms`, `rating` | `analytics.ts ? VitalSchema` |
| `vital_fcp` | web | `value_ms`, `rating` | `analytics.ts ? VitalSchema` |
| `lh_score` | ci | `performance_score`, `accessibility_score`, `seo_score`, `best_practices_score` | `analytics.ts ? LighthouseSchema` |
| `lh_audit_failure` | ci | `audit_id`, `score`, `weight`, `category` | `analytics.ts ? LighthouseAuditSchema` |**Validation Rules:**- `rating`: one of `good`, `needs_improvement`, `poor`- `value_ms`: positive integer- `*_score`: integer 0���100- `cumulative_score`: decimal = 0

## 2.6 Schema Registry Maintenance| Rule | Detail |

|------|--------|
| **Additive changes only** | New properties must be optional or have defaults |
| **Version bump** | Breaking schema changes increment the `metadata.version` field |
| **Deprecation window** | Old properties remain in schema for 30 days after deprecation notice |
| **Zod sync** | The registry must match `packages/shared/src/schemas/analytics.ts` exactly |
| **Review trigger** | Any change to the registry requires PO approval (see ���4) |---

## 3.

Validation & Testing

## 3.1 Validation ArchitectureEvents pass through **four validation layers** before their data is trusted for analysis:`textDeveloper is IDE  ?  CI Pipeline  ?  Staging Environment  ?  Production Monitoring     (layer 1)        (layer 2)          (layer 3)               (layer 4)`

## 3.2 Layer 1 ��� Static Validation (IDE)**What:** TypeScript type checking + Zod schema inference during development.**Implementation:**- Every event emission uses a function typed by its Zod schema (from `packages/shared/src/schemas/analytics.ts`).- The compiler catches misnamed properties, wrong types, and missing required fields.**Example Pattern:**`typescript// packages/shared/src/schemas/analytics.tsimport { z } from 'zod';export const ProjectClickSchema = z.object({  event_type: z.literal('project_click'),  event_id: z.string().uuid(),  timestamp: z.string().datetime(),  session_id: z.string().uuid(),  source: z.literal('web'),  correlation_id: z.string(),  actor: z.object({    id: z.string().nullable(),    role: z.enum(['admin', 'visitor']),    ip: z.string(),  }),  properties: z.object({    project_id: z.string().uuid(),    project_title: z.string().min(1).max(200),    category: z.string().optional(),  }),  metadata: z.object({    version: z.literal('1.0'),    environment: z.enum(['development', 'staging', 'production']),  }),});export type ProjectClickEvent = z.infer<typeof ProjectClickSchema>;`

## 3.3 Layer 2 ��� Automated Testing#

## 3.3.1 Unit Tests| Test | Description | Location |

|------|-------------|----------|
| **Schema validation** | Every event schema accepts valid data and rejects invalid | `packages/shared/__tests__/schemas/analytics.test.ts` |
| **Property boundary tests** | Min/max lengths, edge case values for each property type | `packages/shared/__tests__/schemas/analytics.test.ts` |
| **Enum validation** | All enum values are accepted; invalid values are rejected | `packages/shared/__tests__/schemas/analytics.test.ts` |
| **Required field tests** | Missing required fields throw validation errors | `packages/shared/__tests__/schemas/analytics.test.ts` |
| **Optional field tests** | Omitted optional fields produce valid events with defaults | `packages/shared/__tests__/schemas/analytics.test.ts` |#

## 3.3.2 Integration Tests| Test | Description | Location |

|------|-------------|----------|
| **Event emission** | Each SDK function emits the correct event shape | `apps/web/__tests__/analytics/emission.test.ts` |
| **Backend event dispatch** | NestJS AnalyticsModule emits domain events with correct payload | `apps/api/__tests__/analytics/analytics-module.test.ts` |
| **AI event logging** | FastAI event logger writes correct schema to PostHog + DB | `apps/ai/__tests__/analytics/event-logger.test.ts` |
| **End-to-end event flow** | Browser action ? PostHog/DB ? dashboard renders correctly | `apps/web/__tests__/e2e/analytics-flow.test.ts` |#

## 3.3.3 Snapshot TestsMaintain a snapshot of the full event registry.

CI fails if any schema changes without a corresponding snapshot update.`typescript// packages/shared/__tests__/schemas/registry-snapshot.test.tsimport { registry } from '../src/schemas/analytics';describe('Event Registry Snapshot', () => {  it('registry has exactly 90 events', () => {    expect(Object.keys(registry)).toHaveLength(90);  });  it('every event has required fields', () => {    for (const [name, schema] of Object.entries(registry)) {      const shape = schema.shape;      expect(shape.event_type).toBeDefined();      expect(shape.event_id).toBeDefined();      expect(shape.timestamp).toBeDefined();    }  });});`

## 3.4 Layer 3 ��� CI Pipeline ValidationIntegrated into the existing CI/CD pipeline defined in `CI-CD.md` ���2.#

## 3.4.1 CI Validation StepsAdd these steps to the **Quality Gates** phase:| Step | Tool | Duration | Fails On |

|------|------|----------|----------|
| **Zod schema compile** | TypeScript compiler | 30s | Invalid Zod schemas |
| **Event registry snapshot** | Jest snapshot test | 10s | Schema changes without snapshot update |
| **Event contract check** | Custom script (`scripts/validate-analytics-contracts.ts`) | 15s | Frontend events don't match backend expectations |
| **Naming convention lint** | ESLint custom rule | 5s | Events not following `domain_action_detail` pattern |
| **Property type lint** | ESLint custom rule | 5s | Properties using non-standard types |#

## 3.4.2 CI Integration Code`yaml# .github/workflows/analytics-validation.yml (new workflow)name: Analytics Validationon: [pull_request, push]jobs:  validate:    runs-on: ubuntu-latest    steps:      - uses: actions/checkout@v4      - uses: actions/setup-node@v4      - name: Install dependencies        run: npm ci      - name: Validate Zod schemas        run: npx tsc --noEmit packages/shared/src/schemas/analytics.ts      - name: Run registry snapshot tests        run: npx jest packages/shared/__tests__/schemas/registry-snapshot.test.ts      - name: Check event naming conventions        run: npx eslint packages/shared/src/schemas/analytics.ts --rule 'analytics/naming-convention: error'      - name: Validate property types        run: npx eslint packages/shared/src/schemas/analytics.ts --rule 'analytics/property-types: error'      - name: Check frontend-backend contract alignment        run: npx ts-node scripts/validate-analytics-contracts.ts`

## 3.5 Layer 4 ��� Runtime Validation (Staging & Production)| Mechanism | Tool | What It Validates |

|-----------|------|-------------------|
| **Middleware validation** | PostHog capture middleware | Every event is validated against schema before sending |
| **Server-side validation** | NestJS AnalyticsModule | Events arriving at backend are re-validated |
| **Sentry error tracking** | Sentry | Invalid events generate Sentry errors with full context |
| **Webhook alert** | Custom Supabase function | Events with missing required fields trigger Telegram alert |
| **Batch validator** | Cron job (every 6h) | Samples 1% of events and validates schema compliance |---

## 4.

Tracking Plan Process

## 4.1 What Is a Tracking PlanA tracking plan documents every event: its purpose, trigger, properties, destination, business question it answers, and acceptance criteria.

It is the **single source of truth** for what gets tracked and why.

## 4.2 When a Tracking Plan Is RequiredA tracking plan must be created for:| Trigger | Example | Owner |

|---------|---------|-------|
| **New feature** ��� A new feature is added to `02-FEATURES.md` | "AI project recommendations" | Product Owner |
| **New event** ��� A new analytics event is proposed | `project_bookmark` | Event requester |
| **Schema change** ��� An existing events schema changes (breaking) | Adding required `category` to `project_click` | Product Owner |
| **New destination** ��� Events now flow to a new analytics tool | Adding Amplitude as a destination | DevOps Lead |
| **Privacy change** ��� A property now captures PII-adjacent data | Adding `city` from IP geolocation | Compliance Officer |

## 4.3 Tracking Plan Template``markdown## Tracking Plan: [Event Name]### 1. Metadata- **Event Name:** `domain_action_detail`- **Version:** 2.0- **Owner:** [Name/Team]- **Created:** YYYY-MM-DD- **Last Updated:** YYYY-MM-DD- **Status:** `draft | in-review | approved | active | deprecated`### 2. Business Context- **Business Question:** [What question does this event answer?]- **Decision Impact:** [What decision will this data inform?]- **Success Metric:** [What KPI does this event feed into?]### 3. Trigger Specification- **Trigger:** [User action or system event that fires this event]- **Frequency:** [Per session | Per action | Timed interval]- **Priority:** [?? High | ?? Normal | ?? Low ��� per ���16 of AnalyticsArchitecture.md]### 4. Event Properties| Property | Type | Required | Example | Notes ||----------|------|----------|---------|-------|| `project_id` | UUID | ? | `"550e8400-e29b..."` | Must match project DB ID || `project_title` | String | ? | `"E-Commerce Platform"` | Max 200 chars || `category` | Enum | ? | `"fullstack"` | One of defined categories |### 5. Data Flow- **Source:** [web | api | ai | worker]- **Transport:** [HTTP direct | Batch queue | SSE]- **Destination(s):** [PostHog | Custom DB | Both]- **Retention Period:** [Per ���17.3 of AnalyticsArchitecture.md]### 6. Dashboard Usage- **Dashboard(s):** [Analytics Dashboard | AI Dashboard | etc.]- **Widget(s):** [Chart type and placement]- **Aggregation:** [Count | Unique | Sum | Avg | P95]### 7. Privacy Review- **PII in properties?** [Yes/No]- **Aggregation required?** [Yes/No]- **Anonymization method:** [If applicable]- **Privacy rule(s):** [Per ���17.6 of AnalyticsArchitecture.md]### 8. Acceptance Criteria- [ ] Schema validated against Zod definition in `packages/shared/src/schemas/analytics.ts`- [ ] Event emitted from correct source with correct transport- [ ] Properties match registry definition exactly- [ ] Unit tests pass for schema validation- [ ] Integration test confirms end-to-end flow- [ ] Dashboard widget displays data correctly- [ ] Privacy review completed with no violations- [ ] Event listed in `AnalyticsArchitecture.md` ���16 Event Catalog- [ ] Event added to registry snapshot in CI- [ ] Cost budget checked ��� within 1M/month ceiling### 9. QA Verification| Check | Pass/Fail | Tester | Date ||-------|-----------|--------|------|| Event appears in PostHog live events | | | || Properties match schema | | | || Event appears in Custom DB `analytics_events` table | | | || Dashboard widget shows data | | | || No duplicate events | | | || Privacy ��� no PII in properties | | | |``

## 4.4 Tracking Plan Workflow`mermaidflowchart LR    A[Propose New Event] --> B{Draft Tracking Plan}    B --> C[Review by PO]    C -->|Approve| D[Add to Schema Registry]    C -->|Reject| E[Archive Plan]    D --> F[Implement Event]    F --> G[QA Verification]    G -->|Pass| H[Deploy to Production]    G -->|Fail| I[Fix & Re-test]    H --> J[Monitor for 7 Days]    J -->|Data OK| K[Mark Active]    J -->|Issues| L[Rollback or Fix]`

## 4.5 Ownership & Approvals| Role | Responsibility | Approval Required For |

|------|---------------|-----------------------|
| **Product Owner** | Owns the tracking plan process | All new events and schema changes |
| **Frontend Developer** | Implements browser events | Technical feasibility review |
| **Backend Developer** | Implements server events | Technical feasibility review |
| **AI Engineer** | Implements AI events | AI-specific validation |
| **QA Engineer** | Verifies event correctness | Acceptance criteria sign-off |
| **DevOps Lead** | Adds CI checks | Pipeline integration |
| **Compliance Officer** | Reviews privacy implications | Events with PII-adjacent properties |
| **Data Steward** | Monitors data quality | Quarterly data quality review |---

## 5.

Implementation Patterns

## 5.1 Browser SDK ��� Umami + PostHog#

## 5.1.1 Initialization`typescript// apps/web/src/lib/analytics/init.tsimport { init as posthogInit } from 'posthog-js';import { umami } from '@umami/analytics';export function initializeAnalytics(env: string) {  // Umami ��� self-hosted, page views only  umami.init({    website_id: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,    host_url: process.env.NEXT_PUBLIC_UMAMI_HOST,  });  // PostHog ��� product analytics  posthogInit(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,    capture_pageview: false, // We manually control page views    autocapture: false,      // We manually control all events    disable_session_recording: false,    loaded: (posthog) => {      if (env === 'development') posthog.opt_out_capturing();    },  });}`#

## 5.1.2 Event Emitter Service`typescript// apps/web/src/lib/analytics/emitter.tsimport { umami } from '@umami/analytics';import posthog from 'posthog-js';import { v4 as uuidv4 } from 'uuid';type EventPayload = Record<string, unknown>;interface EventEnvelope {  event_type: string;  event_id: string;  timestamp: string;  session_id: string;  source: 'web';  correlation_id: string;  actor: { id: string | null; role: 'admin' | 'visitor'; ip: string };  properties: EventPayload;  metadata: { version: string; environment: string };}let sessionId: string | null = null;let correlationId: string | null = null;export function getSessionId(): string {  if (!sessionId) sessionId = uuidv4();  return sessionId;}export function setCorrelationId(id: string) {  correlationId = id;}export function getCorrelationId(): string {  return correlationId || 'no-correlation-id';}export function emitEvent(  eventType: string,  properties: EventPayload,  options?: {    destination?: ('umami' | 'posthog' | 'both')[];    version?: string;  }): void {  const envelope: EventEnvelope = {    event_type: eventType,    event_id: uuidv4(),    timestamp: new Date().toISOString(),    session_id: getSessionId(),    source: 'web',    correlation_id: getCorrelationId(),    actor: {      id: null,      role: 'visitor',      ip: '',    },    properties,    metadata: {      version: options?.version || '1.0',      environment: process.env.NODE_ENV || 'development',    },  };  const destinations = options?.destination || ['posthog', 'umami'];  if (destinations.includes('umami')) {    umami.track(envelope.event_type, envelope.properties);  }  if (destinations.includes('posthog')) {    posthog.capture(envelope.event_type, envelope as unknown as Record<string, unknown>);  }}`#

## 5.1.3 React Hook ��� useAnalytics`typescript// apps/web/src/lib/analytics/hooks.tsimport { useCallback } from 'react';import { emitEvent, setCorrelationId, getSessionId } from './emitter';export function useAnalytics() {  const track = useCallback(    (eventType: string, properties: Record<string, unknown> = {}) => {      emitEvent(eventType, properties);    },    []  );  const trackWithCorrelation = useCallback(    (correlationId: string, eventType: string, properties: Record<string, unknown> = {}) => {      setCorrelationId(correlationId);      emitEvent(eventType, properties);    },    []  );  return {    track,    trackWithCorrelation,    sessionId: getSessionId(),  };}`#

## 5.1.4 Component Usage Example`typescript// apps/web/src/components/projects/ProjectCard.tsximport { useAnalytics } from '@/lib/analytics/hooks';export function ProjectCard({ project }: { project: Project }) {  const { track } = useAnalytics();  const handleClick = () => {    track('project_click', {      project_id: project.id,      project_title: project.title,      category: project.category,    });  };  return <div onClick={handleClick}>{/* card UI */}</div>;}`

## 5.2 NestJS Backend ��� AnalyticsModule#

## 5.2.1 Module Structure`apps/api/+-- src/���   +-- analytics/���   ���   +-- analytics.module.ts���   ���   +-- analytics.service.ts���   ���   +-- analytics.controller.ts���   ���   +-- dto/���   ���   ���   +-- track-event.dto.ts       # Zod-validated DTO���   ���   ���   +-- batch-events.dto.ts���   ���   +-- interfaces/���   ���       +-- event-envelope.interface.ts���   +-- common/���   ���   +-- decorators/���   ���       +-- track-event.decorator.ts  # Decorator for auto-tracking`#

## 5.2.2 Service Implementation`typescript// apps/api/src/analytics/analytics.service.tsimport { Injectable } from '@nestjs/common';import { InjectPostHog } from '@johx/posthog-nestjs';import PostHog from 'posthog-js';import { SupabaseClient } from '@supabase/supabase-js';import { v4 as uuidv4 } from 'uuid';@Injectable()export class AnalyticsService {  constructor(    @InjectPostHog() private readonly posthog: PostHog,    private readonly supabase: SupabaseClient,  ) {}  async track(event: TrackEventDto): Promise<void> {    const envelope = {      event_type: event.event_type,      event_id: uuidv4(),      timestamp: new Date().toISOString(),      session_id: event.session_id,      source: 'api',      correlation_id: event.correlation_id || uuidv4(),      actor: event.actor,      properties: event.properties,      metadata: {        version: event.version || '1.0',        environment: process.env.NODE_ENV,      },    };    // Send to PostHog    this.posthog.capture({      distinctId: event.actor.id || 'anonymous',      event: envelope.event_type,      properties: envelope as unknown as Record<string, unknown>,    });    // Store in Custom DB for lead/portfolio-specific events    if (event.persistToDb) {      await this.supabase.from('analytics_events').insert({        event_id: envelope.event_id,        event_type: envelope.event_type,        timestamp: envelope.timestamp,        payload: envelope,      });    }  }}`#

## 5.2.3 Auto-Tracking Decorator`typescript// apps/api/src/common/decorators/track-event.decorator.tsexport function TrackEvent(eventType: string) {  return function (    target: any,    propertyKey: string,    descriptor: PropertyDescriptor,  ) {    const originalMethod = descriptor.value;    descriptor.value = async function (...args: any[]) {      await this.analyticsService.track({        event_type: eventType,        session_id: args[0]?.session_id,        correlation_id: args[0]?.correlation_id,        actor: { id: args[0]?.userId || null, role: 'admin', ip: args[0]?.ip },        properties: { args: args[0] },      });      return originalMethod.apply(this, args);    };  };}`

## 5.3 FastAPI AI Service ��� Event Logger`python# apps/ai/src/services/analytics.pyimport uuidimport jsonfrom datetime import datetime, timezonefrom posthog import Posthogfrom supabase import create_clientfrom typing import Optionalclass AnalyticsLogger:    def __init__(self):        self.posthog = Posthog(            project_api_key=settings.POSTHOG_KEY,            host=settings.POSTHOG_HOST        )        self.supabase = create_client(            settings.SUPABASE_URL,            settings.SUPABASE_KEY        )    def track(        self,        event_type: str,        properties: dict,        session_id: str,        correlation_id: Optional[str] = None,        version: str = "1.0",    ):        envelope = {            "event_type": event_type,            "event_id": str(uuid.uuid4()),            "timestamp": datetime.now(timezone.utc).isoformat(),            "session_id": session_id,            "source": "ai",            "correlation_id": correlation_id or str(uuid.uuid4()),            "actor": {"id": None, "role": "visitor", "ip": ""},            "properties": properties,            "metadata": {                "version": version,                "environment": settings.ENVIRONMENT,            },        }        # PostHog for product analytics        self.posthog.capture(            distinct_id=session_id,            event=event_type,            properties=envelope,        )        # Custom DB for cost tracking, agent metrics, RAG metrics        if event_type.startswith(("ai_", "agent_", "rag_")):            self.supabase.table("analytics_events").insert(envelope).execute()    def track_chat_response(        self,        session_id: str,        model: str,        response_time_ms: int,        token_count: int,        correlation_id: str,    ):        self.track(            event_type="chat_response_received",            properties={                "response_time_ms": response_time_ms,                "model": model,                "token_count": token_count,                "response_length": token_count,            },            session_id=session_id,            correlation_id=correlation_id,        )`

## 5.4 Event Emission Rules| Rule | ID | Description | Violation Penalty |

|------|----|-------------|-------------------|
| **One emitter per event** | EMIT-001 | Each event emitted from exactly one source file | Duplicate counting, skewed metrics |
| **Schema before emission** | EMIT-002 | Always validate event against Zod schema before sending | Data corruption, schema drift |
| **Correlation ID required** | EMIT-003 | Every event must carry a correlation_id per ���6 of `22-OBSERVABILITY.md` | Cannot trace event to request |
| **Session ID for visitors** | EMIT-004 | Anonymous visitor events must include session_id | Cannot build funnels |
| **No PII in properties** | EMIT-005 | Never log email, name, IP (unless actor.ip), or raw query text | GDPR violation |
| **Batch non-critical events** | EMIT-006 | Low priority events (??) should be batched every 5 min | Excessive API calls |
| **Fire-and-forget critical** | EMIT-007 | High priority events (??) fire immediately, don't await response | Losing critical events |
| **Test in staging first** | EMIT-008 | All new events must be verified in staging before production | Corrupting production data |---

## 6.

Funnel Analytics

## 6.1 PurposeThis section defines the **analytical treatment of conversion funnels** ��� the SQL queries, dashboard widgets, alert rules, and business logic needed to track, visualize, and optimize visitor progression through the portfolio from first page view to hired engagement.

The funnel specifications originate from `AnalyticsArchitecture.md` ���14; this section implements the analysis layer.

## 6.2 Business Questions Answered| # | Business Question | Decision Impact |

|---|-------------------|-----------------|
| 1 | Where do visitors drop off most in the primary funnel? | Allocate UX improvements to highest-leakage stage |
| 2 | Is the AI chat sub-funnel converting at or above target? | Optimize chat widget placement, lead agent prompt |
| 3 | What is the week-over-week conversion trend per stage? | Detect regressions before they compound |
| 4 | Which traffic source yields the highest funnel completion rate? | Prioritize acquisition spend on top-converting channels |
| 5 | How does mobile vs. desktop funnel performance differ? | Target device-specific UX fixes |
| 6 | What is the projected monthly lead volume based on funnel rates? | Set realistic hiring/freelance pipeline targets |

## 6.3 Primary Funnel ��� Visitor to Hired#

## 6.3.1 Funnel Stage DefinitionsRefer to `AnalyticsArchitecture.md` ���14.1 for the full 8-stage funnel specification.

| Below is the **analytical implementation** ��� the SQL queries and event triggers that power each stage. | Stage                                                               | Entry Event(s) | Exit Event                                                | Definition |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------- | --------------------------------------------------------- | ---------- |
| **Visitor**                                                                                              | `page_view`                                                         | ���            | Any unique session with a page_view event                 |
| **Engaged**                                                                                              | `page_scroll` (depth = 50%) OR `page_section_visible` (= 1 section) | ���            | Visitor scrolled > 50% or viewed at least one section     |
| **Section Viewer**                                                                                       | `page_section_visible` (= 3 distinct sections)                      | ���            | Viewed 3 or more distinct sections across the page        |
| **Project Viewer**                                                                                       | `project_click`                                                     | ���            | Clicked a project card                                    |
| **Chat User**                                                                                            | `chat_session_started`                                              | ���            | Opened the AI chat widget                                 |
| **Lead Intent**                                                                                          | `lead_created`                                                      | ���            | Submitted contact form or was captured via chat           |
| **Lead Contacted**                                                                                       | `lead_status_changed` (new_status = replied)                        | ���            | Admin replied to the lead                                 |
| **Lead Qualified**                                                                                       | `lead_qualified`                                                    | ���            | Lead met qualification criteria (budget, timeline, scope) |
| **Hired**                                                                                                | `lead_status_changed` (new_status = hired)                          | ���            | Lead converted to a paid engagement                       | #          |

## 6.3.2 Funnel SQL ��� Daily Aggregation`sql-- apps/api/src/analytics/queries/funnel-daily.sqlWITH daily_visitors AS (  SELECT DATE(timestamp) AS day, COUNT(DISTINCT session_id) AS visitors  FROM analytics_events WHERE event_type = 'page_view' AND timestamp >= NOW() - INTERVAL '30 days'  GROUP BY DATE(timestamp)),daily_engaged AS (  SELECT DATE(e.timestamp) AS day, COUNT(DISTINCT e.session_id) AS engaged  FROM analytics_events e  WHERE e.event_type IN ('page_scroll', 'page_section_visible')    AND (      (e.event_type = 'page_scroll' AND (e.properties->>'scroll_depth_pct')::int >= 50)      OR (e.event_type = 'page_section_visible')    )    AND e.timestamp >= NOW() - INTERVAL '30 days'  GROUP BY DATE(e.timestamp)),daily_section_viewers AS (  SELECT DATE(e.timestamp) AS day, COUNT(DISTINCT e.session_id) AS section_viewers  FROM analytics_events e  WHERE e.event_type = 'page_section_visible'    AND e.timestamp >= NOW() - INTERVAL '30 days'  GROUP BY DATE(e.timestamp)  HAVING COUNT(DISTINCT e.properties->>'section_id') >= 3),daily_project_viewers AS (  SELECT DATE(timestamp) AS day, COUNT(DISTINCT session_id) AS project_viewers  FROM analytics_events WHERE event_type = 'project_click' AND timestamp >= NOW() - INTERVAL '30 days'  GROUP BY DATE(timestamp)),daily_chat_users AS (  SELECT DATE(timestamp) AS day, COUNT(DISTINCT session_id) AS chat_users  FROM analytics_events WHERE event_type = 'chat_session_started' AND timestamp >= NOW() - INTERVAL '30 days'  GROUP BY DATE(timestamp)),daily_leads AS (  SELECT DATE(timestamp) AS day, COUNT(DISTINCT session_id) AS leads  FROM analytics_events WHERE event_type = 'lead_created' AND timestamp >= NOW() - INTERVAL '30 days'  GROUP BY DATE(timestamp))SELECT  COALESCE(v.day, e.day, s.day, p.day, c.day, l.day) AS day,  COALESCE(v.visitors, 0) AS visitors,  COALESCE(e.engaged, 0) AS engaged,  COALESCE(s.section_viewers, 0) AS section_viewers,  COALESCE(p.project_viewers, 0) AS project_viewers,  COALESCE(c.chat_users, 0) AS chat_users,  COALESCE(l.leads, 0) AS leads,  ROUND(COALESCE(e.engaged, 0)::numeric / NULLIF(v.visitors, 0) * 100, 1) AS engaged_rate,  ROUND(COALESCE(l.leads, 0)::numeric / NULLIF(v.visitors, 0) * 100, 2) AS visitor_to_lead_rateFROM daily_visitors vFULL JOIN daily_engaged e ON v.day = e.dayFULL JOIN daily_section_viewers s ON COALESCE(v.day, e.day) = s.dayFULL JOIN daily_project_viewers p ON COALESCE(v.day, e.day, s.day) = p.dayFULL JOIN daily_chat_users c ON COALESCE(v.day, e.day, s.day, p.day) = c.dayFULL JOIN daily_leads l ON COALESCE(v.day, e.day, s.day, p.day, c.day) = l.dayORDER BY day DESC;`#

## 6.3.3 Funnel Conversion Rate Targets| Transition | Target Rate | Formula | Alert Threshold |

|-----------|-------------|---------|-----------------|
| Visitor ? Engaged | > 60% | `engaged / visitors ��� 100` | < 50% week-over-week |
| Engaged ? Section Viewer | > 40% | `section_viewers / engaged ��� 100` | < 30% |
| Section Viewer ? Project Viewer | > 25% | `project_viewers / section_viewers ��� 100` | < 15% |
| Section Viewer ? Chat User | > 15% | `chat_users / section_viewers ��� 100` | < 10% |
| Chat User ? Lead Intent | > 8% | `chat_leads / chat_users ��� 100` | < 5% |
| Project Viewer ? Lead Intent | > 8% | `project_leads / project_viewers ��� 100` | < 4% |
| Lead Intent ? Lead Contacted | > 60% | `leads_contacted / total_leads ��� 100` | < 40% |
| Lead Contacted ? Qualified | > 30% | `leads_qualified / leads_contacted ��� 100` | < 20% |
| Lead Qualified ? Hired | > 15% | `hired / leads_qualified ��� 100` | < 5% |
| **Visitor ? Lead (overall)** | **> 3%** | `total_leads / total_visitors ��� 100` | **< 2%** |

## 6.4 AI Chat Sub-Funnel#

## 6.4.1 Sub-Funnel StagesRefer to `AnalyticsArchitecture.md` ���14.2 for behavior specifications.

| Implementation event mapping: | Stage                                                | Entry Event                                              | Properties Required |
| ----------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ------------------- |
| Chat Widget Open              | `chat_session_started`                               | `source_page`, `visitor_source`                          |
| Message Sent                  | `chat_message_sent`                                  | `message_length`, `turn_number`, `intent_classification` |
| Response Received             | `chat_response_received`                             | `response_time_ms`, `model_used`                         |
| Follow-up (3+ messages)       | `chat_message_sent` (turn_number = 3)                | ���                                                      |
| Lead Expression               | `chat_message_sent` (intent = lead) OR lead captured | `intent_classification`                                  |
| Lead Captured                 | `lead_created` (source = ai_chat)                    | `lead_id`, `qualification_score`                         | #                   |

## 6.4.2 Chat Sub-Funnel SQL`sql-- Chat sub-funnel: last 7 daysWITH chat_sessions AS (  SELECT DISTINCT session_id  FROM analytics_events  WHERE event_type = 'chat_session_started'    AND timestamp >= NOW() - INTERVAL '7 days'),message_counts AS (  SELECT session_id, COUNT(*) AS msg_count,         MAX(turn_number) AS max_turn  FROM analytics_events  WHERE event_type = 'chat_message_sent'    AND timestamp >= NOW() - INTERVAL '7 days'  GROUP BY session_id),lead_chats AS (  SELECT DISTINCT session_id  FROM analytics_events  WHERE event_type = 'lead_created'    AND properties->>'source' = 'ai_chat'    AND timestamp >= NOW() - INTERVAL '7 days')SELECT  COUNT(DISTINCT cs.session_id) AS total_sessions,  COUNT(DISTINCT mc.session_id) FILTER (WHERE mc.msg_count >= 1) AS with_message,  COUNT(DISTINCT mc.session_id) FILTER (WHERE mc.msg_count >= 3) AS with_followup,  COUNT(DISTINCT lc.session_id) AS lead_captured,  ROUND(COUNT(DISTINCT lc.session_id)::numeric / NULLIF(COUNT(DISTINCT cs.session_id), 0) * 100, 1) AS chat_to_lead_pctFROM chat_sessions csLEFT JOIN message_counts mc ON cs.session_id = mc.session_idLEFT JOIN lead_chats lc ON cs.session_id = lc.session_id;`#

## 6.4.3 AI Chat Funnel Targets| Stage | Target Rate | Alert Condition |

|-------|-------------|-----------------|
| Widget Open ? Message Sent | > 80% | < 70% |
| Message Sent ? Follow-up (3+) | > 40% | < 30% |
| Follow-up ? Lead Captured | > 10% | < 5% |

## 6.5 Funnel Dashboard Widgets| Widget | Type | Data Source | Refresh | SQL Ref |

|--------|------|-------------|---------|---------|
| **Funnel Overview** | FunnelChart (8 stages) | ���6.3.2 query | Daily | `funnel-daily.sql` |
| **Stage Conversion Rates** | StatCard row (9 rates) | ���6.3.2 query | Daily | Percentage columns |
| **Week-over-Week Change** | Trend arrows per stage | ���6.3.2 query with LAG() | Weekly | `LAG(rate, 7)` window |
| **Chat Sub-Funnel** | FunnelChart (4 stages) | ���6.4.2 query | Daily | `chat-funnel.sql` |
| **Source Breakdown** | Stacked bar by source | ���6.3.2 + source join | Weekly | Source dimension |
| **Device Breakdown** | Stacked bar by device | ���6.3.2 + device join | Weekly | Mobile vs. desktop |

## 6.6 Funnel Alert Rules| Rule ID | Condition | Severity | Channel | Runbook |

|---------|-----------|----------|---------|---------|
| FUN-ALR-001 | Any stage conversion drops > 20% week-over-week | ?? Critical | Telegram | Investigate UX regression, check recent deploys |
| FUN-ALR-002 | Visitor ? Lead rate < 2% for 7 consecutive days | ?? Warning | Telegram | Review lead capture CTAs, chat enticement |
| FUN-ALR-003 | Chat ? Lead rate < 5% for 7 consecutive days | ?? Warning | Telegram | Review lead qualification agent prompt |
| FUN-ALR-004 | Engaged rate < 50% for 3 consecutive days | ?? Warning | Telegram | Review hero section, page load performance |
| FUN-ALR-005 | Lead response SLA breach (> 24h without contact) | ?? High | Telegram | Auto-escalate to backup contact |
| FUN-ALR-006 | Zero leads for 48 hours (during active period) | ?? Critical | Telegram + Email | Full pipeline investigation |---

## 7.

Lead Analytics

## 7.1 PurposeDefines the **analytical treatment of lead generation, qualification, and conversion** ��� the metrics, queries, dashboards, and alerting needed to track the lead pipeline from first touch to hired engagement.

Lead event schemas are defined in ���2.5.4; this section implements the analysis layer.

## 7.2 Business Questions Answered| # | Business Question | Decision Impact |

|---|-------------------|-----------------|
| 1 | How many leads are we generating per month, and is the trend growing? | Evaluate overall portfolio ROI |
| 2 | Which source (contact form, AI chat, referral) generates the highest quality leads? | Optimize lead capture investment |
| 3 | What is our lead response time and does it correlate with conversion? | Set staffing/slack alert priorities |
| 4 | What percentage of leads reach qualified status, and what criteria drive qualification? | Refine qualification agent scoring rules |
| 5 | Which inquiry types (hiring, freelance, collaboration) convert best? | Focus portfolio messaging on top-converting types |
| 6 | What is the average lead score by source, and how accurate is our scoring model? | Tune ML lead scoring weights |

## 7.3 Lead Metrics Matrix| Metric | Formula | Target | Tool | Frequency | Event Source |

|--------|---------|--------|------|-----------|--------------|
| **Lead Volume** | `COUNT(lead_id)` per month | > 10/mo | Custom DB | Daily | `lead_created` |
| **Lead Source Mix** | `COUNT(*) GROUP BY source` | Diversified | Custom DB | Weekly | `lead_created.properties.source` |
| **Lead Response Time** | `AVG(first_reply_at - created_at)` | < 24h | Custom DB | Daily | `lead_status_changed` (? replied) |
| **Lead Quality Score (Avg)** | `AVG(lead_score)` | > 0.5 | Custom DB | Weekly | `lead_qualified.properties.qualification_score` |
| **Lead Qualification Rate** | `(qualified / total_leads) ��� 100` | > 30% | Custom DB | Weekly | `lead_qualified` / `lead_created` |
| **Chat ? Lead Conversion** | `(chat_leads / chat_sessions) ��� 100` | > 10% | Custom DB | Weekly | `lead_created` (source = ai_chat) |
| **Form ? Lead Completion** | `(form_submits / form_starts) ��� 100` | > 60% | PostHog | Weekly | `contact_form_submit` / `contact_form_start` |
| **Lead ? Hired Rate** | `(hired / total_leads) ��� 100` | > 5% | Custom DB | Monthly | `lead_status_changed` (? hired) |
| **Lead Score Accuracy** | `(admin_validated_high / scored_high) ��� 100` | > 80% | Custom DB | Monthly | Admin follow-up validation |
| **Response SLA Compliance** | `(replied_within_24h / total_leads) ��� 100` | > 90% | Custom DB | Daily | Timestamp comparison |

## 7.4 Lead Analytics SQL Queries#

## 7.4.1 Lead Pipeline Summary`sql-- Lead pipeline: last 30 daysSELECT  COUNT(*) AS total_leads,  COUNT(*) FILTER (WHERE properties->>'source' = 'contact_form') AS from_form,  COUNT(*) FILTER (WHERE properties->>'source' = 'ai_chat') AS from_chat,  COUNT(*) FILTER (WHERE properties->>'source' = 'referral') AS from_referral,  COUNT(*) FILTER (WHERE properties->>'source' IN ('direct', 'social', 'email')) AS from_other,  COUNT(*) FILTER (WHERE EXISTS (    SELECT 1 FROM analytics_events s    WHERE s.event_type = 'lead_qualified'    AND (s.properties->>'lead_id')::uuid = (e.properties->>'lead_id')::uuid  )) AS qualified,  COUNT(*) FILTER (WHERE EXISTS (    SELECT 1 FROM analytics_events s    WHERE s.event_type = 'lead_status_changed'    AND (s.properties->>'lead_id')::uuid = (e.properties->>'lead_id')::uuid    AND s.properties->>'new_status' = 'hired'  )) AS hired,  ROUND(AVG((properties->>'qualification_score')::numeric), 2) AS avg_qual_score,  ROUND(AVG(EXTRACT(EPOCH FROM (    SELECT MIN(s.timestamp) FROM analytics_events s    WHERE s.event_type = 'lead_status_changed'    AND (s.properties->>'lead_id')::uuid = (e.properties->>'lead_id')::uuid    AND s.properties->>'new_status' = 'replied'  ) - e.timestamp) / 3600), 1) AS avg_response_hoursFROM analytics_events eWHERE e.event_type = 'lead_created'  AND e.timestamp >= NOW() - INTERVAL '30 days';`#

## 7.4.2 Lead Score Distribution`sql-- Lead score bucketsSELECT  CASE    WHEN (properties->>'qualification_score')::numeric >= 0.8 THEN 'A (0.8-1.0)'    WHEN (properties->>'qualification_score')::numeric >= 0.5 THEN 'B (0.5-0.8)'    WHEN (properties->>'qualification_score')::numeric >= 0.2 THEN 'C (0.2-0.5)'    ELSE 'D (< 0.2)'  END AS score_bucket,  COUNT(*) AS lead_count,  ROUND(AVG(EXTRACT(EPOCH FROM NOW() - e.timestamp) / 86400), 1) AS avg_age_daysFROM analytics_events eWHERE e.event_type = 'lead_qualified'  AND e.timestamp >= NOW() - INTERVAL '90 days'GROUP BY score_bucketORDER BY score_bucket;`#

## 7.4.3 Lead Source Performance`sql-- Lead source performance comparisonSELECT  e.properties->>'source' AS lead_source,  COUNT(*) AS leads,  COUNT(DISTINCT e.session_id) AS unique_sessions,  COUNT(*) FILTER (WHERE EXISTS (    SELECT 1 FROM analytics_events s    WHERE s.event_type = 'lead_qualified'    AND (s.properties->>'lead_id')::uuid = (e.properties->>'lead_id')::uuid  )) AS qualified,  ROUND(COUNT(*) FILTER (WHERE EXISTS (    SELECT 1 FROM analytics_events s    WHERE s.event_type = 'lead_status_changed'    AND (s.properties->>'lead_id')::uuid = (e.properties->>'lead_id')::uuid    AND s.properties->>'new_status' = 'hired'  ))::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS hire_rate_pct,  ROUND(AVG(EXTRACT(EPOCH FROM (    SELECT MIN(s.timestamp) FROM analytics_events s    WHERE s.event_type = 'lead_status_changed'    AND (s.properties->>'lead_id')::uuid = (e.properties->>'lead_id')::uuid    AND s.properties->>'new_status' = 'replied'  ) - e.timestamp) / 3600), 1) AS avg_response_hoursFROM analytics_events eWHERE e.event_type = 'lead_created'  AND e.timestamp >= NOW() - INTERVAL '90 days'GROUP BY lead_sourceORDER BY leads DESC;`

## 7.5 Lead Dashboard Widgets| Widget | Type | Data Source | Refresh |

|--------|------|-------------|---------|
| **Lead Volume (30d)** | StatCard with trend | ���7.4.1 | Daily |
| **Lead Source Distribution** | PieChart | ���7.4.3 | Weekly |
| **Lead Score Distribution** | StackedBarChart | ���7.4.2 | Weekly |
| **Response Time (avg)** | StatCard with SLA indicator | ���7.4.1 | Daily |
| **Qualification Rate** | StatCard with trend | ���7.4.1 | Weekly |
| **Lead Timeline** | TimeSeriesChart (daily leads) | ���7.4.1 grouped by day | Daily |
| **Inquiry Type Breakdown** | BarChart | `properties->>'inquiry_type'` GROUP BY | Weekly |
| **Lead Status Funnel** | FunnelChart (Created ? Contacted ? Qualified ? Hired) | status_changed events | Weekly |

## 7.6 Lead Alert Rules| Rule ID | Condition | Severity | Channel | Runbook |

|---------|-----------|----------|---------|---------|
| LEAD-ALR-001 | New lead created | ?? Info | Telegram | Notify admin with lead details |
| LEAD-ALR-002 | Lead score = 0.8 (high value) | ?? High | Telegram | Priority notification with lead details |
| LEAD-ALR-003 | No leads for 48 hours | ?? Warning | Telegram | Check forms, chat, site traffic |
| LEAD-ALR-004 | Response SLA breach (> 24h) | ?? High | Telegram | Escalate to backup admin contact |
| LEAD-ALR-005 | Lead volume spike > 5x daily avg | ?? Warning | Telegram | Check for bot/submission abuse |
| LEAD-ALR-006 | Qualification rate < 20% for 7 days | ?? Warning | Telegram | Review qualification criteria, agent scoring |

## 7.7 Lead Scoring ReferenceThe ML lead scoring model (from `18-AGENTS.md` ���12.10) assigns scores based on these weighted criteria.

| Analytics tracks score accuracy via admin validation feedback. | Criterion | Weight                       | High Score Signal    | Low Score Signal |
| -------------------------------------------------------------- | --------- | ---------------------------- | -------------------- | ---------------- |
| Contact completeness                                           | 30%       | Name + email + phone         | Neither              |
| Message detail                                                 | 25%       | Specific project description | Generic inquiry      |
| Source quality                                                 | 15%       | LinkedIn / Referral          | Direct / Unknown     |
| Budget mention                                                 | 15%       | Has budget range             | No budget mention    |
| Timeline                                                       | 15%       | Specific timeline            | "ASAP" / No timeline | ---              |

## 8.

AI & Agent Analytics

## 8.1 PurposeDefines the **analytical treatment of AI assistant performance, cost, quality, and agent system health** ��� tracking every dimension of the AI stack from individual chat interactions to multi-agent routing and RAG retrieval quality.

Event schemas are defined in ���2.5.5������2.5.7; this section implements the analysis layer and cross-references `17-AI_INSTRUCTIONS.md` ���18������19 and `18-AGENTS.md` ���13������20.

## 8.2 AI Performance Metrics| Metric | Formula | Target | Tool | Frequency | Event Source |

|--------|---------|--------|------|-----------|--------------|
| **Chat Sessions** | `COUNT(DISTINCT session_id)` | > 200/mo | Custom DB | Daily | `chat_session_started` |
| **Messages per Session** | `AVG(message_count)` | > 3 | Custom DB | Weekly | `chat_message_sent` |
| **Response Time (p95)** | `PERCENTILE(0.95, response_time_ms)` | < 3s | Custom DB | Daily | `chat_response_received` |
| **Response Time (first token)** | `PERCENTILE(0.95, tt_first_token_ms)` | < 1.5s | Custom DB | Daily | `chat_response_received` |
| **Model Usage Distribution** | `COUNT(*) GROUP BY model` | GPT-4: > 80% | Custom DB | Weekly | `chat_response_received.properties.model` |
| **Cache Hit Rate** | `cache_hits / total_lookups ��� 100` | > 40% | Custom DB | Daily | Response + embedding cache stats |
| **Error Rate (AI)** | `error_count / total_requests ��� 100` | < 1% | Sentry | Real-time | `chat_response_error` |
| **Model Fallback Rate** | `fallback_count / total_requests ��� 100` | < 5% | Custom DB | Daily | `ai_model_fallback` |
| **Hallucination Flag Rate** | `flagged / total_responses ��� 100` | < 1% | Custom DB | Weekly | `ai_hallucination_flagged` |
| **AI Uptime** | `(successful_checks / total_checks) ��� 100` | > 99.5% | Better Uptime | Real-time | Health endpoint |

## 8.3 AI Cost Analytics#

## 8.3.1 Cost Metrics| Metric | Formula | Target | Tool | Frequency |

|--------|---------|--------|------|-----------|
| **Monthly AI Cost** | `SUM(cost_usd)` | < $10 | Custom DB | Daily |
| **Daily AI Cost** | `SUM(cost_usd)` per day | < $0.50 | Custom DB | Daily |
| **Cost per Chat Session** | `AVG(session_cost)` | < $0.02 | Custom DB | Weekly |
| **Cost per Message** | `AVG(cost_usd)` per `chat_message_sent` | < $0.005 | Custom DB | Weekly |
| **Model Cost Breakdown** | `SUM(cost_usd) GROUP BY model` | ��� | Custom DB | Weekly |
| **Cost Trend (7-day avg)** | `AVG(SUM(cost_usd))` over 7 days | ��� | Custom DB | Daily |
| **Budget Utilization** | `(monthly_cost / budget) ��� 100` | < 80% | Custom DB | Daily |#

## 8.3.2 Cost Tracking SQL`sql-- Daily cost breakdown by model (last 30 days)SELECT  DATE(timestamp) AS day,  properties->>'model' AS model,  COUNT(*) AS requests,  SUM((properties->>'cost_usd')::numeric) AS total_cost_usd,  SUM((properties->>'prompt_tokens')::int) AS prompt_tokens,  SUM((properties->>'completion_tokens')::int) AS completion_tokens,  ROUND(AVG((properties->>'cost_usd')::numeric), 6) AS avg_cost_per_requestFROM analytics_eventsWHERE event_type = 'ai_cost_tracking'  AND timestamp >= NOW() - INTERVAL '30 days'GROUP BY DATE(timestamp), properties->>'model'ORDER BY day DESC, total_cost_usd DESC;``````sql-- Monthly spend vs. budgetSELECT  DATE_TRUNC('month', timestamp) AS month,  SUM((properties->>'cost_usd')::numeric) AS total_spend,  CASE    WHEN SUM((properties->>'cost_usd')::numeric) >= 10.00 THEN 'CRITICAL ��� Budget exhausted'    WHEN SUM((properties->>'cost_usd')::numeric) >= 8.00 THEN 'WARNING ��� Near limit'    WHEN SUM((properties->>'cost_usd')::numeric) >= 5.00 THEN 'CAUTION ��� 50% used'    ELSE 'OK'  END AS budget_status,  ROUND(SUM((properties->>'cost_usd')::numeric) / 10.00 * 100, 1) AS budget_utilization_pctFROM analytics_eventsWHERE event_type = 'ai_cost_tracking'  AND timestamp >= NOW() - INTERVAL '90 days'GROUP BY DATE_TRUNC('month', timestamp)ORDER BY month DESC;`

## 8.4 Agent Performance Metrics| Metric | Formula | Target | Tool | Frequency | Event Source |

|--------|---------|--------|------|-----------|--------------|
| **Routing Accuracy** | `(correct_routes / total_routes) ��� 100` | > 98% | Custom DB | Weekly | `agent_routing` |
| **Routing Latency** | `PERCENTILE(0.95, response_time_ms)` | < 50ms | Custom DB | Daily | `agent_routing` |
| **Agent Response Accuracy** | Manual sampling score | > 95% | Review | Weekly | `18-AGENTS.md` ���20 |
| **Agent Response Time** | `PERCENTILE(0.95, response_time_ms)` | < 3s | Custom DB | Daily | `agent_routing` |
| **Handoff Success Rate** | `(successful_handoffs / total_handoffs) ��� 100` | > 99% | Custom DB | Weekly | `agent_handoff` |
| **Handoff Latency** | `PERCENTILE(0.95, context_size)` | < 100ms | Custom DB | Weekly | `agent_handoff` |
| **Agent Failure Rate** | `failures / total_agent_requests ��� 100` | < 2% | Custom DB | Daily | `agent_failure` |
| **Unhandled Query Rate** | `unhandled / total_queries ��� 100` | < 5% | Custom DB | Weekly | Fallback routing |
| **Lead Capture Rate (Lead Agent)** | `captured_leads / lead_intents ��� 100` | > 60% | Custom DB | Weekly | Lead qualification agent |
| **False Positive Rate (Lead Agent)** | `false_leads / total_captured ��� 100` | < 10% | Custom DB | Weekly | Admin validation feedback |

## 8.5 Agent Routing Distribution SQL`sql-- Agent routing distribution (last 30 days)SELECT  properties->>'agent_name' AS agent,  COUNT(*) AS total_routes,  ROUND(AVG((properties->>'confidence')::numeric), 3) AS avg_confidence,  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (properties->>'response_time_ms')::numeric), 1) AS p50_latency_ms,  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (properties->>'response_time_ms')::numeric), 1) AS p95_latency_ms,  COUNT(*) FILTER (WHERE (properties->>'confidence')::numeric >= 0.8) AS high_confidence_routes,  ROUND(COUNT(*) FILTER (WHERE (properties->>'confidence')::numeric >= 0.8)::numeric / NULLIF(COUNT(*), 0) * 100, 1) AS high_confidence_pctFROM analytics_eventsWHERE event_type = 'agent_routing'  AND timestamp >= NOW() - INTERVAL '30 days'GROUP BY properties->>'agent_name'ORDER BY total_routes DESC;`

## 8.6 RAG Quality Metrics| Metric | Formula | Target | Tool | Frequency | Event Source |

|--------|---------|--------|------|-----------|--------------|
| **Avg Query Relevance** | `AVG(avg_relevance_score)` | > 0.7 | Custom DB | Weekly | `rag_query` |
| **Chunks Retrieved** | `AVG(chunks_retrieved)` | 3 | Custom DB | Weekly | `rag_query` |
| **RAG Response Time** | `PERCENTILE(0.95, response_time_ms)` | < 50ms | Custom DB | Daily | `rag_query` |
| **Chunks with Relevance > 0.7** | `(high_relevance / total_chunks) ��� 100` | > 80% | Custom DB | Weekly | `rag_source_attribution` |
| **Embedding Generation Time** | `PERCENTILE(0.95, duration_ms)` | < 200ms | Custom DB | Per index | `rag_embedding_generated` |

## 8.7 AI & Agent Dashboard Widgets| Widget | Type | Data Source | Refresh |

|--------|------|-------------|---------|
| **Sessions (30d)** | StatCard with trend | `chat_session_started` | Daily |
| **Response Time (p95)** | StatCard with target indicator | ���8.2 (p95 query) | Daily |
| **Monthly Cost** | StatCard with budget gauge | ���8.3.2 | Daily |
| **Model Usage** | PieChart (GPT-4, Claude, GPT-3.5) | ���8.3.2 | Weekly |
| **Cost Trend** | TimeSeriesChart (daily cost) | ���8.3.2 | Daily |
| **Agent Routing Distribution** | BarChart (routes per agent) | ���8.5 | Weekly |
| **Error/Fallback Rate** | TimeSeriesChart | ���8.2 (error/fallback queries) | Daily |
| **RAG Relevance Score** | StatCard with trend | ���8.6 (avg relevance) | Weekly |
| **User Satisfaction** | StatCard (avg rating) | `chat_feedback.properties.rating` | Weekly |
| **Top Queries** | DataTable | `chat_message_sent.properties.intent_classification` | Weekly |

## 8.8 AI & Agent Alert Rules| Rule ID | Condition | Severity | Channel | Runbook |

|---------|-----------|----------|---------|---------|
| AI-ALR-001 | p95 response time > 5s for 5 min | ?? Critical | Telegram | Check model availability, trigger fallback |
| AI-ALR-002 | Daily cost > $0.50 | ?? High | Telegram | Check for abuse, review logs |
| AI-ALR-003 | Monthly cost > $10 | ?? Critical | Telegram | Disable AI chat, notify admin |
| AI-ALR-004 | Error rate > 5% in 24h rolling window | ?? High | Telegram | Investigate Sentry issues |
| AI-ALR-005 | AI service health non-200 for 1 min | ?? Critical | Telegram | Trigger fallback chain |
| AI-ALR-006 | RAG avg relevance < 0.6 for 1h | ?? High | Telegram | Check knowledge base freshness |
| AI-ALR-007 | Cache hit rate < 20% for 1h | ?? Warning | Telegram | Review cache TTL configuration |
| AI-ALR-008 | Model fallback events > 3/day | ?? High | Telegram | Investigate primary model health |
| AI-ALR-009 | Hallucination flag rate > 3% in 24h | ?? High | Telegram | Review RAG pipeline, prompt quality |
| AI-ALR-010 | Rate limit 429 responses > 5/hour | ?? High | Telegram | Check rate limit configuration |---

## 9.

SEO Analytics

## 9.1 PurposeDefines the **analytical treatment of search engine optimization performance** ��� tracking keyword rankings, organic traffic, index coverage, backlinks, Core Web Vitals from an SEO perspective, and structured data health.

Event schemas are defined in ���2.5.11; this section implements the analysis layer and cross-references `SEOArchitecture.md` ���17.

## 9.2 Business Questions Answered| # | Business Question | Decision Impact |

|---|-------------------|-----------------|
| 1 | What is our organic traffic share and is it growing? | Validate content strategy ROI |
| 2 | Which keywords are ranking in the top 10, and what is the trend? | Prioritize content optimization |
| 3 | Are all public pages indexed by Google? | Fix crawl/index issues |
| 4 | What is our organic click-through rate and how does it vary by position? | Optimize title tags and meta descriptions |
| 5 | How many backlinks do we have, and which domains link to us? | Build link acquisition strategy |
| 6 | Is our structured data valid across all pages? | Maximize rich result eligibility |

## 9.3 SEO Metrics Matrix| Metric | Formula | Target | Tool | Frequency | Event Source |

|--------|---------|--------|------|-----------|--------------|
| **Organic Traffic Share** | `(organic_sessions / total_sessions) ��� 100` | > 30% | Umami | Weekly | `page_view` + referrer classification |
| **Keywords in Top 10** | `COUNT(keyword WHERE position = 10)` | > 20 | GSC | Weekly | `seo_keyword_ranking` |
| **Avg Keyword Position** | `AVG(position)` for keyword set | Top 10 | GSC | Weekly | `seo_keyword_ranking` |
| **Organic CTR** | `(clicks / impressions) ��� 100` | > 5% | GSC | Weekly | GSC API |
| **Index Coverage** | `(indexed / total_submitted) ��� 100` | 100% | GSC | Weekly | `seo_indexed_pages` |
| **Crawl Errors** | `COUNT(crawl_errors)` | 0 | GSC | Weekly | Crawl log analysis |
| **Pages with Valid Schema** | `(valid_schema / total_pages) ��� 100` | 100% | GSC + RH Test | Monthly | `structured_data_valid` |
| **Core Web Vitals Pass Rate** | `(pages_good_cwv / total_pages) ��� 100` | > 90% | GSC + Vercel | Weekly | CWV events |
| **Backlinks (Domains)** | `COUNT(DISTINCT source_domain)` | > 10 | Free tools | Monthly | `seo_backlink_discovered` |
| **Domain Authority (Avg)** | `AVG(domain_authority)` | > 30 | Free tools | Monthly | `seo_backlink_discovered` |

## 9.4 SEO SQL Queries#

## 9.4.1 Keyword Position Tracking`sql-- Keyword ranking snapshot (latest per keyword)SELECT DISTINCT ON (properties->>'keyword')  properties->>'keyword' AS keyword,  (properties->>'position')::int AS current_position,  (properties->>'previous_position')::int AS previous_position,  (properties->>'search_volume')::int AS search_volume,  timestamp AS measured_at,  CASE    WHEN (properties->>'position')::int < (properties->>'previous_position')::int THEN 'UP'    WHEN (properties->>'position')::int > (properties->>'previous_position')::int THEN 'DOWN'    ELSE 'SAME'  END AS trend,  (properties->>'previous_position')::int - (properties->>'position')::int AS position_changeFROM analytics_eventsWHERE event_type = 'seo_keyword_ranking'  AND timestamp >= NOW() - INTERVAL '90 days'ORDER BY properties->>'keyword', timestamp DESC;`#

## 9.4.2 Index Coverage Over Time`sql-- Index coverage daily snapshotSELECT  DATE(timestamp) AS day,  SUM((properties->>'page_count')::int) AS total_pages,  COUNT(*) FILTER (WHERE properties->>'coverage_state' = 'indexed') AS indexed,  COUNT(*) FILTER (WHERE properties->>'coverage_state' = 'submitted') AS submitted,  COUNT(*) FILTER (WHERE properties->>'coverage_state' = 'excluded') AS excluded,  COUNT(*) FILTER (WHERE properties->>'coverage_state' = 'error') AS errors,  ROUND(    COUNT(*) FILTER (WHERE properties->>'coverage_state' = 'indexed')::numeric    / NULLIF(COUNT(*), 0) * 100, 1  ) AS coverage_pctFROM analytics_eventsWHERE event_type = 'seo_indexed_pages'  AND timestamp >= NOW() - INTERVAL '30 days'GROUP BY DATE(timestamp)ORDER BY day DESC;`

## 9.5 SEO Dashboard Widgets| Widget | Type | Data Source | Refresh |

|--------|------|-------------|---------|
| **Organic Traffic Share** | StatCard with gauge | Umami referrer data | Weekly |
| **Keywords in Top 10** | StatCard with trend | ���9.4.1 | Weekly |
| **Avg Position** | StatCard with trend | ���9.4.1 | Weekly |
| **Organic CTR** | StatCard with trend | GSC API | Weekly |
| **Index Coverage %** | StatCard with color indicator | ���9.4.2 | Weekly |
| **Keyword Rankings Table** | DataTable (keyword, position, change, volume) | ���9.4.1 | Weekly |
| **Index Coverage Trend** | TimeSeriesChart (indexed vs. total) | ���9.4.2 | Weekly |
| **SEO Health Score** | Composite score (0-100) | Multiple sources | Weekly |
| **Backlink Growth** | TimeSeriesChart (domains over time) | `seo_backlink_discovered` | Monthly |

## 9.6 SEO Alert Rules| Rule ID | Condition | Severity | Channel | Runbook |

|---------|-----------|----------|---------|---------|
| SEO-ALR-001 | Indexed pages drops > 5% week-over-week | ?? Critical | Telegram | Investigate GSC for penalties/crawl issues |
| SEO-ALR-002 | New crawl errors detected (404s, 500s) | ?? High | Telegram | Fix within 24h, check sitemap |
| SEO-ALR-003 | Brand keyword position drops > 3 positions | ?? Warning | Email | Investigate within 48h |
| SEO-ALR-004 | Core Web Vitals pass rate drops below 80% | ?? High | Telegram | Check Vercel Analytics, fix regressions |
| SEO-ALR-005 | Structured data errors detected | ?? Warning | Email | Fix schema markup, re-test with RH validator |
| SEO-ALR-006 | Sitemap submission error | ?? High | Telegram | Re-submit sitemap, check robots.txt |---

## 10.

Content & Portfolio Analytics

## 10.1 PurposeDefines the **analytical treatment of portfolio content performance** ��� tracking how visitors interact with projects, skills, testimonials, case studies, blog articles, and the resume.

Event schemas are defined in ���2.5.1������2.5.3; this section implements the analysis layer and cross-references `AnalyticsArchitecture.md` ���6������7.

## 10.2 Business Questions Answered| # | Business Question | Decision Impact |

|---|-------------------|-----------------|
| 1 | Which projects receive the most views and clicks? | Feature top-performing projects prominently |
| 2 | What is the average scroll depth on articles, and which sections retain readers? | Optimize article structure and content placement |
| 3 | Which skills generate the most interest (hover/click)? | Highlight in-demand skills in hero section |
| 4 | How effective are project CTAs (GitHub, live demo)? | Improve CTA placement, text, or visibility |
| 5 | Which traffic sources send the most engaged visitors? | Allocate content promotion spend |
| 6 | What is the blog ? lead conversion rate and which posts convert best? | Focus content strategy on high-converting topics |

## 10.3 Content Metrics Matrix#

## 10.3.1 Portfolio Content Metrics| Metric | Formula | Target | Tool | Frequency | Event Source |

|--------|---------|--------|------|-----------|--------------|
| **Projects Viewed per Session** | `AVG(project_clicks_per_session)` | > 2 | PostHog | Weekly | `project_click` |
| **Project Detail Completion** | `(detail_views / card_clicks) ��� 100` | > 40% | PostHog | Weekly | `project_detail_view` / `project_click` |
| **GitHub Link CTR** | `(github_clicks / project_views) ��� 100` | > 15% | PostHog | Weekly | `github_click` / `project_click` |
| **Live Demo CTR** | `(demo_clicks / project_views) ��� 100` | > 25% | PostHog | Weekly | `live_demo_click` / `project_click` |
| **Skills Interest Rate** | `(skill_interactions / skills_section_views) ��� 100` | > 50% | PostHog | Weekly | `skill_hover` / `page_section_visible` (skills) |
| **Testimonial Engagement** | `(testimonial_nav_actions / section_views) ��� 100` | > 30% | PostHog | Weekly | `testimonial_next`/`prev` |
| **Case Study Read Rate** | `(scroll_depth_75 / case_study_view) ��� 100` | > 50% | PostHog | Weekly | Scroll events on case study pages |
| **Section Engagement Ranking** | `AVG(time_on_section_ms) GROUP BY section` | ��� | PostHog | Weekly | `page_section_visible` |#

## 10.3.2 Blog & Article Metrics| Metric | Formula | Target | Tool | Frequency | Event Source |

|--------|---------|--------|------|-----------|--------------|
| **Blog Post Views** | `COUNT(DISTINCT session) WHERE page ~ /blog/*` | > 500/mo | Umami | Weekly | `page_view` |
| **Avg Read Time** | `AVG(time_on_page_ms) / 60000` where page is blog | > 3 min | PostHog | Weekly | `page_time_on_page` |
| **Scroll Depth (Articles)** | `AVG(scroll_depth_pct)` | > 70% | PostHog | Weekly | `article_view` + `page_scroll` |
| **Article Read Completion** | `(article_read_complete / article_view) ��� 100` | > 40% | PostHog | Weekly | `article_read_complete` |
| **Social Shares per Post** | `AVG(shares) GROUP BY article_id` | > 5 | PostHog | Monthly | `article_share` |
| **Blog ? Lead Conversion** | `(blog_leads / blog_visitors) ��� 100` | > 2% | Custom DB | Monthly | Lead source attribution |
| **Blog Return Reader Rate** | `(returning_blog_visitors / total_blog_visitors) ��� 100` | > 20% | PostHog | Monthly | Visitor return detection |
| **Code Copy Rate** | `(code_copies / code_block_views) ��� 100` | > 10% | PostHog | Monthly | `code_copy` |

## 10.4 Content SQL Queries#

## 10.4.1 Top Performing Projects`sql-- Top projects by engagement (last 30 days)SELECT  properties->>'project_title' AS project_title,  properties->>'category' AS category,  COUNT(*) AS total_clicks,  COUNT(DISTINCT session_id) AS unique_visitors,  COUNT(*) FILTER (WHERE EXISTS (    SELECT 1 FROM analytics_events d    WHERE d.event_type = 'project_detail_view'      AND (d.properties->>'project_id') = (e.properties->>'project_id')      AND d.session_id = e.session_id  )) AS detail_views,  ROUND(    COUNT(*) FILTER (WHERE EXISTS (      SELECT 1 FROM analytics_events d      WHERE d.event_type = 'project_detail_view'        AND (d.properties->>'project_id') = (e.properties->>'project_id')        AND d.session_id = e.session_id    ))::numeric / NULLIF(COUNT(*), 0) * 100, 1  ) AS detail_conversion_pctFROM analytics_events eWHERE e.event_type = 'project_click'  AND e.timestamp >= NOW() - INTERVAL '30 days'GROUP BY properties->>'project_title', properties->>'category'ORDER BY total_clicks DESCLIMIT 10;`#

## 10.4.2 Section Engagement Ranking`sql-- Section engagement rankingSELECT  properties->>'section_type' AS section_type,  COUNT(DISTINCT session_id) AS unique_viewers,  AVG((properties->>'viewport_pct')::int) AS avg_viewport_pct,  COUNT(*) AS total_views,  ROUND(AVG((    SELECT (p.properties->>'duration_ms')::int    FROM analytics_events p    WHERE p.event_type = 'page_time_on_page'      AND p.session_id = e.session_id      AND p.timestamp BETWEEN e.timestamp - INTERVAL '1 second'        AND e.timestamp + INTERVAL '60 seconds'  )), 0) AS avg_time_on_section_msFROM analytics_events eWHERE e.event_type = 'page_section_visible'  AND e.timestamp >= NOW() - INTERVAL '30 days'GROUP BY properties->>'section_type'ORDER BY unique_viewers DESC;`

## 10.5 Content Dashboard Widgets| Widget | Type | Data Source | Refresh |

|--------|------|-------------|---------|
| **Top Projects** | DataTable (clicks, detail_views, conversion) | ���10.4.1 | Weekly |
| **Section Engagement** | HorizontalBarChart (unique viewers per section) | ���10.4.2 | Weekly |
| **Project CTA Performance** | StatCard row (GitHub CTR, Demo CTR) | ���10.3.1 | Weekly |
| **Blog Views (30d)** | StatCard with sparkline | Umami | Weekly |
| **Avg Read Time** | StatCard with target indicator | ���10.3.2 | Weekly |
| **Blog Top Posts** | DataTable (views, read_time, shares, leads) | ���10.3.2 | Weekly |
| **Skill Interest Heatmap** | Grid/Heatmap (skill ��� category) | `skill_hover` | Weekly |
| **Testimonial Carousel Engagement** | StatCard (nav actions / views) | ���10.3.1 | Weekly |

## 10.6 Content Alert Rules| Rule ID | Condition | Severity | Channel | Runbook |

|---------|-----------|----------|---------|---------|
| CONT-ALR-001 | Project detail conversion drops below 25% | ?? Warning | Email | Check project detail page load, layout |
| CONT-ALR-002 | Blog read time < 2 min avg for 7 days | ?? Warning | Email | Review content quality, readability |
| CONT-ALR-003 | Blog views drop > 30% week-over-week | ?? Warning | Telegram | Check for indexing issues, promo gaps |
| CONT-ALR-004 | Skills interest rate < 30% | ?? Info | Email | Review skills section visibility |
| CONT-ALR-005 | Live demo CTR < 15% for any project | ?? Info | Email | Check demo link visibility, project page |---

## 11.

Performance Analytics

## 11.1 PurposeDefines the **analytical treatment of website and API performance** ��� tracking Core Web Vitals, Lighthouse scores, API latencies, error rates, uptime, build times, and bundle sizes.

Event schemas are defined in ���2.5.12; this section implements the analysis layer and cross-references `PerformanceArchitecture.md` ���5������6 and `21-MONITORING.md` ���3.

## 11.2 Business Questions Answered| # | Business Question | Decision Impact |

|---|-------------------|-----------------|
| 1 | Are our Core Web Vitals meeting SEO and user experience targets? | Prioritize performance optimization sprints |
| 2 | Which pages perform worst on CWV metrics? | Target page-specific fixes |
| 3 | What is our Lighthouse score trend across deploys? | Block deploys that regress scores |
| 4 | Which API endpoints are slowest? | Optimize backend bottlenecks |
| 5 | Are we within our performance budgets? | Maintain CI enforcement of budgets |
| 6 | What is our uptime SLA compliance? | Evaluate hosting provider, redundancy needs |

## 11.3 Performance Metrics Matrix#

## 11.3.1 Core Web Vitals| Metric | Formula | Aspirational Target | Monitoring Target | Tool | Frequency |

|--------|---------|--------------------|--------------------|------|-----------|
| **LCP (p75)** | PERCENTILE(0.75, value_ms) | < 1.8s | < 2.5s | Vercel Analytics | Per page load |
| **CLS (p75)** | PERCENTILE(0.75, value) | < 0.05 | < 0.1 | Vercel Analytics | Per page load |
| **INP (p75)** | PERCENTILE(0.75, value_ms) | < 50ms | < 200ms | Vercel Analytics | Per interaction |
| **FCP (p75)** | PERCENTILE(0.75, value_ms) | < 1.2s | < 1.8s | Vercel Analytics | Per page load |
| **TTFB (p75)** | PERCENTILE(0.75, value_ms) | < 200ms | < 800ms | Vercel Analytics | Per page load |
| **CWV Pass Rate** | `(pages_all_good / total_pages) ��� 100` | > 90% | > 75% | GSC + Vercel | Weekly |#

## 11.3.2 Lighthouse Scores| Metric | Formula | Aspirational Target | CI Block Threshold | Tool | Frequency |

|--------|---------|--------------------|--------------------|------|-----------|
| **Performance Score** | Lighthouse score (0-100) | = 95 | < 90 | Lighthouse CI | Per deploy |
| **Accessibility Score** | Lighthouse score (0-100) | = 95 | < 90 | Lighthouse CI | Per deploy |
| **SEO Score** | Lighthouse score (0-100) | = 95 | < 90 | Lighthouse CI | Per deploy |
| **Best Practices Score** | Lighthouse score (0-100) | = 95 | < 90 | Lighthouse CI | Per deploy |#

## 11.3.3 API & System Performance| Metric | Formula | Target | Tool | Frequency |

|--------|---------|--------|------|-----------|
| **API Response Time (p95)** | PERCENTILE(0.95, response_time_ms) | < 300ms | Sentry | Per request |
| **API 5xx Error Rate** | `(5xx_count / total_requests) ��� 100` | < 0.1% | Sentry | Rolling 24h |
| **Frontend Uptime** | `(successful_checks / total_checks) ��� 100` | > 99.9% | Better Uptime | Every 1 min |
| **API Uptime** | `(successful_checks / total_checks) ��� 100` | > 99.9% | Better Uptime | Every 1 min |
| **AI Uptime** | `(successful_checks / total_checks) ��� 100` | > 99.5% | Better Uptime | Every 1 min |
| **Build Time** | Pipeline duration | < 10 min | GitHub Actions | Per deploy |
| **Bundle Size (JS)** | Total JS per page | < 200KB | Bundle Analyzer | Per deploy |
| **Database Query (p95)** | PERCENTILE(0.95, query_time_ms) | < 50ms | pg_stat_statements | Continuous |#

## 11.3.4 Performance Budgets (CI-Enforced)| Budget Metric | Aspirational | CI Block Threshold | Measurement Tool |

|--------------|-------------|-------------------|------------------|
| LCP | < 1.8s | > 2.5s | Vercel Analytics |
| CLS | < 0.05 | > 0.1 | Vercel Analytics |
| INP | < 50ms | > 200ms | Vercel Analytics |
| FCP | < 1.2s | > 1.8s | Vercel Analytics |
| TTFB | < 200ms | > 800ms | Vercel Analytics |
| Initial JS Bundle | < 85KB | > 100KB | Bundle Analyzer |
| Total Page Weight | < 400KB | > 512KB | Lighthouse CI |
| HTTP Requests | < 20 | > 25 | Lighthouse CI |
| Lighthouse Performance | = 95 | < 90 | Lighthouse CI |
| Lighthouse Accessibility | = 95 | < 90 | Lighthouse CI |
| Lighthouse SEO | = 95 | < 90 | Lighthouse CI |
| Lighthouse Best Practices | = 95 | < 90 | Lighthouse CI |

## 11.4 Performance SQL Queries#

## 11.4.1 Core Web Vitals Distribution`sql-- CWV rating distribution (last 7 days)SELECT  properties->>'rating' AS rating,  COUNT(*) FILTER (WHERE event_type = 'vital_lcp') AS lcp_count,  ROUND(AVG((properties->>'value_ms')::numeric) FILTER (WHERE event_type = 'vital_lcp'), 1) AS avg_lcp_ms,  COUNT(*) FILTER (WHERE event_type = 'vital_cls') AS cls_count,  ROUND(AVG((properties->>'value')::numeric) FILTER (WHERE event_type = 'vital_cls'), 4) AS avg_cls,  COUNT(*) FILTER (WHERE event_type = 'vital_inp') AS inp_count,  ROUND(AVG((properties->>'value_ms')::numeric) FILTER (WHERE event_type = 'vital_inp'), 1) AS avg_inp_msFROM analytics_eventsWHERE event_type IN ('vital_lcp', 'vital_cls', 'vital_inp')  AND timestamp >= NOW() - INTERVAL '7 days'GROUP BY properties->>'rating'ORDER BY CASE properties->>'rating'  WHEN 'good' THEN 1 WHEN 'needs_improvement' THEN 2 WHEN 'poor' THEN 3END;`#

## 11.4.2 Lighthouse Trend`sql-- Lighthouse scores per deploy (last 30 builds)SELECT  timestamp,  (properties->>'performance_score')::int AS performance,  (properties->>'accessibility_score')::int AS accessibility,  (properties->>'seo_score')::int AS seo,  (properties->>'best_practices_score')::int AS best_practices,  ROUND(    ((properties->>'performance_score')::int +     (properties->>'accessibility_score')::int +     (properties->>'seo_score')::int +     (properties->>'best_practices_score')::int) / 4.0, 1  ) AS avg_scoreFROM analytics_eventsWHERE event_type = 'lh_score'ORDER BY timestamp DESCLIMIT 30;`

## 11.5 Performance Dashboard Widgets| Widget | Type | Data Source | Refresh |

|--------|------|-------------|---------|
| **CWV Rating Distribution** | StackedBarChart (good/ni/poor per metric) | ���11.4.1 | Per page load |
| **Lighthouse Score Trend** | TimeSeriesChart (4 lines: perf/a11y/seo/bp) | ���11.4.2 | Per deploy |
| **API Response Time (p95)** | StatCard with target indicator | Sentry | Rolling 24h |
| **Uptime Status** | 3 StatCards (FE, API, AI) | Better Uptime | Real-time |
| **Build Time** | StatCard with trend | GitHub Actions | Per deploy |
| **Bundle Size** | StatCard with budget gauge | Bundle Analyzer | Per deploy |
| **Error Rate** | StatCard with color indicator | Sentry | Rolling 24h |
| **Performance Budget Status** | TrafficLight (green/yellow/red per budget) | ���11.3.4 | Per deploy |

## 11.6 Performance Alert Rules| Rule ID | Condition | Severity | Channel | Runbook |

|---------|-----------|----------|---------|---------|
| PERF-ALR-001 | LCP (p75) > 2.5s for 1h | ?? High | Telegram | Check for performance regressions |
| PERF-ALR-002 | CLS (p75) > 0.1 for 1h | ?? High | Telegram | Check layout shift sources |
| PERF-ALR-003 | INP (p75) > 200ms for 1h | ?? High | Telegram | Check interaction handlers |
| PERF-ALR-004 | Frontend uptime < 99.9% in 24h | ?? Critical | Telegram | Investigate Vercel outage |
| PERF-ALR-005 | API uptime < 99.9% in 24h | ?? Critical | Telegram | Investigate API service |
| PERF-ALR-006 | Error rate > 1% in 5 min | ?? Critical | Telegram | Investigate Sentry, rollback if needed |
| PERF-ALR-007 | Lighthouse perf score < 90 on deploy | ?? High | Telegram | Block deploy, fix performance regression |
| PERF-ALR-008 | Bundle size > 100KB initial JS | ?? Warning | Email | Optimize code splitting |
| PERF-ALR-009 | Build time > 10 min | ?? Info | Email | Review CI pipeline efficiency |---

## 12.

Executive & Business Metrics

## 12.1 PurposeDefines the **analytical treatment of top-level executive and business metrics** ��� the key performance indicators that measure overall portfolio health, growth, and ROI.

These metrics aggregate across all other domains to provide a single-pane-of-glass view of the portfolio's effectiveness.
Cross-references `AnalyticsArchitecture.md` ���1.4 and ���5.

## 12.2 Business Questions Answered| # | Business Question | Decision Impact |

|---|-------------------|-----------------|
| 1 | Is the portfolio growing in traffic, engagement, and conversions? | Strategic direction, feature investment |
| 2 | What is the overall ROI of the portfolio in terms of lead generation and hires? | Time allocation, content strategy |
| 3 | How does this month compare to last month across all KPIs? | Monthly reporting, stakeholder updates |
| 4 | Are we within budget across all paid services? | Cost optimization, plan upgrades |
| 5 | What is the overall health score of the portfolio? | At-a-glance status for admin |

## 12.3 Executive KPI Matrix| KPI | Formula | Target | Tool | Frequency | Tier |

|-----|---------|--------|------|-----------|------|
| **Monthly Active Visitors (MAV)** | `COUNT(DISTINCT visitor_id)` per month | > 1,000 | Umami | Monthly | Strategic |
| **Visitor Growth Rate (MoM)** | `((MAV_t - MAV_{t-1}) / MAV_{t-1}) ��� 100` | > 20% | Umami | Monthly | Strategic |
| **Lead Conversion Rate** | `(Leads / Unique Visitors) ��� 100` | > 3% | Custom DB | Weekly | Strategic |
| **Lead Volume (Monthly)** | `COUNT(lead_id)` per month | > 10 | Custom DB | Monthly | Strategic |
| **Hire Rate** | `(Hired / Total Leads) ��� 100` | > 5% | Custom DB | Quarterly | Strategic |
| **Revenue Inquiries** | `COUNT(inquiry_type = 'hiring' OR 'freelance')` | ��� | Custom DB | Monthly | Strategic |
| **Avg Session Duration** | `AVG(session_duration_s)` | > 3 min | Umami | Weekly | Tactical |
| **Bounce Rate** | `(single_page_sessions / total_sessions) ��� 100` | < 50% | Umami | Weekly | Tactical |
| **Engagement Rate** | `(visitors_with_interaction / total_visitors) ��� 100` | > 60% | PostHog | Weekly | Tactical |
| **SEO Organic Share** | `(organic_sessions / total_sessions) ��� 100` | > 30% | Umami | Monthly | Tactical |
| **Keywords in Top 10** | `COUNT(keyword WHERE position = 10)` | > 20 | GSC | Monthly | Tactical |
| **AI Chat Sessions (Monthly)** | `COUNT(session_id)` per month | > 200 | Custom DB | Monthly | Tactical |
| **AI Cost (Monthly)** | `SUM(cost_usd)` | < $10 | Custom DB | Monthly | Operational |
| **CWV Pass Rate** | `(good_cwv_pages / total_pages) ��� 100` | > 90% | GSC + Vercel | Monthly | Operational |
| **Uptime (All Services)** | Minimum of FE/API/AI uptime | > 99.5% | Better Uptime | Monthly | Operational |

## 12.4 Executive Dashboard ��� Single Pane of Glass#

## 12.4.1 KPI Row (Top 8 Strategic Cards)| Card | Target | Color Rule |

|------|--------|------------|
| Monthly Active Visitors | > 1,000 | ?? > 1,000 ?? 700-1,000 ?? < 700 |
| Visitor MoM Growth | > 20% | ?? > 20% ?? 10-20% ?? < 10% |
| Lead Conversion Rate | > 3% | ?? > 3% ?? 2-3% ?? < 2% |
| Monthly Lead Volume | > 10 | ?? > 10 ?? 5-10 ?? < 5 |
| Bounce Rate | < 50% | ?? < 40% ?? 40-50% ?? > 50% |
| Avg Session Duration | > 3 min | ?? > 3min ?? 2-3min ?? < 2min |
| SEO Organic Share | > 30% | ?? > 30% ?? 20-30% ?? < 20% |
| AI Monthly Cost | < $10 | ?? < $8 ?? $8-10 ?? > $10 |#

## 12.4.2 Executive Metrics SQL`sql-- Executive summary (current month)WITH monthly_stats AS (  SELECT    DATE_TRUNC('month', timestamp) AS month,    COUNT(DISTINCT session_id) AS total_sessions,    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'page_view') AS visitors,    COUNT(DISTINCT session_id) FILTER (WHERE event_type IN ('page_scroll', 'section_view')) AS engaged,    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'lead_created') AS leads,    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'chat_session_started') AS chat_sessions  FROM analytics_events  WHERE timestamp >= DATE_TRUNC('month', NOW())  GROUP BY DATE_TRUNC('month', timestamp)),prev_month_stats AS (  SELECT    COUNT(DISTINCT session_id) AS prev_visitors,    COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'lead_created') AS prev_leads  FROM analytics_events  WHERE timestamp >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')    AND timestamp < DATE_TRUNC('month', NOW()))SELECT  ms.visitors AS monthly_visitors,  COALESCE(ps.prev_visitors, 0) AS prev_month_visitors,  ROUND(    (ms.visitors - COALESCE(ps.prev_visitors, 0))::numeric    / NULLIF(COALESCE(ps.prev_visitors, 0), 0) * 100, 1  ) AS visitor_growth_pct,  ms.leads AS monthly_leads,  COALESCE(ps.prev_leads, 0) AS prev_month_leads,  ROUND(ms.leads::numeric / NULLIF(ms.visitors, 0) * 100, 2) AS lead_conversion_rate,  ms.engaged AS engaged_visitors,  ROUND(ms.engaged::numeric / NULLIF(ms.visitors, 0) * 100, 1) AS engagement_rate,  ms.chat_sessions AS ai_chat_sessionsFROM monthly_stats msCROSS JOIN prev_month_stats ps;`#

## 12.4.3 Portfolio Health ScoreA composite score (0���100) calculated monthly from weighted sub-scores:| Component | Weight | Metric | Scoring |

|-----------|--------|--------|---------|
| **Traffic Health** | 20% | MAV vs. target (1,000) | `MIN(MAV / 1000, 1) ��� 100` |
| **Growth Health** | 15% | MoM visitor growth | `MIN(growth_pct / 20, 1) ��� 100` |
| **Conversion Health** | 20% | Lead conversion rate vs. 3% target | `MIN(conversion_pct / 3, 1) ��� 100` |
| **Engagement Health** | 15% | Engagement rate vs. 60% target | `MIN(engagement / 60, 1) ��� 100` |
| **SEO Health** | 10% | Organic share vs. 30% target | `MIN(organic_pct / 30, 1) ��� 100` |
| **Performance Health** | 10% | CWV pass rate vs. 90% target | `MIN(cwv_pass_pct / 90, 1) ��� 100` |
| **AI Health** | 5% | Budget utilization (inverse) | `MAX(1 - monthly_cost / 10, 0) ��� 100` |
| **Reliability Health** | 5% | Uptime across services | `MIN(uptime_pct / 99.5, 1) ��� 100` |`sql-- Portfolio Health ScoreWITH components AS (  SELECT    LEAST(COUNT(DISTINCT session_id)::numeric / 1000.0, 1.0) * 20 AS traffic_health,    LEAST(      (COUNT(DISTINCT session_id) FILTER (WHERE timestamp >= NOW() - INTERVAL '30 days'))::numeric      / NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE timestamp >= NOW() - INTERVAL '60 days' AND timestamp < NOW() - INTERVAL '30 days'), 0)      / 1.2, 1.0    ) * 15 AS growth_health,    LEAST(      (COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'lead_created'))::numeric      / NULLIF(COUNT(DISTINCT session_id), 0) * 100 / 3.0, 1.0    ) * 20 AS conversion_health  FROM analytics_events  WHERE timestamp >= NOW() - INTERVAL '30 days')SELECT  ROUND(traffic_health + growth_health + conversion_health, 1) AS health_scoreFROM components;`

## 12.5 Executive Dashboard Widgets| Widget | Type | Data Source | Refresh |

|--------|------|-------------|---------|
| **KPI Row (8 cards)** | StatCard row with color coding | ���12.4.1 | Daily |
| **Portfolio Health Score** | Gauge (0-100) with component breakdown | ���12.4.3 | Monthly |
| **Visitor Trend (12 months)** | TimeSeriesChart with YoY overlay | Umami API | Monthly |
| **Lead Funnel Overview** | Mini FunnelChart (4 stages) | ���12.4.2 | Weekly |
| **Traffic Source Mix** | PieChart | Umami | Weekly |
| **Conversion Trend** | TimeSeriesChart (monthly lead rate) | ���12.4.2 | Monthly |
| **Budget Utilization** | HorizontalBarChart (per service) | Multiple sources | Monthly |
| **Executive Summary** | AI-generated narrative | All sources | Monthly report |

## 12.6 Executive Alert Rules| Rule ID | Condition | Severity | Channel | Runbook |

|---------|-----------|----------|---------|---------|
| EXEC-ALR-001 | Monthly visitors < 500 for 30 consecutive days | ?? High | Telegram + Email | Review traffic acquisition, SEO, content strategy |
| EXEC-ALR-002 | Lead conversion rate < 1.5% for 30 days | ?? High | Telegram | Review lead capture funnels, CTAs, chat agent |
| EXEC-ALR-003 | Bounce rate > 60% for 7 consecutive days | ?? Warning | Telegram | Check page load speed, content relevance |
| EXEC-ALR-004 | Portfolio Health Score drops below 50 | ?? Critical | Telegram + Email | Full portfolio review, RCA |
| EXEC-ALR-005 | Zero leads for 7 days | ?? High | Telegram | Full pipeline investigation |
| EXEC-ALR-006 | Monthly cost > 80% of budget for any service | ?? Warning | Email | Review usage, optimize |
| EXEC-ALR-007 | Engagement rate < 40% for 7 days | ?? Warning | Telegram | Review UX, content layout |---

## 13.

Data Quality Monitoring

## 13.1 Data Quality Dimensions| Dimension | Definition | Target | Measurement |

|-----------|------------|--------|-------------|
| **Completeness** | All expected events are being received | > 99% | Expected vs. actual event count |
| **Validity** | Events conform to their schema | 100% | Schema validation pass rate |
| **Timeliness** | Events arrive within acceptable latency | < 5s P95 for critical, < 60s for batch | Event timestamp vs. received timestamp |
| **Uniqueness** | No duplicate events | > 99.9% | Duplicate detection by event_id |
| **Consistency** | Same event across sources matches | 100% | Cross-source property comparison |

## 13.2 Monitoring Dashboards#

## 13.2.1 Data Quality Dashboard| Widget | Metric | Tool | Refresh |

|--------|--------|------|---------|
| **Event Volume** | Events per hour by domain | Custom DB | 5 min |
| **Schema Compliance Rate** | % of events passing validation | Custom DB + Sentry | 15 min |
| **Failed Validations** | Count of schema violations in last 24h | Sentry | 5 min |
| **Duplicate Event Rate** | % of events with duplicate event_id | Custom DB | 1h |
| **Event Latency P95** | Time between event timestamp and ingestion | Custom DB | 5 min |
| **Missing Events** | Expected events not seen in last 24h | Custom DB | 1h |
| **Budget Utilization** | % of 1M/month event ceiling used | Custom DB | 1h |#

## 13.2.2 Alert Rules| Alert | Condition | Severity | Channel | Runbook |

|-------|-----------|----------|---------|---------|
| **Schema compliance drop** | < 99% valid events in 1h | ?? Critical | Telegram | Investigate recent deploys |
| **Missing events** | Expected event not seen for 24h | ?? Warning | Telegram | Check source service |
| **Duplicate spike** | > 1% duplicate events in 1h | ?? Warning | Telegram | Check emit logic |
| **Latency spike** | P95 latency > 30s for 5 min | ?? Warning | Telegram | Check event pipeline |
| **Budget threshold** | > 80% of monthly budget used | ?? Warning | Email | Review + optimize events |
| **Budget critical** | > 95% of monthly budget used | ?? Critical | Telegram | Disable non-critical events |
| **No events from source** | 0 events from a source in 1h | ?? Warning | Telegram | Check source health |

## 13.3 Data Quality Checks (Scheduled)| Check | Frequency | SQL/Script | Owner |

|-------|-----------|-----------|-------|
| **Event completeness** | Every 6h | Count events by type vs. expected per time bucket | Data Steward |
| **Schema drift detection** | Daily | Compare last 24h events against current Zod schemas | DevOps Lead |
| **Duplicate cleanup** | Daily | `SELECT event_id, COUNT(*) FROM analytics_events GROUP BY event_id HAVING COUNT(*) > 1` | Data Steward |
| **Budget forecast** | Daily | `SELECT SUM(estimated_cost) FROM events_last_30d` ��� projection | Product Owner |
| **Property distribution** | Weekly | For each event, check property value distributions for anomalies | Data Steward |
| **Source health** | Every 6h | Check last event timestamp from web, api, ai sources | DevOps Lead |

## 13.4 Data Quality Scorecard| Score | Criteria | Action |

|-------|----------|--------|
| **A (95-100%)** | All dimensions meet or exceed targets | No action |
| **B (80-94%)** | One dimension below target | Investigation within 48h |
| **C (60-79%)** | Two+ dimensions below target | P1 incident ��� fix within 24h |
| **D (< 60%)** | Any dimension critically below target | P0 incident ��� immediate fix, rollback if needed |---

## 14.

Dashboard Implementation

## 14.1 Dashboard InventoryRefer to `AnalyticsArchitecture.md` ���15 for **widget-level specifications** for all 4 dashboards.

| This section covers implementation details only.                                                                                                             | Dashboard                                                   | Route                                     | Data Sources         | Refresh                                                              | Implementation |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ----------------------------------------- | -------------------- | -------------------------------------------------------------------- | -------------- |
| **Overview Dashboard**                                                                                                                                       | `/admin`                                                    | Umami + PostHog + Custom DB + Vercel      | Real-time            | `AdminArchitecture.md` ���1.2 + `AdminDashboardArchitecture.md` ���5 |
| **Analytics Dashboard**                                                                                                                                      | `/admin/analytics`                                          | PostHog + Custom DB + Umami               | Real-time            | `AdminDashboardArchitecture.md` ���5 (Analytics Dashboard)           |
| **AI Dashboard**                                                                                                                                             | `/admin/ai`                                                 | Custom DB + PostHog                       | Daily                | `17-AI_INSTRUCTIONS.md` ���18                                        |
| **Performance Dashboard**                                                                                                                                    | `/admin/performance`                                        | Vercel Analytics + Sentry + Custom DB     | Per-deploy           | `AdminDashboardArchitecture.md` ���10 (Performance Dashboard)        |
| ## 14.2 Shared Dashboard ComponentsAll dashboards share these components from the design system (`08a-DESIGN-SYSTEM-EXTENDED.md` and `ComponentLibrary.md`): | Component                                                   | Props                                     | Used In              |
| -----------                                                                                                                                                  | -------                                                     | ---------                                 |
| **StatCard**                                                                                                                                                 | `title`, `value`, `change`, `changeType`, `icon`, `tooltip` | All dashboards                            |
| **TimeSeriesChart**                                                                                                                                          | `data`, `xKey`, `yKey`, `color`, `height`, `showLegend`     | All dashboards                            |
| **BarChart**                                                                                                                                                 | `data`, `xKey`, `yKey`, `color`, `orientation`              | Analytics, AI                             |
| **PieChart**                                                                                                                                                 | `data`, `nameKey`, `valueKey`, `colors`                     | Analytics                                 |
| **DataTable**                                                                                                                                                | `columns`, `data`, `sortable`, `filterable`, `pageSize`     | Analytics, Lead                           |
| **DateRangePicker**                                                                                                                                          | `presets`, `onChange`, `defaultPreset`                      | All dashboards                            |
| **KpiRow**                                                                                                                                                   | `items: StatCard[]`, `columns`                              | All dashboards                            |
| **MetricCard**                                                                                                                                               | `title`, `value`, `goal`, `sparklineData`                   | Performance                               |
| **FunnelChart**                                                                                                                                              | `stages`, `valueKey`, `color`, `showPercentages`            | Analytics                                 |
| **MapChart**                                                                                                                                                 | `data`, `regionKey`, `valueKey`                             | Analytics (Visitor Intelligence)          |
| ## 14.3 Date Preset StandardsPer `AdminDashboardArchitecture.md` ���2.1, all dashboards support:                                                             | Preset                                                      | Duration                                  | Granularity          | Use Case                                                             |
| --------                                                                                                                                                     | ----------                                                  | -------------                             | ----------           |
| **Last 24h**                                                                                                                                                 | 24 hours                                                    | Hourly                                    | Real-time monitoring |
| **Last 7 days**                                                                                                                                              | 7 days                                                      | Daily                                     | Weekly trends        |
| **Last 30 days**                                                                                                                                             | 30 days                                                     | Daily                                     | Monthly reporting    |
| **Last 90 days**                                                                                                                                             | 90 days                                                     | Weekly                                    | Quarterly analysis   |
| **Custom range**                                                                                                                                             | User-defined                                                | Auto                                      | Ad-hoc analysis      |
| **Compare with previous**                                                                                                                                    | Same range offset                                           | Same                                      | Period-over-period   |
| ## 14.4 Loading, Empty & Error StatesPer `AnalyticsArchitecture.md` ���18.3 (Phase 6 checklist) and `AdminArchitecture.md`:                                  | State                                                       | Component                                 | Behavior             |
| -------                                                                                                                                                      | -----------                                                 | ----------                                |
| **Loading**                                                                                                                                                  | Skeleton component per widget type                          | Show shimmer animation, 300ms min display |
| **Empty**                                                                                                                                                    | `EmptyState` component                                      | Show "No data available" with icon + CTA  |
| **Error**                                                                                                                                                    | `ErrorState` component                                      | Show error message + retry button         |
| **Partial data**                                                                                                                                             | Data with missing series                                    | Show available data + warning indicator   |
| **Stale data**                                                                                                                                               | Last updated timestamp                                      | Show "Data from [time]" + refresh button  |

## 14.5 Dashboard API IntegrationAnalytics API endpoints are defined in `12-API.md` and `44-API-STANDARDS.md`.

## Implementation pattern:`typescript// apps/web/src/hooks/useAnalyticsDashboard.tsimport { useQuery } from '@tanstack/react-query';import { analyticsApi } from '@/lib/api/analytics';export function useAnalyticsDashboard(dateRange: DateRange) {  return useQuery({    queryKey: ['analytics', 'dashboard', dateRange],    queryFn: () => analyticsApi.getDashboardData(dateRange),    staleTime: 5 * 60 * 1000, // 5 min cache    retry: 2,    refetchOnWindowFocus: false,  });}`

## 15.

Enterprise Governance

## 15.1 Ownership Model| Role | Person/Team | Responsibilities |

|------|------------|-----------------|
| **Product Owner** | PO | Owns tracking plan process, approves all new events, reviews data quality scorecard monthly |
| **Data Steward** | Assigned engineer | Monitors data quality, runs weekly checks, investigates anomalies |
| **DevOps Lead** | DevOps | Maintains CI validation pipeline, monitors event pipeline health |
| **Compliance Officer** | PO (wearing compliance hat) | Reviews privacy implications of new events, audits PII adherence |

## 15.2 Review Cadences| Review | Frequency | Participants | Agenda |

|--------|-----------|-------------|--------|
| **Data Quality Review** | Weekly | Data Steward, DevOps Lead | Scorecard, anomalies, budget forecast |
| **Tracking Plan Triage** | Bi-weekly | PO, relevant dev | Review proposed tracking plans, approve/reject |
| **Analytics Strategy Review** | Monthly | PO, all engineers | Review metrics vs. targets, adjust tracking |
| **Privacy Audit** | Quarterly | PO, Compliance | Audit all event properties for PII, review retention |
| **Schema Registry Cleanup** | Quarterly | All engineers | Archive deprecated events, clean up stale schemas |
| **Budget Review** | Monthly | PO, DevOps Lead | Event volume trends, cost optimization |
| **Cross-Document Sync** | Per document update | Document owners | Ensure all analytics references stay in sync |

## 15.3 Cross-Document StandardsThese rules prevent duplication and drift between docs:| Rule | ID | Description |

|------|----|-------------|
| **Events defined once** | GOV-001 | Every event is defined in exactly one schema in `packages/shared/src/schemas/analytics.ts`.
No event is defined in multiple Zod files. |
| **Strategy vs. implementation** | GOV-002 | `AnalyticsArchitecture.md` owns the **strategy** (what and why).
This document owns the **implementation** (how).
Never duplicate event definitions between both. |
| **Domain events separate** | GOV-003 | Backend domain events (`lead.created`, `user.logged_in`) live in `46-EVENT-ARCHITECTURE.md`.
Analytics events (`lead_converted`, `lead_qualified`) live here.
If an event is both a domain event AND an analytics event, define it in `46-EVENT-ARCHITECTURE.md` and reference it here (���2.5.4). |
| **Dashboard specs in strategy** | GOV-004 | Dashboard widget-level specifications are in `AnalyticsArchitecture.md` ���15.
Implementation details (components, hooks, API calls) are in ���14 of this document. |
| **Zod is source of truth** | GOV-005 | The Zod schemas in `packages/shared/src/schemas/analytics.ts` are the **executable truth**.
This documents registry (���2) and `AnalyticsArchitecture.md` is event catalog (���16) are human-readable mirrors.
Any discrepancy means the Zod schemas win. |
| **CI checks are mandatory** | GOV-006 | No analytics event can be merged to `main` without passing all CI validation steps (���3.4).
Exceptions require PO approval. |
| **Tracking plan before code** | GOV-007 | No analytics event can be implemented before its tracking plan (���4.3) is approved.
The tracking plan PR must be merged before the implementation PR. |
| **Post-merge monitoring** | GOV-008 | Every new event enters a 7-day monitoring period after deploy.
If data quality drops below B-grade (���13.4), the event is rolled back or fixed. |

## 15.4 Deprecation Policy| Stage | Action | Duration |

|-------|--------|----------|
| **Deprecate** | Mark event as `deprecated` in registry, stop emitting in new code | Day 0 |
| **Grace period** | Existing emissions continue; no removal yet | 30 days |
| **Archive** | Remove from active schemas, move to `archive/` in registry | Day 31 |
| **Delete data** | Purge from production DB (if custom); PostHog retains per retention policy | Day 60 |

## 15.5 Training & Onboarding| Resource | Audience | Content |

|----------|----------|---------|
| **Tracking Plan Workshop** | All developers | How to write a tracking plan, the review process, common pitfalls |
| **Schema Registry Walkthrough** | New engineers | How to add a new event schema, how Zod validation works |
| **Data Quality Review** | Data stewards | How to run quality checks, interpret scorecard, investigate issues |
| **Privacy Compliance** | All developers | What PII looks like, what not to log, GDPR/CCPA basics |---

## 17.

| Decision Log | Decision ID | Date                                                                                   | Decision                                                        | Rationale                                                               | Alternatives Considered | Outcome |
| ------------ | ----------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- | ------- |
| D-AI-001     | Jun 2026    | Event Schema Registry with mandatory `event_name`, `properties`, `timestamp` structure | Ensures queryable, consistent events across 12 domains          | Free-form properties rejected ��� would break cross-domain analysis     | Adopted                 |
| D-AI-002     | Jun 2026    | 4-layer validation model (Schema ? Required ? Type ? Business Rule)                    | Catches errors at build time, not in production                 | Runtime-only validation rejected as too late                            | Adopted                 |
| D-AI-003     | Jun 2026    | Tracking Plan Process with PR-based approval workflow                                  | Brings change management rigor to analytics                     | Ad-hoc event creation rejected for causing schema drift                 | Adopted                 |
| D-AI-004     | Jun 2026    | Standardized implementation patterns per platform (Browser SDK / NestJS / FastAPI)     | Reduces implementation variance and QA burden                   | Single universal emitter rejected ��� can't handle all runtime contexts | Adopted                 |
| D-AI-005     | Jun 2026    | Domain Analysis sections covering 7 analytical domains                                 | Bridges gap between raw events and actionable business insights | Pure technical reference rejected ��� doesn't serve analytics consumers | Adopted                 |

## 18.

| Risk Register | Risk ID                                                                   | Risk Description | Probability | Impact | Severity                                                                 | Mitigation Strategy                                             | Contingency   | Owner |
| ------------- | ------------------------------------------------------------------------- | ---------------- | ----------- | ------ | ------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------- | ----- |
| R-AI-001      | Event schema drift between documentation and actual implementation        | Medium           | High        | High   | Automated CI validation of emitted events against schema registry        | Quarterly manual audit, event replay from production logs       | QA Lead       |
| R-AI-002      | Validation layer causes performance regression on high-traffic pages      | Low              | High        | Medium | Async validation outside critical path, performance budget for analytics | Batch validation, sampling for high-volume events               | Frontend Lead |
| R-AI-003      | Developer non-compliance with tracking plan process                       | Medium           | Medium      | Medium | PR reviewer checklist includes analytics impact, automated linting       | Monthly training sessions, simplified event creation templates  | Product Owner |
| R-AI-004      | Data quality dashboard not maintained, leading to silent data degradation | Medium           | Medium      | Medium | Automated data quality alerts, weekly DQ scorecard review                | Manual sampling of events, quarterly deep audit                 | QA Lead       |
| R-AI-005      | Cross-domain analysis queries become too complex for business users       | Low              | Medium      | Low    | Pre-built dashboard views, query templates for common patterns           | Dedicated analytics engineering support, simplified event model | Product Owner |

## 19.

| Change Log | Version  | Date                                                                                              | Changes | Author |
| ---------- | -------- | ------------------------------------------------------------------------------------------------- | ------- | ------ |
| 2.0        | Jun 2026 | Added 7 analytical domain sections: Funnel, Lead, AI/Agent, SEO, Content, Performance, Executive. |

Renumbered ������6-9?13-16.
Cross-referenced all domain event schemas. | Product Owner| 1.0 | Jun 2026 | Initial release ��� implementation companion to `AnalyticsArchitecture.md` v4.0.
Covers: Event Schema Registry (90 events, 35 domains, 12 categories), Validation & Testing (4-layer model, CI integration), Tracking Plan Process (template + workflow), Implementation Patterns (browser SDK, NestJS module, FastAPI logger), Data Quality Monitoring (6 dimensions, dashboard, alerts, scorecard), Dashboard Implementation (4 dashboards, shared components, states), Enterprise Governance (ownership, cadences, cross-document standards, deprecation policy, training). | Product Owner |---

## 20.

| Glossary                     | Term                                                                                                                | Definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Event Schema Registry**    | A centralized catalog defining the structure, properties, and validation rules for every analytics event            |
| **Schema Validation**        | The first validation layer checking that an event's structure matches its registered schema definition              |
| **Required Validation**      | The second validation layer ensuring all mandatory properties are present in an event payload                       |
| **Type Validation**          | The third validation layer verifying property values match expected data types (string, number, boolean, object)    |
| **Business Rule Validation** | The fourth validation layer enforcing domain-specific rules (e.g., "conversion value must be > 0")                  |
| **Tracking Plan**            | A document specifying what events to track, why, and how ��� approved before implementation                         |
| **Implementation Pattern**   | A standardized code template for emitting events from a specific platform (Browser SDK, NestJS, FastAPI)            |
| **Data Quality Scorecard**   | A periodic assessment of analytics event health across completeness, accuracy, timeliness, and consistency          |
| **Domain Analysis**          | A deep-dive section connecting raw analytics events to specific business domains (leads, AI, content, etc.)         |
| **Deprecation Policy**       | Rules governing how obsolete events are phased out, including migration periods and sunset dates                    |
| **Event Naming Convention**  | The `domain_action_detail` naming pattern ensuring consistency and discoverability                                  |
| **Governance Cadence**       | The recurring schedule for analytics review, including ownership assignments and cross-document standards alignment | _Document Version: 2.0 ��� Enterprise Analytics Implementation & Domain Analysis Guide_ _Companion to `AnalyticsArchitecture.md` (v5.0)_ _Cross-References: `46-EVENT-ARCHITECTURE.md`, `50-DATA-CONTRACTS.md`, `CI-CD.md`, `TestingArchitecture.md`, `22-OBSERVABILITY.md`, `21-MONITORING.md`, `17-AI_INSTRUCTIONS.md`, `18-AGENTS.md`, `SEOArchitecture.md`, `PerformanceArchitecture.md`, `AdminDashboardArchitecture.md`, `AdminArchitecture.md`_ _Next Review Date: July 2026_ |
