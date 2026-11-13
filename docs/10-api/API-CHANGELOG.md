# API Changelog

This document tracks all changes to the Portfolio API. Each entry documents what changed, why, and migration impact.

## Versioning

API versions use the `Accept: application/vnd.portfolio.v{n}+json` header. Current version: `v1`.

## [v1.0.0] - 2026-06-22

### Added

- Initial API release with 50+ endpoints
- Portfolio endpoints (public, read-only):
  - `GET /api/portfolio/sections` Ã¢â‚¬â€ Section configuration
  - `GET /api/portfolio/projects` Ã¢â‚¬â€ Project listing + detail by slug
  - `GET /api/portfolio/blog` Ã¢â‚¬â€ Blog listing + detail by slug
  - `GET /api/portfolio/skills` Ã¢â‚¬â€ Skills listing
  - `GET /api/portfolio/experiences` Ã¢â‚¬â€ Work experiences
  - `GET /api/portfolio/testimonials` Ã¢â‚¬â€ Testimonials
  - `GET /api/portfolio/services` Ã¢â‚¬â€ Services listing
  - `GET /api/portfolio/faqs` Ã¢â‚¬â€ FAQ listing
  - `POST /api/portfolio/leads` Ã¢â‚¬â€ Contact form submission
  - `GET /api/portfolio/case-studies` Ã¢â‚¬â€ Case studies
  - `GET /api/portfolio/achievements` Ã¢â‚¬â€ Achievements
  - `GET /api/portfolio/press-features` Ã¢â‚¬â€ Press features
  - `GET /api/portfolio/guest-appearances` Ã¢â‚¬â€ Guest appearances
  - `GET /api/portfolio/reading-list` Ã¢â‚¬â€ Reading list
  - `GET /api/portfolio/availability-status` Ã¢â‚¬â€ Availability status
  - `GET /api/portfolio/analytics/*` Ã¢â‚¬â€ Public analytics
  - `GET /api/portfolio/chat` Ã¢â‚¬â€ Chat session
  - `POST /api/portfolio/feature-flags` Ã¢â‚¬â€ Feature flag evaluation

- Admin endpoints (authenticated CRUD):
  - `POST /api/admin/auth/*` Ã¢â‚¬â€ Authentication (login, register, refresh, profile)
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
  - `GET /api/health/liveness` Ã¢â‚¬â€ Liveness probe
  - `GET /api/health/readiness` Ã¢â‚¬â€ Readiness probe

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

_For the complete API specification, see `docs/10-api/openapi.json` (OpenAPI 3.1, 111 endpoints)._

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
