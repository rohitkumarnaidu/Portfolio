# Security Policy

## Supported Versions

| Version | Supported             |
| ------- | --------------------- |
| 1.x     | ✅ Active development |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please follow the process below:

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, contact us directly:

- **Email:** [security@portfolio.dev](mailto:security@portfolio.dev)
- **Expected Response Time:** Within 48 hours
- **PGP Key:** (TODO: Add PGP key for encrypted communication)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected versions
- Potential impact
- Any suggested fixes (optional)

### Process

1. Report the vulnerability via email
2. We will acknowledge receipt within 48 hours
3. We will investigate and provide a timeline for a fix
4. Once fixed, we will notify you and request disclosure coordination
5. Public disclosure after a fix is available (typically 90 days after initial report)

## Disclosure Policy

- We follow a coordinated disclosure process
- We aim to resolve critical issues within 7 days
- We will credit researchers in the CHANGELOG (if desired)
- Bug bounty is not currently available

## Recognition

We appreciate the security research community and will acknowledge valid reports in our release notes.

## Scope

This policy covers:

- The main application (Next.js frontend + NestJS API)
- The AI microservice (FastAPI)
- Infrastructure configuration
- Build and deployment pipelines

Out of scope:

- Third-party services (Vercel, Supabase, etc.) - report to their respective security teams
- Dependency vulnerabilities - check our DependencyInventory.md for remediation timelines
