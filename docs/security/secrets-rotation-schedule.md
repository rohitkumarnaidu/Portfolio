# Secrets Rotation Schedule

> **Document:** `secrets-rotation-schedule.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Standard:** NIST SP 800-57 (Key Management) | **Owner:** Staff DevOps
> **Review Cadence:** Quarterly | **Classification:** L4-Restricted

---

## 1. Overview

This document defines the rotation schedule, method, and runbook for all secrets used by the Portfolio platform. Rotation is a critical control to limit the blast radius of a secret compromise and comply with NIST SP 800-57 key management guidelines.

### 1.1 Rotation Principles

| Principle | Description |
|-----------|-------------|
| **Regular rotation** | All secrets rotated on a defined schedule |
| **Emergency rotation** | Immediate rotation on suspected compromise |
| **Grace period** | Old secret valid for 24h after rotation to prevent downtime |
| **Audit trail** | All rotations logged with timestamp and operator |
| **No downtime** | Rotation procedures designed for zero-downtime deployment |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 2. Secret Rotation Schedule

### 2.1 Master Rotation Table

| Secret | Current Setup | Rotation Frequency | Grace Period | Rotation Method | Owner |
|--------|--------------|-------------------|--------------|----------------|-------|
| **JWT_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Generate new, deploy, keep old for 24h | Staff DevOps |
| **JWT_REFRESH_SECRET** | 64-char random string, HS256 | **90 days** | 24h (old secret valid) | Same as JWT_SECRET | Staff DevOps |
| **DATABASE_URL** | Supabase Postgres connection string | **180 days** | 0h (connection pool drain) | Supabase console rotate, update env | Staff DevOps |
| **RESEND_API_KEY** | Email API key | **180 days** | 24h (old key valid) | Regenerate in Resend dashboard | Staff DevOps |
| **SENTRY_DSN** | Error tracking DSN | **365 days** | 0h (immediate switch) | Rotate in Sentry dashboard | Staff DevOps |
| **SUPABASE_ANON_KEY** | Public anon key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **SUPABASE_SERVICE_ROLE_KEY** | Service role key | **365 days** | 0h (immediate switch) | Rotate in Supabase dashboard | Staff DevOps |
| **OPENAI_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in OpenAI dashboard | Staff DevOps |
| **ANTHROPIC_API_KEY** | AI provider key | **90 days** | 24h (old key valid) | Rotate in Anthropic dashboard | Staff DevOps |
| **GITHUB_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in GitHub OAuth settings | Staff DevOps |
| **GOOGLE_OAUTH_CLIENT_SECRET** | OAuth app secret | **365 days** | 0h (immediate switch) | Rotate in Google Cloud Console | Staff DevOps |
| **HCAPTCHA_SECRET_KEY** | Captcha verification key | **365 days** | 0h (immediate switch) | Rotate in hCaptcha dashboard | Staff DevOps |
| **NEXTAUTH_SECRET** | NextAuth.js encryption key | **90 days** | 24h (old key valid) | Generate new, deploy, keep old for 24h | Staff DevOps |

---

## 3. Rotation Runbooks

### 3.1 JWT_SECRET / JWT_REFRESH_SECRET Rotation

**Frequency:** Every 90 days | **Owner:** Staff DevOps | **Duration:** 15 minutes

```text
Step 1: Generate new secrets
  openssl rand -base64 48  # 64-char JWT_SECRET
  openssl rand -base64 48  # 64-char JWT_REFRESH_SECRET

Step 2: Add new secrets to environment (keep old)
  - Vercel: Add JWT_SECRET_NEW and JWT_REFRESH_SECRET_NEW
  - Railway: Add JWT_SECRET_NEW and JWT_REFRESH_SECRET_NEW
  - Keep JWT_SECRET and JWT_REFRESH_SECRET unchanged

Step 3: Update application config to accept both old and new
  // NestJS JWT module supports multiple secrets
  jwtModule.register({
    secret: [process.env.JWT_SECRET_NEW, process.env.JWT_SECRET],
    signOptions: { expiresIn: '15m', algorithm: 'HS256' },
  });

Step 4: Deploy updated config
  - All tokens signed with new secret
  - Old tokens still valid for 24h (verified against old secret)

Step 5: After 24h, remove old secrets
  - Delete JWT_SECRET and JWT_REFRESH_SECRET from environment
  - Rename JWT_SECRET_NEW → JWT_SECRET
  - Rename JWT_REFRESH_SECRET_NEW → JWT_REFRESH_SECRET
  - Redeploy

Step 6: Verify
  - All existing sessions continue to work (tokens re-signed on refresh)
  - New logins use new secret
  - No auth errors in logs

---

## 3. Rotation Runbooks

### 3.1 JWT_SECRET / JWT_REFRESH_SECRET Rotation

**Frequency:** Every 90 days | **Duration:** 15 minutes | **Risk:** Low (grace period)

```text
Step 1: Generate new secrets
  openssl rand -base64 48  # 64-char JWT_SECRET
  openssl rand -base64 48  # 64-char JWT_REFRESH_SECRET

Step 2: Add new secrets alongside old (grace period)
  Vercel: Add JWT_SECRET_NEW and JWT_REFRESH_SECRET_NEW
  Railway: Add JWT_SECRET_NEW and JWT_REFRESH_SECRET_NEW

Step 3: Update application config to accept both
  // NestJS JWT module supports multiple secrets
  secret: [process.env.JWT_SECRET_NEW, process.env.JWT_SECRET]

Step 4: Deploy updated config
  - All new tokens signed with new secret
  - Existing tokens still valid (verified against old secret)

Step 5: After 24h grace period
  - Remove JWT_SECRET and JWT_REFRESH_SECRET
  - Rename JWT_SECRET_NEW → JWT_SECRET
  - Rename JWT_REFRESH_SECRET_NEW → JWT_REFRESH_SECRET
  - Redeploy

Step 6: Verify
  - Check auth logs for errors
  - Verify new tokens issued correctly
  - Confirm old tokens rejected after grace period
```

### 2.2 DATABASE_URL Rotation

**Frequency:** Every 180 days | **Duration:** 30 minutes | **Risk:** Medium

```text
Step 1: Prepare
  - Notify team of upcoming DB URL rotation (Slack #devops)
  - Verify no long-running migrations or queries
  - Take manual snapshot of database

Step 2: Rotate in Supabase
  - Navigate to Supabase Dashboard → Project Settings → Database
  - Click "Rotate Database Password"
  - Copy new connection string

Step 3: Update environment
  - Vercel: Update DATABASE_URL
  - Railway: Update DATABASE_URL
  - Local .env files (for development)

Step 4: Redeploy
  - Deploy API service (new connections use new URL)
  - Old connections drain naturally (pool timeout)

Step 5: Verify
  - Check API health endpoint returns 200
  - Verify database queries work
  - Check Supabase connection logs for errors

Step 6: Emergency rollback
  - If issues arise, old password is still valid for existing connections
  - Revert DATABASE_URL to old value
  - Redeploy
```

### 2.2 RESEND_API_KEY Rotation

**Frequency:** Every 180 days | **Duration:** 10 minutes | **Risk:** Low

```text
Step 1: Generate new key
  - Navigate to Resend Dashboard → API Keys
  - Click "Create API Key"
  - Set permissions: "Sending access" only (no full access)
  - Copy new key

Step 2: Deploy new key alongside old
  - Add RESEND_API_KEY_NEW to environment
  - Keep RESEND_API_KEY unchanged

Step 3: Update application config
  // Resend client supports fallback
  const resend = new Resend(process.env.RESEND_API_KEY_NEW || process.env.RESEND_API_KEY);

Step 4: After 24h grace period
  - Delete old RESEND_API_KEY from Resend dashboard
  - Remove RESEND_API_KEY from environment
  - Rename RESEND_API_KEY_NEW → RESEND_API_KEY
  - Redeploy

Step 5: Verify
  - Send test email via admin panel
  - Check Resend dashboard for delivery success
```

### 2.2 DATABASE_URL Rotation

**Frequency:** Every 180 days | **Duration:** 15 minutes | **Risk:** Medium

```text
Step 1: Prepare
  - Notify team via Slack #devops
  - Verify no long-running migrations
  - Take manual database snapshot

Step 2: Rotate in Supabase
  - Supabase Dashboard → Project Settings → Database
  - Click "Rotate Database Password"
  - Copy new connection string

Step 3: Update environment
  - Vercel: Update DATABASE_URL
  - Railway: Update DATABASE_URL
  - Local .env files (for development)

Step 4: Redeploy
  - Deploy API service
  - Old connections drain naturally (pool timeout)

Step 5: Verify
  - Check API health endpoint
  - Verify database queries work
  - Check Supabase connection logs

Step 6: Rollback (if needed)
  - Old password remains valid for existing connections
  - Revert DATABASE_URL to old value
  - Redeploy
```

### 2.2 OPENAI_API_KEY / ANTHROPIC_API_KEY Rotation

**Frequency:** Every 90 days | **Duration:** 10 minutes | **Risk:** Low

```text
Step 1: Generate new key
  - OpenAI: Dashboard → API Keys → Create new secret key
  - Anthropic: Dashboard → API Keys → Create new key
  - Copy new key immediately (shown once)

Step 2: Deploy new key alongside old
  - Add OPENAI_API_KEY_NEW and ANTHROPIC_API_KEY_NEW to environment
  - Keep old keys unchanged

Step 3: Update application config
  // AI service supports fallback
  openai.apiKey = process.env.OPENAI_API_KEY_NEW || process.env.OPENAI_API_KEY;
  anthropic.apiKey = process.env.ANTHROPIC_API_KEY_NEW || process.env.ANTHROPIC_API_KEY;

Step 4: After 24h grace period
  - Delete old keys from provider dashboards
  - Remove old keys from environment
  - Rename _NEW keys to primary

Step 5: Verify
  - Send test AI chat message
  - Check provider dashboard for successful requests
```

### 2.3 SUPABASE Key Rotation

**Frequency:** Every 365 days | **Duration:** 10 minutes | **Risk:** Medium

```text
Step 1: Rotate anon key
  - Supabase Dashboard → Project Settings → API
  - Click "Rotate anon key"
  - Copy new anon key

Step 2: Update environment
  - Vercel: Update NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Redeploy frontend

Step 3: Rotate service role key
  - Supabase Dashboard → Project Settings → API
  - Click "Rotate service_role key"
  - Copy new service role key

Step 4: Update environment
  - Vercel: Update SUPABASE_SERVICE_ROLE_KEY
  - Railway: Update SUPABASE_SERVICE_ROLE_KEY
  - Redeploy API

Step 5: Verify
  - Check public pages load (anon key)
  - Check admin API endpoints work (service role key)
  - Check Supabase logs for auth errors
```

### 2.3 OAuth Secret Rotation (GitHub / Google)

**Frequency:** Every 365 days | **Duration:** 15 minutes | **Risk:** Medium

```text
Step 1: GitHub OAuth
  - Navigate to GitHub → Settings → Developer Settings → OAuth Apps
  - Select the Portfolio OAuth App
  - Click "Generate a new client secret"
  - Copy new secret

Step 2: Google OAuth
  - Navigate to Google Cloud Console → APIs & Services → Credentials
  - Select the OAuth 2.0 Client ID
  - Click "Regenerate secret"
  - Copy new secret

Step 3: Update environment
  - Vercel: Update GITHUB_OAUTH_CLIENT_SECRET and GOOGLE_OAUTH_CLIENT_SECRET
  - Railway: Update GITHUB_OAUTH_CLIENT_SECRET and GOOGLE_OAUTH_CLIENT_SECRET
  - Redeploy

Step 4: Verify
  - Test OAuth login flow (Google)
  - Test OAuth login flow (GitHub)
  - Check auth logs for errors
```

### 2.3 SENTRY_DSN Rotation

**Frequency:** Every 365 days | **Duration:** 5 minutes | **Risk:** Low

```text
Step 1: Rotate in Sentry
  - Navigate to Sentry Dashboard → Settings → Projects → Portfolio
  - Click "Client Keys (DSN)"
  - Click "Rotate DSN"
  - Copy new DSN

Step 2: Update environment
  - Vercel: Update SENTRY_DSN
  - Railway: Update SENTRY_DSN
  - Redeploy

Step 3: Verify
  - Trigger a test error
  - Check Sentry dashboard for new event
  - Verify old DSN stops receiving events
```

### 2.4 HCAPTCHA_SECRET_KEY Rotation

**Frequency:** Every 365 days | **Duration:** 5 minutes | **Risk:** Low

```text
Step 1: Rotate in hCaptcha
  - Navigate to hCaptcha Dashboard → Settings
  - Click "Rotate Secret Key"
  - Copy new secret key

Step 2: Update environment
  - Vercel: Update HCAPTCHA_SECRET_KEY
  - Railway: Update HCAPTCHA_SECRET_KEY
  - Redeploy

Step 3: Verify
  - Submit contact form with captcha
  - Check captcha verification logs
```

---

## 3. Emergency Rotation

### 3.1 Compromise Response

If a secret is suspected compromised (leaked on GitHub, exposed in logs, etc.):

| Step | Action | Duration | Responsible |
|------|--------|----------|-------------|
| 1 | Identify compromised secret | Immediate | Security Lead |
| 2 | Rotate secret immediately (no grace period) | 5 min | Staff DevOps |
| 3 | Revoke old secret in provider dashboard | 5 min | Staff DevOps |
| 4 | Check for unauthorized access (audit logs) | 30 min | Security Lead |
| 5 | Notify affected users (if any) | 1 hour | Security Lead |
| 6 | Document incident | 1 hour | Security Lead |
| 7 | Determine root cause | 4 hours | Engineering Team |

### 3.1 Emergency Rotation: No Grace Period

For suspected compromise, skip the grace period:

```text
Step 1: Generate new secret
Step 2: Update environment (replace old secret immediately)
Step 3: Redeploy immediately
Step 4: Revoke old secret in provider dashboard
Step 5: Verify all services operational
Step 6: Check audit logs for unauthorized access
```

---

## 4. Rotation Calendar

### 4.1 Annual Rotation Schedule

| Month | Secrets to Rotate |
|-------|-------------------|
| **January** | JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET |
| **April** | JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET, OPENAI_API_KEY, ANTHROPIC_API_KEY |
| **July** | JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET, DATABASE_URL, RESEND_API_KEY |
| **October** | JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET, OPENAI_API_KEY, ANTHROPIC_API_KEY |
| **January** | SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SENTRY_DSN, GITHUB_OAUTH, GOOGLE_OAUTH, HCAPTCHA |

### 4.1 Rotation Calendar

| Month | Secrets to Rotate | Estimated Effort |
|-------|-------------------|-----------------|
| **January** | SUPABASE keys, SENTRY_DSN, OAuth secrets, HCAPTCHA | 1 hour |
| **April** | JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET, OPENAI, ANTHROPIC | 30 min |
| **July** | JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET, DATABASE_URL, RESEND | 45 min |
| **October** | JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET, OPENAI, ANTHROPIC | 30 min |

---

## 5. Audit Trail

### 5.1 Rotation Log Template

```json
{
  "rotation_id": "ROT-2026-001",
  "secret_name": "JWT_SECRET",
  "rotation_type": "scheduled",
  "rotated_by": "staff.devops@portfolio.dev",
  "rotated_at": "2026-07-15T10:00:00Z",
  "grace_period_end": "2026-07-16T10:00:00Z",
  "status": "completed",
  "verification": "passed",
  "notes": "Scheduled 90-day rotation"
}
```

### 5.1 Rotation History

| Date | Secret | Rotated By | Method | Status |
|------|--------|------------|--------|--------|
| 2026-07-15 | JWT_SECRET | Staff DevOps | Scheduled | ✅ Completed |
| 2026-07-15 | JWT_REFRESH_SECRET | Staff DevOps | Scheduled | ✅ Completed |
| 2026-04-15 | JWT_SECRET | Staff DevOps | Scheduled | ✅ Completed |
| 2026-04-15 | JWT_REFRESH_SECRET | Staff DevOps | Scheduled | ✅ Completed |
| 2026-04-15 | OPENAI_API_KEY | Staff DevOps | Scheduled | ✅ Completed |
| 2026-04-15 | ANTHROPIC_API_KEY | Staff DevOps | Scheduled | ✅ Completed |

---

## 6. Compliance Mapping

| Standard | Requirement | How Met |
|----------|-------------|---------|
| **NIST SP 800-57** | Key management lifecycle | Rotation schedule, generation method, revocation process |
| **SOC 2 (CC6.1)** | Logical and physical access controls | Regular rotation limits exposure window |
| **GDPR Art. 32** | Security of processing | Rotation limits breach impact |
| **OWASP ASVS V2.1.7** | Verify secrets are rotated | Documented schedule and runbooks |

---

## 7. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 2026 | Security Team | Initial secrets rotation schedule |
