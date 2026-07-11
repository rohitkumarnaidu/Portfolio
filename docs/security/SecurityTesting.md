# Security Testing Strategy

## 1. Overview
As an enterprise application managing a portfolio, AI interactions, and an admin backend, security is a primary concern. Our architecture spans Next.js, NestJS, FastAPI, and Supabase Postgres.

## 2. Security Boundaries & Architecture
- **Web Layer (Next.js)**: CSRF protection, Content Security Policy (CSP), secure cookie handling.
- **API Layer (NestJS)**: Rate limiting, input validation, JWT verification, role-based access control (RBAC).
- **AI Layer (FastAPI)**: Prompt injection defense, output sanitization.
- **Database (Supabase)**: Row-Level Security (RLS) policies, network isolation.

## 3. Automated Security Scanning
- **Static Application Security Testing (SAST)**:
  - GitHub Advanced Security / CodeQL runs on every PR to detect vulnerabilities in our TypeScript and Python code.
  - Snyk or npm audit is used to check for vulnerable dependencies in `package.json` and `requirements.txt`.
- **Dynamic Application Security Testing (DAST)**:
  - Automated scans against the preview environments to check for common OWASP Top 10 vulnerabilities (XSS, SQLi).

## 4. Specific Security Testing Focus Areas

### 4.1 Authentication & Authorization
- Verify JWT signing algorithms (HS256/RS256) and expiration logic.
- Test NestJS `@Roles('admin')` guards. Ensure non-admin users receive 403 Forbidden on restricted endpoints.
- Test Supabase RLS policies directly by attempting to read/write unauthorized records using different test tokens.

### 4.2 API Security (NestJS & FastAPI)
- **Input Validation**: Ensure the global `ValidationPipe` in NestJS strictly forbids non-whitelisted properties (`whitelist: true`, `forbidNonWhitelisted: true`).
- **Rate Limiting**: Verify `ThrottlerGuard` successfully blocks brute-force and DoS attempts on public portfolio endpoints and the AI service.
- **CORS**: Verify `CORS_ORIGIN` configuration prevents unauthorized domains from accessing the API.

### 4.3 AI Security (LLM Vulnerabilities)
- **Prompt Injection**: Test the FastAPI service with malicious prompts designed to leak system instructions or bypass safety filters.
- **Data Exfiltration**: Ensure the RAG pipeline restricts vector searches (pgvector) based on user authorization, preventing unauthorized access to private documents.

## 5. Secrets Management
- All secrets (DATABASE_URL, JWT_SECRET, OPENAI_API_KEY) are managed via a centralized vault (e.g., Vercel Env Vars, Doppler) and are never committed to the repo.
- Pre-commit hooks (e.g., `git-secrets` or `trufflehog`) scan for accidentally committed credentials.
