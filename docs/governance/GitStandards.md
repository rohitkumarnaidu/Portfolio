# Git Workflow & Standards — FAANG Enterprise Version Control

> **Document:** `GitStandards.md` | **Version:** 5.0 (Enterprise Upgrade) | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal DevOps Engineer | **Review Cadence:** Quarterly

## 1. Executive Summary
This document outlines the strict Git conventions mandated for the monorepo. It details branching strategies, commit message formatting (Conventional Commits), pull request workflows, and release management processes designed to support continuous delivery and automated semantic versioning.

## 2. Branching Strategy

### 2.1 Permanent Branches
- **`main`**: The single source of truth. Always production-ready. Protected — no direct pushes.
- **`develop`** (optional): Integration branch for complex features spanning multiple sprints. Synced to `main` before release.

### 2.2 Branch Naming Convention
All branches (except `main`) must follow this pattern:

| Prefix | Usage | Example |
|--------|-------|---------|
| `feat/` | New feature or enhancement | `feat/PORT-42-ai-chat-history` |
| `fix/` | Bug fix | `fix/PORT-99-login-redirect-loop` |
| `chore/` | Build, config, CI, tooling | `chore/update-deps-playwright` |
| `docs/` | Documentation only | `docs/api-endpoint-reference` |
| `refactor/` | Code restructuring, no behavior change | `refactor/extract-auth-service` |
| `test/` | Adding or updating tests | `test/ai-chat-e2e-coverage` |
| `perf/` | Performance improvement | `perf/bundle-size-reduction` |
| `hotfix/` | Urgent production fix | `hotfix/PORT-7-security-vuln` |

### 2.3 Branch Lifecycle
1. Create branch from `main`.
2. Work locally, commit frequently.
3. Push to origin, open PR.
4. After PR approval and CI pass, squash-merge to `main`.
5. Delete the branch after merge.

## 3. Commit Message Standards

We enforce **Conventional Commits** using `commitlint` on pre-commit hooks.

### 3.1 Format
```
type(scope): description

[optional body]

[optional footer(s)]
```

### 3.2 Allowed Types
| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style (formatting, whitespace) — no logic change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build process, CI, dependencies, tooling |
| `ci` | CI configuration changes |

### 3.3 Scopes
Scopes reflect the workspace or module affected:

| Scope | Workspace |
|-------|-----------|
| `web` | apps/web (Next.js frontend) |
| `api` | apps/api (NestJS backend) |
| `ai` | apps/ai (FastAPI service) |
| `shared` | packages/shared |
| `ui` | packages/ui |
| `config` | packages/config |
| `deps` | Dependency updates across workspaces |
| `infra` | Infrastructure, CI, deployment |

### 3.4 Examples
```
feat(api): add OAuth authentication with Google and GitHub

- Implement Passport.js Google strategy
- Implement Passport.js GitHub strategy
- Add token exchange endpoint
- Add user linking for existing email accounts

Closes PORT-42
```

```
fix(web): resolve infinite re-render in project filter hook

The useProjectFilter hook was creating a new object reference on every render,
causing useEffect dependencies to always be dirty. Fixed by memoizing the
filter object with useMemo.

Closes PORT-99
```

```
chore(deps): upgrade Next.js from 14.0.4 to 14.1.0
```

### 3.5 Rules
- **Subject line** is required, ≤ 72 characters, imperative mood, not capitalized, no trailing period.
- **Body** is optional but recommended for non-trivial changes. Wrap at 72 characters.
- **Footer** references issue tracker IDs (`Closes PORT-42`, `Fixes PORT-99`).
- **Breaking changes** append `!` after type/scope: `feat(api)!: change auth response format`.

## 4. Pull Request Workflow

### 4.1 Process
1. **Create:** Developer creates a PR from feature branch to `main`.
2. **Self-review:** Author reviews their own diff before requesting reviewers. Check for debug code, missing tests, TODOs.
3. **Request review:** Assign at least 1 domain expert. For cross-cutting changes, assign 2 reviewers.
4. **Address feedback:** Push fixup commits. Do not rebase or squash until review is complete.
5. **Re-request:** After addressing feedback, re-request review.
6. **Approval:** Reviewer approves or requests changes.
7. **Merge:** After approval + green CI, author squash-merges to `main`. Delete the branch.

### 4.2 PR Requirements
- **Title:** Follows Conventional Commits format (becomes the squash commit message).
- **Description:** Includes What, Why, How, Test Plan, Screenshots (for UI changes).
- **Size:** Max **400 lines changed** (excluding generated files, lockfiles, test fixtures).
  - Larger PRs must be split into logical chunks.
  - Exceptions require tech lead approval.
- **CI:** All checks must pass (lint, typecheck, test, build, security scan).
- **Labels:** Add labels (`feat`, `fix`, `chore`, `breaking`, `needs-review`, `do-not-merge`).

### 4.3 PR Review SLA
| PR Size | Review Deadline |
|---------|----------------|
| < 100 lines | 4 business hours |
| 100-400 lines | 24 business hours |
| > 400 lines | 48 hours (requires justification) |

## 5. Commit History & Merge Strategy

### 5.1 Squash Merge
- All feature branches use **squash merge** to `main`.
- The single commit message is the PR title (Conventional Commits format).
- Commit body includes co-author credits and PR number.

### 5.2 Why Squash Merge?
- Keeps `main` commit history clean and linear.
- Each commit on `main` represents one complete, reviewable unit of work.
- Easy to bisect for regressions.
- Avoids intermediate "WIP" commits on main.

### 5.3 Rebasing
- Developers may rebase their feature branch on `main` to resolve conflicts.
- Do NOT rebase branches that others have reviewed or committed to.
- Force-push with caution — prefer merging `main` into the feature branch instead.

## 6. Tagging & Releases

### 6.1 Version Scheme
We follow **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

| Component | When to Increment |
|-----------|------------------|
| MAJOR | Breaking API change, breaking UI change, major architecture change |
| MINOR | New feature, non-breaking enhancement |
| PATCH | Bug fix, performance improvement, dependency update |

### 6.2 Tagging Process
1. Create release commit on `main` bumping version in `package.json` files.
2. Create Git tag: `git tag -a v1.2.3 -m "v1.2.3: Add project filtering"`
3. Push tag: `git push origin v1.2.3`
4. Create GitHub Release with changelog.

### 6.3 Changelog
- Generated from commit history between tags.
- Grouped by type: Features, Bug Fixes, Performance, Documentation, etc.
- Includes links to PRs and issues.

## 7. Emergency Hotfix Process

1. Branch from `main`: `hotfix/PORT-7-critical-fix`
2. Fix and commit with conventional message.
3. Open PR directly to `main` (bypass `develop` if used).
4. Expedited review: Ping reviewers, reduced SLA.
5. Merge and tag immediately.
6. Cherry-pick to `develop` if applicable.

## 8. Automation
- **commitlint:** Validates commit messages on pre-commit hook.
- **Branch name lint:** Validates branch name format on push (CI).
- **PR title lint:** Validates PR title follows Conventional Commits (CI action).
- **Size check:** Fails CI if PR exceeds 400 lines changed.
