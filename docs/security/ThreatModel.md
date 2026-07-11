# Threat Model

## 1. Introduction
This document details the threat model for the Ultimate Portfolio project. We utilize the STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) to identify, categorize, and mitigate potential security threats.

## 2. System Boundaries and Actors
**Actors:**
- **Public User:** Unauthenticated visitors viewing the portfolio and interacting with the AI chat.
- **Admin:** Authenticated user with full access to the admin dashboard to manage content and configurations.
- **Malicious Actor:** External entity attempting to compromise the system.
- **Internal Services:** The interaction between the Next.js frontend, NestJS backend, and FastAPI AI service.

## 3. STRIDE Threat Analysis

### 3.1 Spoofing (Authenticity)
**Threat:** An attacker attempts to impersonate an Admin to access the dashboard or modify portfolio content.
**Mitigation:**
- Implement strong multi-factor authentication (MFA) for all Admin accounts.
- Use secure, HttpOnly, SameSite cookies for JWT session tokens.
- Strict token validation on the NestJS backend, including signature verification and expiration checks.

### 3.2 Tampering (Integrity)
**Threat:** Interception and modification of data in transit (e.g., altering API responses or AI prompts) or at rest.
**Mitigation:**
- Enforce TLS 1.2/1.3 for all external and internal communications.
- Use Prisma schema validation and NestJS DTO validation to ensure data integrity before database insertion.
- Leverage Supabase Row Level Security (RLS) to prevent unauthorized row modifications.

### 3.3 Repudiation (Non-repudiability)
**Threat:** An Admin makes a critical change (e.g., deleting a project) and later denies performing the action.
**Mitigation:**
- Implement comprehensive audit logging for all state-changing operations within the Admin dashboard.
- Logs must include timestamp, user ID, action performed, IP address, and resource affected.
- Store logs in a secure, immutable append-only datastore.

### 3.4 Information Disclosure (Confidentiality)
**Threat:** Leakage of sensitive API keys, database credentials, or private drafts through application vulnerabilities or misconfigurations.
**Mitigation:**
- Strict Secrets Management: No secrets in source code; use a robust Secrets Manager.
- Supabase RLS ensures public users cannot query draft projects or admin-only tables.
- The AI Service (FastAPI) incorporates egress filters to ensure the LLM does not hallucinate or leak internal system prompts or sensitive RAG documents.

### 3.5 Denial of Service (Availability)
**Threat:** Attackers flood the Next.js frontend or the resource-intensive FastAPI AI service to take the portfolio offline.
**Mitigation:**
- Deploy a Web Application Firewall (WAF) and DDoS protection (e.g., Cloudflare/Vercel Edge).
- Implement aggressive rate limiting on the NestJS API gateway, specifically throttling AI endpoint requests per IP/Session.
- Auto-scaling configuration for containerized services.

### 3.6 Elevation of Privilege (Authorization)
**Threat:** A public user exploits a vulnerability to gain Admin rights, or a server-side vulnerability allows remote code execution (RCE).
**Mitigation:**
- Strict Role-Based Access Control (RBAC) enforced at both the API (NestJS Guards) and Database (Supabase RLS) levels.
- Run all backend services (NestJS, FastAPI) with least-privilege IAM roles and non-root container users.
- Regular dependency updates and SAST scanning to patch known vulnerabilities.

## 4. AI-Specific Threats (LLM/RAG)
**Threat: Prompt Injection / Jailbreaking**
- **Description:** A user crafts a malicious input to the portfolio's AI chatbot to bypass instructions, attempting to extract system prompts or irrelevant/inappropriate information.
- **Mitigation:** Use strict system prompt engineering, input length limits, and output semantic validation using LangChain's moderation chains. Never pass raw user input directly to executable code or SQL queries.

**Threat: Data Poisoning in RAG**
- **Description:** If an attacker can inject malicious content into the database, it could be vectorized and retrieved by the RAG system, leading to the AI serving malicious responses.
- **Mitigation:** Ensure only authenticated Admins can insert/update content that gets vectorized. Strict sanitization of all portfolio content before it is embedded into `pgvector`.
