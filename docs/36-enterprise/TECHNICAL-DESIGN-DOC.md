# Technical Design Document Template

> **Purpose:** This template provides a standardized format for technical design documents, following Google's Engineering Design Doc approach. Every significant feature, refactor, or architecture change should start with a TDD.

## When to Write a TDD
- New feature or significant enhancement
- Architecture change
- Database schema changes
- API additions or breaking changes
- Performance optimization
- Security improvements
- Refactoring of significant scope

## Template

```markdown
# TDD: [Title]

**Author:** [Name]
**Date:** YYYY-MM-DD
**Status:** [Draft / In Review / Approved / Implemented / Superseded]
**PR Link:** [#XXX]

## Problem Statement
What problem are we solving? Why is it important?

## Goals & Non-Goals
### Goals
- What this design aims to achieve

### Non-Goals
- What this design explicitly does NOT address

## Background & Context
- Relevant prior decisions (link to ADRs)
- Current system behavior
- Any constraints or requirements

## Proposed Solution
### Architecture Overview
[High-level description of the approach]

### Detailed Design
[Technical details — enough for another engineer to implement]

### Data Model Changes
[If applicable: schema changes, new tables, migrations]

### API Changes
[If applicable: new/modified endpoints, request/response formats]

### UI Changes
[If applicable: component changes, new pages, UX flow]

## Alternatives Considered
| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| Option A | ... | ... | Selected |
| Option B | ... | ... | Rejected |
| Option C | ... | ... | Not considered |

## Key Decisions
| Decision | Rationale | Impact |
|----------|-----------|--------|
| ... | ... | ... |

## Security Considerations
- Authentication/authorization impact
- Data privacy
- Input validation
- Rate limiting
- Audit logging

## Performance Considerations
- Expected load
- Database query impact
- Caching strategy
- Latency budget

## Testing Plan
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Security tests

## Rollout Plan
- Feature flag
- Canary deployment
- Monitoring
- Rollback criteria

## Dependencies
- External services
- Internal modules
- Third-party libraries

## Timeline
| Phase | Description | Estimated Effort |
|-------|-------------|-----------------|
| 1 | ... | ... |
| 2 | ... | ... |

## Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ... | Low/Med/High | Low/Med/High | ... |

## Open Questions
- [ ] Question 1
- [ ] Question 2

## Reviewers
- [ ] @reviewer1
- [ ] @reviewer2

## References
- Links to related ADRs, docs, PRs, issues
```

## Guidelines for Writing TDDs

### Length
- Most TDDs: 2-5 pages
- Complex architecture changes: 5-10 pages
- If >10 pages, consider splitting

### Tone
- Clear, concise, technical
- Assume reader knows the codebase
- State assumptions explicitly
- Use diagrams for complex flows

### Review Process
1. **Draft:** Author writes initial TDD
2. **Review:** Assigned reviewers comment
3. **Approval:** At least 2 approvals needed
4. **Implementation:** Link PRs to TDD
5. **Post-Implementation:** Update TDD with learnings

## TDD Index
All TDDs should be tracked in the decision log (`docs/governance/DecisionLog.md`) with their status.

---

*This template is adapted from Google's Engineering Design Doc format and Stripe's RFC process.*

## Cross-References
- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
