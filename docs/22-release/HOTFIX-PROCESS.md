# Hotfix Process

> **Document:** `HOTFIX-PROCESS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Engineering Lead | **Review Cadence:** Quarterly
> **Related:** [ReleaseProcess.md](./RELEASE-PROCESS.md) | `docs/31-playbooks/ROLLBACK.md`

---

## 1. What Constitutes a Hotfix

A hotfix is warranted only for issues that meet one or more of these criteria:

| Severity | Criteria | Example |
|----------|----------|---------|
| **P0 — Blocker** | Complete feature outage affecting all users | Portfolio homepage returns 500 |
| **P1 — Critical** | Major feature broken, no workaround | Admin login fails for all users |
| **Security** | Active vulnerability with exploit vector | XSS in project description rendering |
| **Data loss** | Corruption or deletion of user data | Migration drops constraints incorrectly |

Non-critical bugs, cosmetic issues, and feature requests follow the standard release process.

---

## 2. Hotfix Branch Workflow

```
main:      ──●─────────────────●─────────────●──
              \                 /             /
hotfix/     ───●──●────────────●             /
              fix  test    PR merged        /
                                         main
```

### Steps

1. **Branch from `main`**: `git checkout -b hotfix/description-of-fix main`
2. **Apply the fix**: Minimal, focused change addressing only the production issue
3. **Add tests**: Regression test that reproduces the bug (if practical under time constraints)
4. **Push**: `git push origin hotfix/description-of-fix`
5. **Open a PR**: Title prefix `[HOTFIX]` — e.g. `[HOTFIX] Fix null pointer in project serializer`
6. **Expedited review**: Reviewer assigned immediately; SLA of **1 hour** for first review
7. **Merge to `main`**: Squash-merge once approved
8. **Deploy**: Standard CI pipeline deploys to Vercel

---

## 3. Hotfix Review Criteria

Reviewers apply a stricter, safety-focused standard:

| Criterion | Requirement |
|-----------|-------------|
| Focused change | Single concern, one file or a small set of related files |
| No refactoring | Zero changes to code structure, variable renames, or formatting |
| No scope creep | Only the production bug is addressed; no adjacent improvements |
| Tests included | Regression test that would catch the bug (required if feasible, deferred to follow-up PR otherwise) |
| CI passes | All quality gates must still pass |
| Rollback verified | Confirm the previous deployment can be restored if the hotfix introduces a new issue |

**PRs that fail these criteria** are rejected and redirected to the standard release process.

---

## 4. How Hotfixes Differ from Standard Releases

| Aspect | Standard Release | Hotfix |
|--------|-----------------|--------|
| Trigger | Any PR merge to `main` | P0/P1 production issue |
| Feature flags | Required for new features | May bypass feature flags |
| Quality gates | Full suite | May skip non-essential gates (load tests, security scan) with Engineering Lead approval |
| Review SLA | Within business hours | Within 1 hour (24/7) |
| Changelog entry | Required per PR | Required but can be added post-facto |
| Rollback verification | Recommended | Required before merge |
| Training/docs | Must accompany feature | Can be deferred to follow-up PR |

---

## 5. Post-Hotfix Requirements

Within 24 hours of a hotfix deployment:

| Action | Owner | Artifact |
|--------|-------|----------|
| Create incident record | On-call engineer | Incident tracking system entry |
| Schedule post-mortem | Engineering Lead | Calendar invite within 24h |
| Create follow-up PR for deferred docs/tests | Fix author | GitHub issue + PR with `#post-hotfix` label |
| Update runbooks if gap found | On-call engineer | PR to relevant docs |
| Tag the release | Engineering Lead | `git tag vX.Y.Z+hotfix.N` |

### Post-mortem template

```
## Incident: <title>
- Date: YYYY-MM-DD
- Detection time: <when it was noticed>
- Resolution time: <when fix was deployed>
- Root cause: <one paragraph>
- Impact: <users affected, data lost (if any)>
- Prevention: <how to avoid recurrence>
- Action items: [list with owners]
```
