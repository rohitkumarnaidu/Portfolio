# Open Source Policy

> **Document:** `OPEN-SOURCE-POLICY.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Project Maintainer

---

## 1. Purpose

This policy defines how the Portfolio project is managed as an open source project. It establishes the governance model, contribution workflow, community standards, and security disclosure process for all contributors and users.

## 2. License

This project is licensed under the **MIT License**. See [`LICENSE.md`](./LICENSE.md) for the full text. By contributing to this project, you agree that your contributions will be licensed under the same MIT License.

**No Contributor License Agreement (CLA) is required.** Submitting a pull request constitutes acceptance of these terms.

## 3. Contribution Model

Contributions follow the **Fork + Pull Request** workflow:

1. Fork the repository on GitHub.
2. Create a feature branch from `main`.
3. Make changes following the [Coding Standards](./CONTRIBUTING.md#coding-standards).
4. Submit a pull request against `main`.
5. All merges use **squash merge** to maintain a clean history.

Detailed contribution instructions are in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## 4. Maintainer Role

The project is **benevolently dictator-run** with a single maintainer (the project owner) who has final say on all decisions. The maintainer is responsible for:

- Reviewing and merging pull requests
- Triage and prioritization of issues
- Release management and changelog maintenance
- Enforcing the Code of Conduct
- Security vulnerability coordination

There is no formal steering committee or voting process.

## 5. Issue Triage

Issues are labeled according to the following taxonomy:

| Label | Description | Response SLA |
|-------|------------|-------------|
| `bug` | Confirmed defect | 48 hours |
| `enhancement` | Feature request | 7 days |
| `good first issue` | Beginner-friendly task | 7 days |
| `help wanted` | Maintainer cannot prioritize | 7 days |
| `question` | Usage or setup inquiry | 48 hours |
| `security` | Vulnerability report (private) | 48 hours |

Response SLA is measured from the time of submission to first maintainer acknowledgment. Labels are applied by the maintainer or trusted contributors.

## 6. Pull Request Review Policy

All pull requests are subject to the following requirements:

- **Timeline:** Reviewed within 1 week of submission.
- **CI:** All checks must pass (lint, typecheck, test, build).
- **Code Review:** At least one maintainer review required. The [code review checklist](./CONTRIBUTING.md#review-process) applies.
- **Documentation:** PRs changing behavior must update relevant docs in `docs/`.
- **Squash Merge:** Preferred merge strategy. PR title must follow conventional commits format: `type(scope): description`.

## 7. Community Guidelines

All participants must adhere to the [Code of Conduct](./CODE_OF_CONDUCT.md). Key principles:

- **Be respectful:** Assume good faith. Disagreement is welcome; personal attacks are not.
- **Be constructive:** Criticism should be specific and actionable.
- **No spam/self-promotion:** Unsolicited promotional content will be removed.
- **No harassment:** This includes trolling, intimidation, and discriminatory language.

Violations should be reported to the project maintainer via [security@portfolio.dev](mailto:security@portfolio.dev).

## 8. Release Policy

Releases follow a simple semver-like scheme (`vMAJOR.MINOR.PATCH`):

- **PATCH:** Bug fixes and minor changes
- **MINOR:** Features and non-breaking improvements
- **MAJOR:** Breaking API or architectural changes

All releases are tagged on GitHub (e.g., `v1.2.0`) and published to the Releases section with auto-generated release notes from the changelog. A `CHANGELOG.md` is maintained at the repository root.

## 9. Security Disclosures

Security vulnerabilities must **not** be reported via public GitHub issues. The responsible disclosure process is documented in [`SECURITY.md`](./SECURITY.md):

- **Contact:** [security@portfolio.dev](mailto:security@portfolio.dev)
- **Response SLA:** 48-hour acknowledgment
- **Resolution target:** Critical issues within 7 days
- **Disclosure:** Coordinated disclosure with 90-day embargo

Vulnerabilities in third-party dependencies should be reported to the respective maintainers.

## 10. Governance

This project operates under a **Benevolent Dictator for Life (BDFL)** model:

- The project maintainer has final authority on all decisions, including feature acceptance, scope, and direction.
- Discussions and community input are encouraged, but the maintainer is not obligated to reach consensus.
- If the maintainer becomes inactive for 6+ months, a successor may be appointed from the contributor community.

## 11. Contributions from External Developers

External contributions are welcome and encouraged. By submitting a pull request, you agree that:

1. Your contribution is your own original work.
2. You grant the project an MIT License to use your contribution.
3. You have the right to make the contribution under these terms.

**No CLA is required.** This keeps the barrier to entry as low as possible.

---

## References

| Document | Link |
|----------|------|
| License | [`LICENSE.md`](./LICENSE.md) |
| Contributing Guide | [`CONTRIBUTING.md`](./CONTRIBUTING.md) |
| Code of Conduct | [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) |
| Security Policy | [`SECURITY.md`](./SECURITY.md) |
| Documentation Index | [`docs/MASTER-INDEX.md`](../MASTER-INDEX.md) |

## Cross-References
- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
