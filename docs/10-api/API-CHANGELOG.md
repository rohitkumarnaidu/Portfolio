# API Changelog

This document tracks all changes to the Portfolio API. Each entry documents what changed, why, and migration impact.

## Versioning
API versions use the `Accept: application/vnd.portfolio.v{n}+json` header. Current version: `v1`.

## [v1.0.0] - 2026-06-22

### Added
- Initial API release with 50+ endpoints
- Portfolio endpoints (public, read-only):
  - `GET /api/portfolio/sections` — Section configuration
  - `GET /api/portfolio/projects` — Project listing + detail by slug
  - `GET /api/portfolio/blog` — Blog listing + detail by slug
  - `GET /api/portfolio/skills` — Skills listing
  - `GET /api/portfolio/experiences` — Work experiences
  - `GET /api/portfolio/testimonials` — Testimonials
  - `GET /api/portfolio/services` — Services listing
  - `GET /api/portfolio/faqs` — FAQ listing
  - `POST /api/portfolio/leads` — Contact form submission
  - `GET /api/portfolio/case-studies` — Case studies
  - `GET /api/portfolio/achievements` — Achievements
  - `GET /api/portfolio/press-features` — Press features
  - `GET /api/portfolio/guest-appearances` — Guest appearances
  - `GET /api/portfolio/reading-list` — Reading list
  - `GET /api/portfolio/availability-status` — Availability status
  - `GET /api/portfolio/analytics/*` — Public analytics
  - `GET /api/portfolio/chat` — Chat session
  - `POST /api/portfolio/feature-flags` — Feature flag evaluation

- Admin endpoints (authenticated CRUD):
  - `POST /api/admin/auth/*` — Authentication (login, register, refresh, profile)
  - `CRUD /api/admin/sections`
  - `CRUD /api/admin/projects`
  - `CRUD /api/admin/blog`
  - `CRUD /api/admin/skills`
  - `CRUD /api/admin/experiences`
  - `CRUD /api/admin/testimonials`
  - `CRUD /api/admin/services`
  - `CRUD /api/admin/faqs`
  - `CRUD /api/admin/leads` (with notes & activities)
  - `CRUD /api/admin/case-studies`
  - `CRUD /api/admin/achievements`
  - `CRUD /api/admin/press-features`
  - `CRUD /api/admin/guest-appearances`
  - `CRUD /api/admin/reading-list`
  - `CRUD /api/admin/availability-status`
  - `CRUD /api/admin/users` (admin management)
  - `CRUD /api/admin/media` (asset management)
  - `CRUD /api/admin/api-keys`
  - `CRUD /api/admin/feature-flags`
  - `CRUD /api/admin/system-settings`
  - `CRUD /api/admin/notifications`
  - `CRUD /api/admin/activities` (audit log)
  - `CRUD /api/admin/dashboard` (dashboard data)
  - `CRUD /api/admin/chat` (chat conversations)
  - `POST /api/admin/export/*` (data export)

- Health endpoints:
  - `GET /api/health/liveness` — Liveness probe
  - `GET /api/health/readiness` — Readiness probe

### Response Format
- Standard envelope: `{ data, meta? }`
- Error format: `{ status_code, message, error, correlation_id, timestamp }`
- Pagination: `{ data, meta: { page, limit, total, totalPages } }`

### Authentication
- Bearer JWT token in `Authorization` header
- Token obtained via `POST /api/admin/auth/login`
- Refresh via `POST /api/admin/auth/refresh`

### Rate Limiting
- Public endpoints: 30 requests/minute
- Admin endpoints: 60 requests/minute
- AI endpoints: 10 requests/minute
- Lead submission: 3 requests/minute
- Auth endpoints: 5 requests/minute

## [Unreleased]

### Added
- N/A

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- N/A

---

*For the complete API specification, see `docs/api/openapi.json` (OpenAPI 3.1, 111 endpoints).*
