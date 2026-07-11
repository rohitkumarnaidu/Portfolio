# Docs Deduplication & Consolidation Plan

> **Version:** 2.0 | **Status:** ✅ Executed  
> **Total docs:** 228 .md files (162 active + 47 archived + 18 adr/ceremony/features + 1 MASTER-INDEX) | **Duplicate pairs resolved:** 30+ | **Net reduction:** 47 files archived, 5 moved, 1 merged

---

## Phase 1: Remove Exact Copies (Same file duplicated under different names)

These are byte-for-byte identical files. Keep the one with the better name, archive the other.

| #   | Keep                                  | Archive                           | Reason     |
| --- | ------------------------------------- | --------------------------------- | ---------- |
| 1   | `operations/55-DISASTER-RECOVERY.md`  | `operations/DisasterRecovery.md`  | Exact copy |
| 2   | `operations/LaunchPlan.md`            | `operations/LaunchChecklist.md`   | Exact copy |
| 3   | `operations/TechnicalDebtRegister.md` | `operations/TechDebtRoadmap.md`   | Exact copy |
| 4   | `security/16-COMPLIANCE.md`           | `security/ComplianceFramework.md` | Exact copy |

---

## Phase 2: Remove Superseded Numbered Originals (Numbered v4.0 → CamelCase v5.0)

The numbered files (`08-*`, `08b-*`, etc.) are v4.0 originals. The CamelCase counterparts are v5.0 "Enterprise Upgrade" versions. Keep the higher version.

| #   | Keep (v5.0)                            | Archive (v4.0)                           |
| --- | -------------------------------------- | ---------------------------------------- | --------------------------------------- |
| 1   | `design/DesignSystem.md`               | `design/DesignSystem.md`                 |
| 2   | `design/ComponentLibrary.md`           | `design/ComponentLibrary.md`             |
| 3   | `design/FrontendArchitecture.md`       | `design/FrontendArchitecture.md`         |
| 4   | `design/BackendArchitecture.md`        | `design/BackendArchitecture.md`          |
| 5   | `design/InteractionPatterns.md`        | `design/InteractionPatterns.md`          |
| 6   | `design/AdminArchitecture.md`          | `design/AdminArchitecture.md`            |
| 7   | `architecture/SystemArchitecture.md`   | `architecture/SystemArchitecture.md`     |
| 8   | `database/DatabaseArchitecture.md`     | `database/DatabaseArchitecture.md`       |
| 9   | `security/SecurityArchitecture.md`     | `security/SecurityArchitecture.md`       |
| 10  | `quality/PerformanceArchitecture.md`   | `quality/PerformanceArchitecture.md`     |
| 11  | `quality/SEOArchitecture.md`           | `quality/SEOArchitecture.md`             |
| 12  | `quality/AccessibilityArchitecture.md` | `quality/AccessibilityArchitecture.md`   |
| 13  | `quality/TestingArchitecture.md`       | `quality/TestingArchitecture.md`         |
| 14  | `product/ProductRequirements.md`       | `product/ProductRequirements.md`         |
| 15  | `product/UserFlows.md`                 | `product/UserFlows.md`                   |
| 16  | `product/ContentArchitecture.md`       | `product/ContentArchitecture.md`         |
| 17  | `operations/DevOpsArchitecture.md`     | `operations/DevOpsArchitecture.md`       |
| 18  | `operations/DeploymentGuide.md`        | `operations/DeploymentGuide.md`          |
| 19  | `operations/AnalyticsArchitecture.md`  | `operations/AnalyticsArchitecture.md`    |
| 20  | `architecture/RoutingArchitecture.md`  | `architecture/NavigationArchitecture.md` |
| 21  | `api/ErrorHandling.md`                 | `api/ErrorHandling.md`                   | v5.0 Enterprise Upgrade supersedes v4.0 |
| 22  | `runbooks/Logging.md`                  | `runbooks/LoggingStrategy.md`            | v5.0 Enterprise Upgrade supersedes v4.0 |
| 23  | `governance/CodingStandards.md`        | `governance/Standards.md`                | v5.0 Enterprise Upgrade supersedes v4.0 |
| 24  | `design/DesignTokens.md`               | `design/DesignTokens.md`                 | v5.0 Enterprise Upgrade supersedes v4.0 |

---

## Phase 3: Remove Superseded Overviews (Short docs fully covered by larger docs)

These are short (under 60 lines) overview documents whose content is completely contained within the comprehensive reference.

| #   | Source (to archive)                           | Absorbed into                          |
| --- | --------------------------------------------- | -------------------------------------- |
| 1   | `ai/RAGArchitecture.md`                       | `ai/19-RAG.md`                         |
| 2   | `ai/PromptArchitecture.md`                    | `ai/PromptLibrary.md`                  |
| 3   | `ai/AIGovernance.md`                          | `ai/17-AI_INSTRUCTIONS.md`             |
| 4   | `ai/AgentArchitecture.md`                     | `ai/18-AGENTS.md` + `ai/Agent.md`      |
| 5   | `api/CachingStrategy.md`                      | `api/49-CACHE-ARCHITECTURE.md`         |
| 6   | `api/QueueArchitecture.md`                    | `api/47-BACKGROUND-JOBS.md`            |
| 7   | `api/APIArchitecture.md`                      | `api/12-API.md`                        |
| 8   | `quality/QAStrategy.md`                       | `quality/30-QA.md`                     |
| 9   | `quality/AccessibilityTesting.md`             | `quality/AccessibilityArchitecture.md` |
| 10  | `operations/CICDArchitecture.md`              | `operations/CI-CD.md`                  |
| 11  | `operations/DeploymentStrategy.md`            | `operations/DeploymentGuide.md`        |
| 12  | `operations/InfrastructureArchitecture.md`    | `operations/54-INFRASTRUCTURE.md`      |
| 13  | `operations/BusinessContinuity.md`            | `operations/55-DISASTER-RECOVERY.md`   |
| 14  | `product/ContentStrategy.md`                  | `product/ContentArchitecture.md`       |
| 15  | `product/Vision.md`                           | `product/ProjectVision.md`             |
| 16  | `product/FeatureRoadmap.md` (self-deprecated) | `product/37-IMPLEMENTATION_PLAN.md`    |
| 17  | `design/3DStrategy.md`                        | `design/3D_ARCHITECTURE.md`            |

---

## Phase 4: Move & Consolidate (Files in wrong location or overlapping)

| #   | Action                                                      | Details                                         |
| --- | ----------------------------------------------------------- | ----------------------------------------------- |
| 1   | **RollbackStrategy.md → merge into DeploymentGuide.md**     | 25-line doc; add as §Rollback in deployment doc |
| 2   | **Move DefinitionOfDone.md from governance/ to quality/**   | Quality process doc belongs with QA/testing     |
| 3   | **Move design/08g-AI-ASSISTANT-ARCHITECTURE.md to ai/**     | AI topic in design/ — belongs in ai/            |
| 4   | **Move design/08h-AI-ASSISTANT-IMPLEMENTATION.md to ai/**   | Same — AI topic                                 |
| 5   | **Move design/08f-DATABASE-IMPLEMENTATION.md to database/** | DB topic in design/ — belongs in database/      |

---

## Phase 5: Create Missing Ghost Files (Docs referenced but never created)

These files are referenced in existing docs but don't exist. Decide if you want to create them.

| #   | Ghost file                              | Referenced in                | Suggested content             |
| --- | --------------------------------------- | ---------------------------- | ----------------------------- |
| 1   | `docs/security/PRIVACY.md`              | `AnalyticsImplementation.md` | Privacy policy, data handling |
| 2   | `docs/security/AGENT-SECURITY.md`       | `AgentMarketplace.md`        | Agent security model          |
| 3   | `docs/security/Security-Policy.md`      | `PromptLibrary.md`           | Security policy               |
| 4   | `docs/api/DATA-MODEL.md`                | `KnowledgeArchitecture.md`   | Data model overview           |
| 5   | `docs/operations/OPERATIONS.md`         | `KnowledgeArchitecture.md`   | Operations runbook index      |
| 6   | `docs/api/DEPLOYMENT-GUIDE.md`          | `AgentMarketplace.md`        | Agent deployment guide        |
| 7   | `docs/operations/CONTRIBUTING.md`       | `KnowledgeArchitecture.md`   | Contribution guidelines       |
| 8   | `docs/ai/AGENT-NETWORKING.md`           | `AgentMarketplace.md`        | Agent networking protocol     |
| 9   | `docs/ai/MARKETPLACE-API-SPEC.md`       | `AgentMarketplace.md`        | Marketplace API spec          |
| 10  | `docs/ai/PACKAGE-DEVELOPMENT.md`        | `AgentMarketplace.md`        | Agent package development     |
| 11  | `docs/ai/Agent-Interaction-Protocol.md` | `PromptLibrary.md`           | Agent interaction protocol    |

---

## Summary Stats

| Phase             | Action                            | Files affected                                      |
| ----------------- | --------------------------------- | --------------------------------------------------- |
| 1                 | Archive exact duplicates          | -4 files                                            |
| 2                 | Archive superseded v4.0 originals | -24 files                                           |
| 3                 | Archive superseded overviews      | -17 files                                           |
| 4                 | Move/consolidate                  | 5 moves + 1 merge                                   |
| 5                 | Create ghost stubs (optional)     | +11 files                                           |
| **Net reduction** |                                   | **~40 files removed, 5 moved, 11 optional creates** |

### Estimated time: 2-3 hours

### Risk: Low (all content preserved in surviving files)

> **Note:** All "archive" actions below move files to `docs/archive/` — nothing is deleted permanently.

---

## Recommended Execution Order

1. **Phase 1** first — safe deletions (exact copies, no content loss)
2. **Phase 2** — archive v4.0 originals (verify v5.0 files are truly supersets first)
3. **Phase 4** — move misplaced files (location fixes)
4. **Phase 3** — archive superseded overviews (verify coverage)
5. **Phase 5** — optional ghost file creation
6. **Final** — update MASTER-INDEX.md and cross-references
