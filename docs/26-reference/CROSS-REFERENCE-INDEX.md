# Cross-Reference Index

> **Document:** `26-reference/CROSS-REFERENCE-INDEX.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Purpose:** Master map of every cross-reference across the documentation system

## How to Use

Every document should reference related documents. This index provides a complete map. If you update a document, check this index to find all docs that reference it (so you can update their links). If you create a new document, add its cross-references here.

## Cross-Reference Map

### Architecture Documents

| Document                   | References                                                                          | Referenced By                                                                                                                                                                                            |
| -------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SystemArchitecture.md      | C4-Architecture, TechStack, ADR-001–018, ArchitecturePrinciples, DomainArchitecture | ExecutiveSummary, ArchitectureOverview, NFRs, SecurityArchitecture, PerformanceArchitecture, DatabaseArchitecture, DevOpsArchitecture, 37-IMPLEMENTATION_PLAN, developer-onboarding, RoutingArchitecture |
| C4-Architecture.md         | SystemArchitecture, DeploymentGuide, SecurityArchitecture, IntegrationArchitecture  | ArchitectureOverview, 37-IMPLEMENTATION_PLAN, SystemArchitecture                                                                                                                                         |
| 10-TECHSTACK.md            | SystemArchitecture, ArchitecturePrinciples, ADR-001–014                             | All implementation docs, developer-onboarding, 13-INTEGRATIONS, 37-IMPLEMENTATION_PLAN                                                                                                                   |
| 13-INTEGRATIONS.md         | 10-TECHSTACK, 12-API, SystemArchitecture, ADR-004, ADR-009                          | 37-IMPLEMENTATION_PLAN, vendor-management (59), API docs                                                                                                                                                 |
| c4-architecture.md         | SystemArchitecture, DeploymentGuide, SecurityArchitecture                           | NFRs, ArchitectureOverview                                                                                                                                                                               |
| ArchitecturePrinciples.md  | SystemArchitecture, EngineeringPrinciples                                           | All architecture docs, CodingStandards                                                                                                                                                                   |
| DomainArchitecture.md      | SystemArchitecture, ServiceArchitecture, InformationArchitecture                    | SystemArchitecture                                                                                                                                                                                       |
| ServiceArchitecture.md     | DomainArchitecture, IntegrationArchitecture, SystemArchitecture                     | SystemArchitecture, DeploymentGuide                                                                                                                                                                      |
| IntegrationArchitecture.md | ServiceArchitecture, 13-INTEGRATIONS, SystemArchitecture                            | 13-INTEGRATIONS, C4-Architecture                                                                                                                                                                         |
| RoutingArchitecture.md     | SystemArchitecture, FrontendArchitecture                                            | SystemArchitecture, FrontendArchitecture                                                                                                                                                                 |
| StateManagement.md         | SystemArchitecture, FrontendArchitecture, RFC-002-tanstack-query                    | FrontendArchitecture                                                                                                                                                                                     |
| EngineeringPrinciples.md   | ArchitecturePrinciples, CodingStandards                                             | ArchitecturePrinciples, engineering-playbook                                                                                                                                                             |
| AnimationArchitecture.md   | SystemArchitecture, 08k-3D-ARCHITECTURE, 08l-MOTION-SYSTEM                          | 08o-IMMERSIVE-EXPERIENCE, 3D_ARCHITECTURE                                                                                                                                                                |

### API Standards

| Document                  | References                                                  | Referenced By                                                                                |
| ------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 12-API.md                 | SystemArchitecture, DatabaseArchitecture, ADR-003, ADR-011  | 13-INTEGRATIONS, ErrorHandling, APIContracts, DATA-MODEL, openapi.json, developer-onboarding |
| APIContracts.md           | 12-API, 50-DATA-CONTRACTS, Zod (ADR-014)                    | 50-DATA-CONTRACTS, ErrorHandling                                                             |
| DATA-MODEL.md             | DatabaseArchitecture, 50-DATA-CONTRACTS, 12-API             | APIContracts, DatabaseSchema                                                                 |
| DEPLOYMENT-GUIDE.md       | DEPLOYMENT-GUIDE (operations), DeploymentGuide, 25-CICD     | AgentMarketplace, DeploymentGuide                                                            |
| ErrorHandling.md          | 12-API, 44-API-STANDARDS, APIContracts                      | 30-QA, TestingArchitecture                                                                   |
| 46-EVENT-ARCHITECTURE.md  | SystemArchitecture, 47-BACKGROUND-JOBS, ADR-017 (BullMQ)    | 47-BACKGROUND-JOBS, SystemArchitecture                                                       |
| 47-BACKGROUND-JOBS.md     | SystemArchitecture, 46-EVENT-ARCHITECTURE, ADR-017          | 46-EVENT-ARCHITECTURE, 21-MONITORING                                                         |
| 48-SEARCH-ARCHITECTURE.md | DatabaseArchitecture, 19-RAG, ADR-007 (pgvector)            | 19-RAG, DatabaseArchitecture                                                                 |
| 49-CACHE-ARCHITECTURE.md  | SystemArchitecture, PerformanceArchitecture, ADR-005 (ISR)  | PerformanceArchitecture, SystemArchitecture                                                  |
| 50-DATA-CONTRACTS.md      | SystemArchitecture, 44-API-STANDARDS, 12-API, Zod (ADR-014) | APIContracts, DATA-MODEL, ErrorHandling                                                      |
| openapi.json              | 12-API, APIContracts, ErrorHandling                         | 12-API, TestingArchitecture                                                                  |

### Security Documents

| Document                           | References                                                                  | Referenced By                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| SecurityArchitecture.md            | ThreatModel, OWASP-ASVS, data-classification, NIST-CSF, ADR-011, ADR-018    | 15-AUTHORIZATION, 16-COMPLIANCE, SecurityHardeningPlan, mfa-rollout-plan, Security-Policy, nist-csf-mapping, security-supply-chain |
| 15-AUTHORIZATION.md                | SecurityArchitecture, ADR-011, ADR-018                                      | SecurityArchitecture, 16-COMPLIANCE, SecurityHardeningPlan                                                                         |
| 16-COMPLIANCE.md                   | SecurityArchitecture, 15-AUTHORIZATION, GDPR, CCPA, WCAG                    | SecurityArchitecture, privacy-policy, cookie-policy, gdpr, CLASSIFICATION                                                          |
| 43-DATA-GOVERNANCE.md              | SecurityArchitecture, 16-COMPLIANCE, data-classification                    | data-classification, 16-COMPLIANCE                                                                                                 |
| mfa-rollout-plan.md                | SecurityArchitecture, 15-AUTHORIZATION, SecurityHardeningPlan               | SecurityHardeningPlan, 37-IMPLEMENTATION_PLAN                                                                                      |
| nist-csf-mapping.md                | SecurityArchitecture, data-classification, Security-Policy                  | SecurityArchitecture, SOC2-readiness                                                                                               |
| vulnerability-management-policy.md | SecurityArchitecture, supply-chain-security-policy, SecurityTesting         | supply-chain-security-policy, Security-Policy                                                                                      |
| supply-chain-security-policy.md    | SecurityArchitecture, vulnerability-management-policy, 59-VENDOR-MANAGEMENT | vulnerability-management-policy, DevOpsArchitecture                                                                                |
| secrets-rotation-schedule.md       | SecurityArchitecture, SecretsManagement, SECRETS-MANAGEMENT-IMPLEMENTATION  | SecretsManagement, SecurityHardeningPlan                                                                                           |
| SecurityHardeningPlan.md           | SecurityArchitecture, 15-AUTHORIZATION, 16-COMPLIANCE, mfa-rollout-plan     | ProductionReadinessReview, LaunchPlan, SecurityTesting                                                                             |
| SecurityTesting.md                 | SecurityArchitecture, SecurityHardeningPlan, TestingArchitecture            | TestingArchitecture, vulnerability-management-policy                                                                               |
| ThreatModel.md                     | SecurityArchitecture, data-classification, SystemArchitecture               | SecurityArchitecture, SecurityHardeningPlan                                                                                        |
| data-classification.md             | 16-COMPLIANCE, SecurityArchitecture                                         | 43-DATA-GOVERNANCE, SecurityArchitecture, nist-csf-mapping                                                                         |
| privacy-policy.md                  | 16-COMPLIANCE, GDPR                                                         | 16-COMPLIANCE, cookie-policy                                                                                                       |
| cookie-policy.md                   | 16-COMPLIANCE, privacy-policy                                               | 16-COMPLIANCE                                                                                                                      |
| gdpr.md                            | 16-COMPLIANCE, privacy-policy                                               | 16-COMPLIANCE                                                                                                                      |
| AuditLogging.md                    | SecurityArchitecture, 22-OBSERVABILITY, Logging                             | SecurityArchitecture, 22-OBSERVABILITY                                                                                             |
| AGENT-SECURITY.md                  | 17-AI_INSTRUCTIONS, 18-AGENTS, SecurityArchitecture                         | 18-AGENTS, AgentMarketplace, AgentRegistry                                                                                         |

### Testing Documents

| Document                     | References                                                                           | Referenced By                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| TestingArchitecture.md       | 30-QA, E2EStrategy, TestPlan, Storybook, FrontendTestingStrategy, PerformanceTesting | 25-CICD, 37-IMPLEMENTATION_PLAN, developer-onboarding, SecurityTesting, ai-testing-strategy |
| 30-QA.md                     | TestingArchitecture, DefinitionOfDone, CodeReviewChecklist                           | TestingArchitecture, 37-IMPLEMENTATION_PLAN, TestPlan                                       |
| TestingImplementation.md     | TestingArchitecture, 30-QA                                                           | 37-IMPLEMENTATION_PLAN, CI-CD-PIPELINE (53)                                                 |
| test-strategy-master-plan.md | TestingArchitecture, CI-CD-IMPLEMENTATION-GUIDE, 25-CICD                             | CI-CD-IMPLEMENTATION-GUIDE, 30-QA                                                           |
| E2EStrategy.md               | TestingArchitecture, Playwright, 05-SCREEN-FLOWS                                     | TestingArchitecture, visual-regression-testing, TestPlan                                    |
| TestPlan.md                  | TestingArchitecture, 30-QA, DefinitionOfDone                                         | TestingArchitecture, 37-IMPLEMENTATION_PLAN                                                 |
| FrontendTestingStrategy.md   | TestingArchitecture, FrontendArchitecture, Storybook                                 | TestingArchitecture, TestingImplementation                                                  |
| PerformanceTesting.md        | TestingArchitecture, PerformanceArchitecture, load-test-specification                | TestingArchitecture, performance-benchmarks                                                 |
| AI-TESTING.md                | TestingArchitecture, AIObservability, 17-AI_INSTRUCTIONS                             | TestingArchitecture, 30-QA                                                                  |
| CodeReviewChecklist.md       | TestingArchitecture, 30-QA, code-review-standards                                    | 30-QA, engineering-playbook                                                                 |
| DefinitionOfDone.md          | TestingArchitecture, 30-QA, CodeReviewChecklist                                      | 30-QA, TestPlan, 37-IMPLEMENTATION_PLAN                                                     |
| Storybook.md                 | DesignSystem, ComponentLibrary, TestingArchitecture                                  | FrontendTestingStrategy, TestingArchitecture, ComponentLibrary                              |
| visual-regression-testing.md | E2EStrategy, Storybook, TestingArchitecture                                          | E2EStrategy, TestingArchitecture                                                            |
| load-test-specification.md   | PerformanceTesting, PerformanceArchitecture, k6                                      | PerformanceTesting, performance-benchmarks                                                  |
| mobile-testing-strategy.md   | TestingArchitecture, MobileExperience, ResponsiveStrategy                            | TestingArchitecture                                                                         |

### Operations Documents

| Document                          | References                                                                                         | Referenced By                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 21-MONITORING.md                  | 22-OBSERVABILITY, 56-SLA-SLO, AlertingStrategy, incident-response-playbook                         | DevOpsArchitecture, 37-IMPLEMENTATION_PLAN, 56-SLA-SLO, AIObservability              |
| 22-OBSERVABILITY.md               | 21-MONITORING, AnalyticsArchitecture, Logging, TracingStrategy                                     | 21-MONITORING, AIObservability, AnalyticsArchitecture                                |
| AnalyticsArchitecture.md          | 22-OBSERVABILITY, SystemArchitecture, 17-AI_INSTRUCTIONS, ADR-009 (PostHog)                        | AnalyticsImplementation, 22-OBSERVABILITY, AIObservability                           |
| AnalyticsImplementation.md        | AnalyticsArchitecture, 21-MONITORING                                                               | AnalyticsArchitecture, 37-IMPLEMENTATION_PLAN                                        |
| DeploymentGuide.md                | DevOpsArchitecture, 25-CICD, deployment-strategy-blue-green                                        | LaunchPlan, ProductionReadinessReview, developer-onboarding, 53-CI-CD-PIPELINE       |
| deployment-strategy-blue-green.md | DeploymentGuide, 25-CICD, 54-INFRASTRUCTURE                                                        | DeploymentGuide, 37-IMPLEMENTATION_PLAN                                              |
| DevOpsArchitecture.md             | SystemArchitecture, DeploymentGuide, InfrastructureAsCode, EnvironmentStrategy                     | DeploymentGuide, 25-CICD, 54-INFRASTRUCTURE                                          |
| 25-CICD.md                        | DevOpsArchitecture, DeploymentGuide, TestingArchitecture                                           | DeploymentGuide, 53-CI-CD-PIPELINE, 57-CHANGE-MANAGEMENT, CI-CD-IMPLEMENTATION-GUIDE |
| 53-CI-CD-PIPELINE.md              | 25-CICD, DeploymentGuide, 54-INFRASTRUCTURE                                                        | 25-CICD, 37-IMPLEMENTATION_PLAN, CI-CD-IMPLEMENTATION-GUIDE                          |
| 54-INFRASTRUCTURE.md              | DevOpsArchitecture, DeploymentGuide, 55-DISASTER-RECOVERY, InfrastructureAsCode                    | 53-CI-CD-PIPELINE, 58-COST-MANAGEMENT, 55-DISASTER-RECOVERY                          |
| 55-DISASTER-RECOVERY.md           | SystemArchitecture, DeploymentGuide, 54-INFRASTRUCTURE                                             | 54-INFRASTRUCTURE, 56-SLA-SLO, BUSINESS-CONTINUITY                                   |
| 56-SLA-SLO.md                     | 21-MONITORING, DeploymentGuide, PerformanceArchitecture                                            | 21-MONITORING, 57-CHANGE-MANAGEMENT, ReleaseManagement                               |
| 57-CHANGE-MANAGEMENT.md           | 25-CICD, DeploymentGuide, 56-SLA-SLO                                                               | DeploymentGuide, ReleaseManagement                                                   |
| 58-COST-MANAGEMENT.md             | DeploymentGuide, 54-INFRASTRUCTURE                                                                 | DeploymentGuide, 37-IMPLEMENTATION_PLAN                                              |
| 59-VENDOR-MANAGEMENT.md           | 13-INTEGRATIONS, SecurityArchitecture, 16-COMPLIANCE                                               | supply-chain-security-policy, 37-IMPLEMENTATION_PLAN                                 |
| 60-FEATURE-FLAGS.md               | DesignSystem, SystemArchitecture, 25-CICD, ADR-009 (PostHog)                                       | DesignSystem, feature-flag-guide                                                     |
| 61-LOCALIZATION.md                | SystemArchitecture, SEOArchitecture, ContentArchitecture                                           | ContentArchitecture, SEOArchitecture                                                 |
| EnvironmentStrategy.md            | DevOpsArchitecture, 54-INFRASTRUCTURE, DeploymentGuide                                             | DevOpsArchitecture, developer-onboarding                                             |
| InfrastructureAsCode.md           | DevOpsArchitecture, 54-INFRASTRUCTURE, DeploymentGuide                                             | DevOpsArchitecture, 54-INFRASTRUCTURE                                                |
| LaunchPlan.md                     | DeploymentGuide, ProductionReadinessReview, 25-CICD                                                | ProductionReadinessReview, 37-IMPLEMENTATION_PLAN                                    |
| ProductionReadinessReview.md      | SecurityHardeningPlan, TestingImplementation, PerformanceOptimization, DeploymentGuide, LaunchPlan | LaunchPlan, 37-IMPLEMENTATION_PLAN                                                   |
| on-call-schedule.md               | incident-severity-criteria, incident-response-playbook, 21-MONITORING                              | incident-severity-criteria, incident-response-playbook                               |
| incident-severity-criteria.md     | on-call-schedule, 21-MONITORING, incident-response-playbook                                        | on-call-schedule, postmortem-tracker                                                 |
| incident-response-playbook.md     | on-call-schedule, incident-severity-criteria, 21-MONITORING                                        | on-call-schedule, post-incident-review-template, operational-runbook-index           |
| postmortem-tracker.md             | incident-response-playbook, incident-severity-criteria                                             | incident-response-playbook                                                           |
| operational-runbook-index.md      | Runbooks (all), incident-response-playbook, service-restart, database-failover                     | Runbooks, operations/README                                                          |
| ReleaseManagement.md              | 56-SLA-SLO, 57-CHANGE-MANAGEMENT, DeploymentGuide                                                  | DeploymentGuide, 37-IMPLEMENTATION_PLAN                                              |
| dora-metrics.md                   | DevOpsArchitecture, 56-SLA-SLO, 25-CICD                                                            | DevOpsArchitecture, ReleaseManagement                                                |
| RiskRegister.md                   | SecurityArchitecture, 55-DISASTER-RECOVERY, SystemArchitecture                                     | 37-IMPLEMENTATION_PLAN                                                               |
| TechnicalDebtRegister.md          | SystemArchitecture, CodingStandards, 30-QA                                                         | 37-IMPLEMENTATION_PLAN, engineering-playbook                                         |

### Design Documents

| Document                      | References                                                                                                                                                         | Referenced By                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| DesignSystem.md               | DesignTokens, ComponentLibrary, ComponentStandards, ADR-010 (Tailwind)                                                                                             | 08a-DESIGN-SYSTEM-EXTENDED, ComponentLibrary, FrontendArchitecture, Storybook, 60-FEATURE-FLAGS     |
| DesignTokens.md               | 06-UIUX, BrandGuidelines, Neumorphism                                                                                                                              | DesignSystem, 08a-DESIGN-SYSTEM-EXTENDED, BrandGuidelines                                           |
| ComponentLibrary.md           | DesignSystem, 08a-DESIGN-SYSTEM-EXTENDED, FrontendArchitecture                                                                                                     | DesignSystem, Storybook, FrontendArchitecture                                                       |
| FrontendArchitecture.md       | SystemArchitecture, DesignSystem, ComponentLibrary, ADR-002 (Next.js)                                                                                              | 08d-FRONTEND-IMPLEMENTATION-PLAN, BackendArchitecture, InteractionPatterns, FrontendTestingStrategy |
| BackendArchitecture.md        | SystemArchitecture, FrontendArchitecture, 12-API                                                                                                                   | 08f-DATABASE-IMPLEMENTATION, SystemArchitecture                                                     |
| 08j-USAGE-GUIDELINES.md       | DesignTokens, ComponentLibrary, FrontendArchitecture, PerformanceArchitecture, AccessibilityArchitecture                                                           | 08k-3D-ARCHITECTURE, 08o-IMMERSIVE-EXPERIENCE, 3D_ARCHITECTURE                                      |
| 08k-3D-ARCHITECTURE.md        | 08j-USAGE-GUIDELINES, FrontendArchitecture, ComponentLibrary, PerformanceArchitecture, AccessibilityArchitecture                                                   | 08o-IMMERSIVE-EXPERIENCE, 3D_ARCHITECTURE, AnimationArchitecture                                    |
| 08l-MOTION-SYSTEM.md          | 06-UIUX, DesignTokens, FrontendArchitecture, AccessibilityArchitecture                                                                                             | 08o-IMMERSIVE-EXPERIENCE, InteractionPatterns, AnimationArchitecture                                |
| InteractionPatterns.md        | DesignTokens, 06-UIUX, ComponentLibrary, FrontendArchitecture, 08l-MOTION-SYSTEM, 08k-3D-ARCHITECTURE, AccessibilityArchitecture                                   | 08o-IMMERSIVE-EXPERIENCE                                                                            |
| 08n-NEUMORPHISM.md            | DesignTokens, 08a-DESIGN-SYSTEM-EXTENDED, AccessibilityArchitecture                                                                                                | 08o-IMMERSIVE-EXPERIENCE, DesignSystem                                                              |
| 08o-IMMERSIVE-EXPERIENCE.md   | 06-UIUX, 08a-DESIGN-SYSTEM-EXTENDED, 08j-USAGE-GUIDELINES, 08k-3D-ARCHITECTURE, 08l-MOTION-SYSTEM, InteractionPatterns, 08n-NEUMORPHISM, AccessibilityArchitecture | 3D_ARCHITECTURE                                                                                     |
| 3D_ARCHITECTURE.md            | 08j-USAGE-GUIDELINES, 08k-3D-ARCHITECTURE, 08l-MOTION-SYSTEM, 08o-IMMERSIVE-EXPERIENCE                                                                             | AnimationArchitecture                                                                               |
| AdminArchitecture.md          | SystemArchitecture, DesignSystem, FrontendArchitecture                                                                                                             | AdminDashboardArchitecture, ADMIN-USER-MANUAL                                                       |
| AdminDashboardArchitecture.md | SystemArchitecture, DesignSystem, AdminArchitecture                                                                                                                | AdminArchitecture                                                                                   |
| 05-SCREEN-FLOWS.md            | UserFlows, 06-UIUX                                                                                                                                                 | 06-UIUX, E2EStrategy                                                                                |
| 06-UIUX.md                    | 05-SCREEN-FLOWS, DesignTokens, UserFlows                                                                                                                           | DesignTokens, DesignSystem, 08l-MOTION-SYSTEM, InteractionPatterns, 08o-IMMERSIVE-EXPERIENCE        |
| MobileExperience.md           | ResponsiveStrategy, 06-UIUX, DesignSystem                                                                                                                          | ResponsiveStrategy, mobile-testing-strategy                                                         |
| ResponsiveStrategy.md         | MobileExperience, DesignSystem, AccessibilityArchitecture                                                                                                          | MobileExperience, 06-UIUX                                                                           |
| BrandGuidelines.md            | DesignTokens, DesignSystem                                                                                                                                         | DesignTokens, Iconography, IllustrationSystem                                                       |
| Iconography.md                | BrandGuidelines, DesignSystem                                                                                                                                      | BrandGuidelines                                                                                     |
| IllustrationSystem.md         | BrandGuidelines, DesignSystem, VisualExperienceSystem                                                                                                              | BrandGuidelines                                                                                     |
| Wireframes.md                 | 05-SCREEN-FLOWS, 06-UIUX                                                                                                                                           | 05-SCREEN-FLOWS                                                                                     |
| RenderingStrategy.md          | FrontendArchitecture, PerformanceArchitecture, ADR-005 (ISR)                                                                                                       | FrontendArchitecture, PerformanceArchitecture                                                       |
| VisualExperienceSystem.md     | DesignTokens, BrandGuidelines, IllustrationSystem                                                                                                                  | BrandGuidelines, DesignSystem                                                                       |

### Database Documents

| Document                       | References                                                               | Referenced By                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| DatabaseArchitecture.md        | SystemArchitecture, 10-TECHSTACK, ADR-004 (Supabase), ADR-007 (pgvector) | 08f-DATABASE-IMPLEMENTATION, DatabaseSchema, DataDictionary, DATA-MODEL, 48-SEARCH-ARCHITECTURE, developer-onboarding |
| 08f-DATABASE-IMPLEMENTATION.md | DatabaseArchitecture, BackendArchitecture, ADR-004                       | DatabaseArchitecture, 37-IMPLEMENTATION_PLAN                                                                          |
| DatabaseSchema.md              | DatabaseArchitecture, ERD, DATA-MODEL                                    | DatabaseArchitecture, 08f-DATABASE-IMPLEMENTATION                                                                     |
| DataDictionary.md              | DatabaseArchitecture, DatabaseSchema, DATA-DICTIONARY                    | DatabaseArchitecture                                                                                                  |
| DataRetention.md               | DatabaseArchitecture, 16-COMPLIANCE, 55-DISASTER-RECOVERY                | DatabaseArchitecture                                                                                                  |

### AI Documents

| Document                      | References                                                                                 | Referenced By                                                                                                                                                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 17-AI_INSTRUCTIONS.md         | 13-INTEGRATIONS, 19-RAG, SystemArchitecture                                                | 18-AGENTS, 19-RAG, AGENT.md, SKILLS.md, AGENT-MARKETPLACE, AGENT-REGISTRY, AGENT-CAPABILITIES, PROMPT-LIBRARY, KNOWLEDGE-ARCHITECTURE, MEMORY-ARCHITECTURE, WORKSPACE-ARCHITECTURE, CONTEXT-ARCHITECTURE, COMMAND-SYSTEM, AUTOMATION-ARCHITECTURE |
| 18-AGENTS.md                  | 17-AI_INSTRUCTIONS, SystemArchitecture                                                     | AGENT.md, SKILLS.md, AGENT-MARKETPLACE, AGENT-REGISTRY, AGENT-CAPABILITIES, AGENT-INTERACTION-PROTOCOL                                                                                                                                            |
| 19-RAG.md                     | 17-AI_INSTRUCTIONS, 18-AGENTS, ADR-007 (pgvector), 48-SEARCH-ARCHITECTURE                  | KNOWLEDGE-ARCHITECTURE, AGENT-CAPABILITIES, 48-SEARCH-ARCHITECTURE                                                                                                                                                                                |
| STRATEGY.md                   | SystemArchitecture, MODEL-DECISION-MATRIX, ADR-006 (FastAPI)                               | AI-OBSERVABILITY, AI-ARCHITECTURE, DATASET-DOCUMENTATION                                                                                                                                                                                          |
| MODEL-DECISION-MATRIX.md      | STRATEGY.md, CLAUDE-SONNET (model card), GPT4O (model card), TEXT-EMBEDDING-3 (model card) | STRATEGY.md, AI-ARCHITECTURE                                                                                                                                                                                                                      |
| AIObservability.md            | 17-AI_INSTRUCTIONS, 21-MONITORING, 22-OBSERVABILITY                                        | STRATEGY.md, ai-testing-strategy                                                                                                                                                                                                                  |
| AGENT.md                      | 17-AI_INSTRUCTIONS, 18-AGENTS, 19-RAG                                                      | AGENT-MARKETPLACE, AGENT-REGISTRY, AGENT-CAPABILITIES, AGENT-INTERACTION-PROTOCOL                                                                                                                                                                 |
| SKILLS.md                     | 17-AI_INSTRUCTIONS, 18-AGENTS                                                              | AGENT-REGISTRY, AGENT-CAPABILITIES, PROMPT-LIBRARY, PACKAGE-DEVELOPMENT                                                                                                                                                                           |
| AGENT-MARKETPLACE.md          | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md, AGENT-SECURITY                                    | AGENT-NETWORKING, MARKETPLACE-API-SPEC, PACKAGE-DEVELOPMENT                                                                                                                                                                                       |
| AGENT-REGISTRY.md             | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md, SKILLS.md                                         | AGENT-CAPABILITIES, AGENT-NETWORKING                                                                                                                                                                                                              |
| AGENT-CAPABILITIES.md         | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md, AGENT-REGISTRY                                    | SKILLS.md, PACKAGE-DEVELOPMENT                                                                                                                                                                                                                    |
| KNOWLEDGE-ARCHITECTURE.md     | 17-AI_INSTRUCTIONS, 18-AGENTS, 19-RAG                                                      | WORKSPACE-ARCHITECTURE, CONTEXT-ARCHITECTURE                                                                                                                                                                                                      |
| MEMORY-ARCHITECTURE.md        | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md                                                    | CONTEXT-ARCHITECTURE, COMMAND-SYSTEM                                                                                                                                                                                                              |
| WORKSPACE-ARCHITECTURE.md     | SystemArchitecture, 17-AI_INSTRUCTIONS, 18-AGENTS                                          | AUTOMATION-ARCHITECTURE                                                                                                                                                                                                                           |
| CONTEXT-ARCHITECTURE.md       | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md, MEMORY-ARCHITECTURE                               | COMMAND-SYSTEM, AUTOMATION-ARCHITECTURE                                                                                                                                                                                                           |
| COMMAND-SYSTEM.md             | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md, CONTEXT-ARCHITECTURE                              | AUTOMATION-ARCHITECTURE                                                                                                                                                                                                                           |
| AUTOMATION-ARCHITECTURE.md    | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md, COMMAND-SYSTEM, WORKSPACE-ARCHITECTURE            | AI-ARCHITECTURE                                                                                                                                                                                                                                   |
| PROMPT-LIBRARY.md             | 17-AI_INSTRUCTIONS, 18-AGENTS, SKILLS.md                                                   | AGENT-INTERACTION-PROTOCOL, PROMPT-VERSIONING                                                                                                                                                                                                     |
| AGENT-INTERACTION-PROTOCOL.md | PROMPT-LIBRARY, AGENT-NETWORKING, AGENT.md, 18-AGENTS                                      | AGENT-NETWORKING, AGENT-CAPABILITIES                                                                                                                                                                                                              |
| AGENT-NETWORKING.md           | 17-AI_INSTRUCTIONS, 18-AGENTS, AGENT.md, AGENT-MARKETPLACE                                 | AGENT-INTERACTION-PROTOCOL                                                                                                                                                                                                                        |
| MARKETPLACE-API-SPEC.md       | AGENT-MARKETPLACE, 12-API, APIContracts                                                    | AGENT-MARKETPLACE, PACKAGE-DEVELOPMENT                                                                                                                                                                                                            |
| PACKAGE-DEVELOPMENT.md        | AGENT-MARKETPLACE, AGENT.md, SKILLS.md                                                     | AGENT-CAPABILITIES                                                                                                                                                                                                                                |
| DATASET-DOCUMENTATION.md      | STRATEGY.md, 19-RAG                                                                        | STRATEGY.md                                                                                                                                                                                                                                       |
| PROMPT-VERSIONING.md          | PROMPT-LIBRARY, 17-AI_INSTRUCTIONS                                                         | PROMPT-LIBRARY                                                                                                                                                                                                                                    |
| AI-ARCHITECTURE.md            | STRATEGY.md, MODEL-DECISION-MATRIX, AUTOMATION-ARCHITECTURE                                | STRATEGY.md                                                                                                                                                                                                                                       |

### Governance Documents

| Document               | References                                                                  | Referenced By                                                                                       |
| ---------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 32-SKILL.md            | All docs (cross-cutting), SystemArchitecture, CodingStandards, GitStandards | 33-RATIFICATION, 34-CHEATSHEET, 35-AUDIT-REPORT, CodingStandards, GitStandards, all governance docs |
| 33-RATIFICATION.md     | 32-SKILL.md, AGENDA, MATERIALS                                              | 34-CHEATSHEET                                                                                       |
| 34-CHEATSHEET.md       | 32-SKILL.md                                                                 | 33-RATIFICATION                                                                                     |
| 35-AUDIT-REPORT.md     | 32-SKILL.md, 41-CODEBASE-STATE                                              | 40-AUDIT-REPORT-V2, 42-DOC-AUDIT-REPORT                                                             |
| 40-AUDIT-REPORT-V2.md  | 35-AUDIT-REPORT, MASTER-INDEX                                               | 41-CODEBASE-STATE, 42-DOC-AUDIT-REPORT                                                              |
| 41-CODEBASE-STATE.md   | MASTER-INDEX, 35-AUDIT-REPORT, 40-AUDIT-REPORT-V2                           | 40-AUDIT-REPORT-V2                                                                                  |
| 42-DOC-AUDIT-REPORT.md | MASTER-INDEX, 40-AUDIT-REPORT-V2                                            | 40-AUDIT-REPORT-V2                                                                                  |
| CodingStandards.md     | 32-SKILL.md, ArchitecturePrinciples, EngineeringPrinciples                  | engineering-playbook, GitStandards, code-review-standards                                           |
| GitStandards.md        | 32-SKILL.md, CodingStandards, branch-strategy                               | CodingStandards, branch-strategy                                                                    |
| DecisionLog.md         | ADR-001–018, 32-SKILL.md                                                    | All ADRs                                                                                            |

### Development Documents

| Document                     | References                                                                                   | Referenced By                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| engineering-playbook.md      | CodingStandards, code-review-standards, naming-conventions, branch-strategy, debugging-guide | developer-onboarding, 37-IMPLEMENTATION_PLAN    |
| code-review-standards.md     | CodingStandards, GitStandards, TestingArchitecture, SecurityTesting                          | engineering-playbook, CodeReviewChecklist       |
| naming-conventions.md        | CodingStandards, 32-SKILL.md                                                                 | engineering-playbook, code-review-standards     |
| branch-strategy.md           | GitStandards, 25-CICD, 53-CI-CD-PIPELINE                                                     | engineering-playbook, GitStandards              |
| debugging-guide.md           | local-dev-troubleshooting, docker-compose-quickstart, knowledge-base                         | engineering-playbook, developer-onboarding      |
| RFC-001-prisma-orm.md        | DatabaseArchitecture, ADR-004, Prisma                                                        | engineering-playbook, DatabaseArchitecture      |
| RFC-002-tanstack-query.md    | FrontendArchitecture, StateManagement, ADR-010                                               | engineering-playbook, FrontendArchitecture      |
| error-budget-policy.md       | 56-SLA-SLO, 21-MONITORING, PerformanceArchitecture                                           | engineering-playbook, 56-SLA-SLO                |
| developer-onboarding.md      | SystemArchitecture, 10-TECHSTACK, DatabaseArchitecture, 12-API, DevOpsArchitecture           | engineering-playbook                            |
| local-dev-troubleshooting.md | docker-compose-quickstart, knowledge-base                                                    | debugging-guide, developer-onboarding           |
| docker-compose-quickstart.md | local-dev-troubleshooting, DeploymentGuide                                                   | local-dev-troubleshooting, developer-onboarding |

### Product Documents

| Document                   | References                                                            | Referenced By                                                         |
| -------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| ProductRequirements.md     | 02-FEATURES, 03-USER-STORIES, user-journey-maps                       | 02-FEATURES, 03-USER-STORIES, UserFlows, okrs, 37-IMPLEMENTATION_PLAN |
| product-vision-expanded.md | ProductRequirements, ProjectVision, CompetitiveAnalysis               | ProjectVision, ProductStrategy                                        |
| 02-FEATURES.md             | ProductRequirements, 03-USER-STORIES                                  | ProductRequirements, 03-USER-STORIES, Backlog                         |
| 03-USER-STORIES.md         | ProductRequirements, 02-FEATURES, UserPersonas                        | UserFlows, user-journey-maps, Backlog                                 |
| UserFlows.md               | 03-USER-STORIES, 05-SCREEN-FLOWS                                      | 05-SCREEN-FLOWS                                                       |
| CompetitiveAnalysis.md     | ProductRequirements, ProductStrategy                                  | competitive-analysis-expanded, ProductStrategy                        |
| ProductStrategy.md         | CompetitiveAnalysis, ProductRequirements, FutureRoadmap               | ProductRoadmap, okrs                                                  |
| ProductRoadmap.md          | ProductStrategy, 36-ROADMAP, 37-IMPLEMENTATION_PLAN                   | 36-ROADMAP, FutureRoadmap                                             |
| UserPersonas.md            | UserResearch, user-journey-maps                                       | 03-USER-STORIES, user-journey-maps                                    |
| user-journey-maps.md       | UserPersonas, 03-USER-STORIES, UserFlows                              | UserPersonas, ProductRequirements                                     |
| future-roadmap.md          | ProductRoadmap, ProductStrategy                                       | ProductStrategy                                                       |
| okrs.md                    | ProductRequirements, ProductStrategy, 37-IMPLEMENTATION_PLAN          | ProductStrategy                                                       |
| 37-IMPLEMENTATION_PLAN.md  | All docs (01–36 inclusive), SystemArchitecture, Engineering documents | ProductionReadinessReview, okrs, ProductRoadmap                       |
| 36-ROADMAP.md              | ProductRequirements, 37-IMPLEMENTATION_PLAN                           | ProductRoadmap                                                        |
| ContentArchitecture.md     | 02-FEATURES, SEOArchitecture                                          | 61-LOCALIZATION, SEOArchitecture                                      |

### Runbook Documents

| Document              | References                                                                                                                                                                                            | Referenced By                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Runbooks.md (index)   | All runbooks (AlertingStrategy, BackupRecovery, IncidentManagement, IncidentResponse, Logging, MaintenanceGuide, MigrationStrategy, TracingStrategy, service-restart, ssl-renewal, database-failover) | operational-runbook-index                                             |
| AlertingStrategy.md   | 21-MONITORING, 56-SLA-SLO, incident-response-playbook                                                                                                                                                 | 21-MONITORING, operational-runbook-index                              |
| BackupRecovery.md     | 55-DISASTER-RECOVERY, DataRetention, database-failover                                                                                                                                                | 55-DISASTER-RECOVERY, operational-runbook-index, DatabaseArchitecture |
| IncidentManagement.md | incident-response-playbook, 21-MONITORING, incident-severity-criteria                                                                                                                                 | Runbooks, operational-runbook-index                                   |
| IncidentResponse.md   | incident-response-playbook, AlertingStrategy, on-call-schedule                                                                                                                                        | Runbooks, operational-runbook-index                                   |
| Logging.md            | 22-OBSERVABILITY, TracingStrategy, AuditLogging                                                                                                                                                       | 22-OBSERVABILITY, AuditLogging                                        |
| MaintenanceGuide.md   | DeploymentGuide, 54-INFRASTRUCTURE                                                                                                                                                                    | Runbooks                                                              |
| MigrationStrategy.md  | DatabaseArchitecture, 55-DISASTER-RECOVERY, database-migration-guide                                                                                                                                  | Runbooks                                                              |
| TracingStrategy.md    | 22-OBSERVABILITY, Logging, ADR-016 (Sentry)                                                                                                                                                           | 22-OBSERVABILITY, Logging                                             |
| service-restart.md    | 21-MONITORING, 54-INFRASTRUCTURE, DeploymentGuide                                                                                                                                                     | Runbooks, operational-runbook-index                                   |
| ssl-renewal.md        | DeploymentGuide, SecurityArchitecture, 12-API                                                                                                                                                         | Runbooks, operational-runbook-index                                   |
| database-failover.md  | 55-DISASTER-RECOVERY, DatabaseArchitecture, BackupRecovery                                                                                                                                            | 55-DISASTER-RECOVERY, BackupRecovery, operational-runbook-index       |

### Playbook Documents

| Document                            | References                                                                               | Referenced By                           |
| ----------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| rollback-playbook.md                | DeploymentGuide, deployment-strategy-blue-green, 25-CICD                                 | DeploymentGuide, 37-IMPLEMENTATION_PLAN |
| incident-communication-templates.md | incident-response-playbook, incident-severity-criteria, on-call-schedule                 | incident-response-playbook              |
| INCIDENT-RESPONSE-COMPILED.md       | incident-response-playbook, incident-communication-templates, incident-severity-criteria | incident-response-playbook              |

### Overview Documents

| Document                 | References                                                                             | Referenced By                                 |
| ------------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------- |
| EXECUTIVE-SUMMARY.md     | SystemArchitecture, ProductRequirements, SecurityArchitecture, PerformanceArchitecture | ARCHITECTURE-OVERVIEW, 37-IMPLEMENTATION_PLAN |
| ARCHITECTURE-OVERVIEW.md | SystemArchitecture, C4-Architecture, 10-TECHSTACK, SecurityArchitecture                | EXECUTIVE-SUMMARY, developer-onboarding       |

### Standards Documents

| Document                   | References                                                                         | Referenced By        |
| -------------------------- | ---------------------------------------------------------------------------------- | -------------------- |
| iso-25010-mapping.md       | NFRs, QualityAttributeScenarios, 30-QA                                             | 30-QA, NFRs          |
| twelve-factor-audit.md     | DevOpsArchitecture, DeploymentGuide, SystemArchitecture                            | DevOpsArchitecture   |
| well-architected-review.md | SystemArchitecture, SecurityArchitecture, PerformanceArchitecture, C4-Architecture | SystemArchitecture   |
| technical-design-doc.md    | SystemArchitecture, ADR-001–018, CodingStandards                                   | engineering-playbook |

### Requirements Documents

| Document                            | References                                                                                   | Referenced By                                            |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| FUNCTIONAL-REQUIREMENTS.md          | ProductRequirements, 02-FEATURES, 03-USER-STORIES                                            | REQUIREMENTS-TRACEABILITY-MATRIX, 37-IMPLEMENTATION_PLAN |
| NON-FUNCTIONAL-REQUIREMENTS.md      | SystemArchitecture, PerformanceArchitecture, SecurityArchitecture, AccessibilityArchitecture | REQUIREMENTS-TRACEABILITY-MATRIX, iso-25010-mapping      |
| QUALITY-ATTRIBUTE-SCENARIOS.md      | NFRs, TestingArchitecture                                                                    | NFRs, TestingArchitecture                                |
| REQUIREMENTS-TRACEABILITY-MATRIX.md | FUNCTIONAL-REQUIREMENTS, NFRs, QUALITY-ATTRIBUTE-SCENARIOS, all implementation docs          | 37-IMPLEMENTATION_PLAN                                   |

### DevOps Documents

| Document                      | References                                                        | Referenced By                           |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| CI-CD-IMPLEMENTATION-GUIDE.md | 25-CICD, 53-CI-CD-PIPELINE, test-strategy-master-plan             | 25-CICD, 53-CI-CD-PIPELINE              |
| container-strategy.md         | DevOpsArchitecture, ADR-015 (Docker multi-stage), DeploymentGuide | DevOpsArchitecture                      |
| environment-matrix.md         | DevOpsArchitecture, EnvironmentStrategy, DeploymentGuide          | DevOpsArchitecture, EnvironmentStrategy |
| infrastructure-diagram.md     | 54-INFRASTRUCTURE, DevOpsArchitecture, DeploymentGuide            | 54-INFRASTRUCTURE                       |
| capacity-planning.md          | DevOpsArchitecture, 58-COST-MANAGEMENT, PerformanceArchitecture   | DevOpsArchitecture                      |

### Other Documents

| Document                                  | References                                                                                           | Referenced By                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| glossary.md                               | All docs (terminology reference)                                                                     | All docs                                      |
| DEDUP-PLAN.md                             | MASTER-INDEX, archive/\*                                                                             | MASTER-INDEX                                  |
| postman-collection.json                   | 12-API, openapi.json                                                                                 | 12-API                                        |
| api-changelog.md                          | 12-API, APIContracts, ErrorHandling                                                                  | 12-API                                        |
| AGENDA.md                                 | 32-SKILL.md, 33-RATIFICATION                                                                         | 33-RATIFICATION                               |
| MATERIALS.md                              | 32-SKILL.md, 33-RATIFICATION, AGENDA                                                                 | 33-RATIFICATION                               |
| CHANGELOG.md (root)                       | All docs (version history)                                                                           | All docs                                      |
| CONTRIBUTING.md                           | CodingStandards, GitStandards, engineering-playbook                                                  | Developer onboarding                          |
| CODE_OF_CONDUCT.md                        | 32-SKILL.md                                                                                          | CONTRIBUTING                                  |
| feature-flag-guide.md                     | 60-FEATURE-FLAGS, DesignSystem, FrontendArchitecture                                                 | 60-FEATURE-FLAGS                              |
| api-versioning.md                         | 12-API, APIContracts, DeploymentGuide                                                                | 12-API                                        |
| database-migration-guide.md               | DatabaseArchitecture, MigrationStrategy, Prisma (RFC-001)                                            | DatabaseArchitecture, engineering-playbook    |
| CROSS-REFERENCE-INDEX.md                  | All docs (this file)                                                                                 | MASTER-INDEX                                  |
| PRODUCTION-GO-LIVE-CHECKLIST.md           | ProductionReadinessReview, DeploymentGuide, LaunchPlan, SecurityHardeningPlan, TestingImplementation | ProductionReadinessReview                     |
| PERFORMANCE-BENCHMARKS.md                 | PerformanceArchitecture, PerformanceTesting, load-test-specification, PerformanceOptimization        | PerformanceArchitecture                       |
| ADMIN-USER-MANUAL.md                      | AdminArchitecture, AdminDashboardArchitecture                                                        | AdminArchitecture                             |
| ERROR-BUDGET-POLICY.md                    | 56-SLA-SLO, 21-MONITORING, PerformanceArchitecture                                                   | 56-SLA-SLO                                    |
| BUSINESS-CONTINUITY.md                    | 55-DISASTER-RECOVERY, BackupRecovery, DataRetention                                                  | 55-DISASTER-RECOVERY                          |
| SECURITY-INCIDENT-RUNBOOK.md              | incident-response-playbook, 21-MONITORING, SecurityArchitecture                                      | incident-response-playbook                    |
| SECRETS-MANAGEMENT-IMPLEMENTATION.md      | SecretsManagement, secrets-rotation-schedule, SecurityArchitecture                                   | SecretsManagement                             |
| THREAT-MODEL.md                           | ThreatModel, SecurityArchitecture                                                                    | SecurityArchitecture                          |
| DATA-DICTIONARY.md                        | DataDictionary, DatabaseArchitecture                                                                 | DataDictionary                                |
| UNIT-TESTING-GUIDE.md                     | TestingArchitecture, TestingImplementation, FrontendTestingStrategy                                  | TestingArchitecture                           |
| performance-budget.md                     | PerformanceArchitecture, PerformanceOptimization                                                     | PerformanceArchitecture                       |
| Circadian-Theme-Engine.md                 | DesignSystem, DesignTokens, 08l-MOTION-SYSTEM                                                        | DesignSystem                                  |
| Sandbox-AI-IDE.md                         | 17-AI_INSTRUCTIONS, SystemArchitecture                                                               | 17-AI_INSTRUCTIONS                            |
| UNIT-TESTING-GUIDE.md                     | TestingArchitecture, TestingImplementation, FrontendTestingStrategy                                  | TestingArchitecture                           |
| CI-CD-IMPLEMENTATION-GUIDE.md             | 25-CICD, 53-CI-CD-PIPELINE, test-strategy-master-plan                                                | 25-CICD                                       |
| RENDERING-STRATEGY.md (07-frontend)       | FrontendArchitecture, PerformanceArchitecture, ADR-005 (ISR)                                         | FrontendArchitecture, PerformanceArchitecture |
| COMPONENT-LIBRARY.md (07-frontend)        | FrontendArchitecture, DesignSystem, ComponentStandards                                               | FrontendArchitecture, COMPONENT-STANDARDS     |
| COMPONENT-STANDARDS.md (07-frontend)      | FrontendArchitecture, ComponentStandards, CodingStandards                                            | COMPONENT-LIBRARY, DESIGN-SYSTEM-EXTENDED     |
| DESIGN-SYSTEM-EXTENDED.md (07-frontend)   | DesignSystem, DesignTokens, ComponentLibrary                                                         | FRONTEND-ARCHITECTURE, COMPONENT-LIBRARY      |
| VISUAL-EXPERIENCE-SYSTEM.md (07-frontend) | 3D-ARCHITECTURE, MOTION-SYSTEM, NEUMORPHISM                                                          | FRONTEND-ARCHITECTURE                         |
| 3D-USAGE-GUIDELINES.md (07-frontend)      | 3D-ARCHITECTURE, MOTION-SYSTEM, NEUMORPHISM                                                          | FRONTEND-ARCHITECTURE                         |
| MOTION-SYSTEM.md (07-frontend)            | 3D-ARCHITECTURE, 3D-USAGE-GUIDELINES, NEUMORPHISM                                                    | FRONTEND-ARCHITECTURE, AnimationArchitecture  |
| NEUMORPHISM.md (07-frontend)              | 3D-ARCHITECTURE, 3D-USAGE-GUIDELINES, MOTION-SYSTEM                                                  | FRONTEND-ARCHITECTURE, DesignSystem           |
| CMS-ARCHITECTURE.md (20-cms)              | CONTENT-MODEL, IMAGE-MANAGEMENT, SANDBOX-IDE, AdminArchitecture                                      | CONTENT-MODEL, IMAGE-MANAGEMENT               |
| CONTENT-MODEL.md (20-cms)                 | CMS-ARCHITECTURE, IMAGE-MANAGEMENT, DATA-MODEL                                                       | CMS-ARCHITECTURE                              |
| IMAGE-MANAGEMENT.md (20-cms)              | CMS-ARCHITECTURE, CONTENT-MODEL, PerformanceArchitecture                                             | CMS-ARCHITECTURE                              |
| SANDBOX-IDE.md (20-cms)                   | CMS-ARCHITECTURE, CONTENT-MODEL, 17-AI_INSTRUCTIONS                                                  | CMS-ARCHITECTURE                              |
| CIRCADIAN-THEME.md (37-future)            | DesignSystem, DesignTokens, MOTION-SYSTEM, 3D-ARCHITECTURE                                           | DesignSystem                                  |

## Orphan Documents

**Status: 0 orphans** — all documents have cross-references. Last verified July 2026.

## Highly Connected Documents (Hubs)

Top 10 most-referenced documents — these are critical documentation hubs:

| Rank | Document                   | Times Referenced | Category      |
| ---- | -------------------------- | ---------------- | ------------- |
| 1    | SystemArchitecture.md      | 28               | Architecture  |
| 2    | 17-AI_INSTRUCTIONS.md      | 24               | AI            |
| 3    | SecurityArchitecture.md    | 18               | Security      |
| 4    | DeploymentGuide.md         | 17               | Operations    |
| 5    | TestingArchitecture.md     | 16               | Testing       |
| 6    | DesignSystem.md            | 14               | Design        |
| 7    | FrontendArchitecture.md    | 13               | Design        |
| 8    | 21-MONITORING.md           | 12               | Observability |
| 9    | 32-SKILL.md (Constitution) | 12               | Governance    |
| 10   | DevOpsArchitecture.md      | 11               | Operations    |

## Missing Cross-References

Specific documents that should reference each other but currently don't:

| Source Doc                    | Target Doc                     | Why Needed                                           |
| ----------------------------- | ------------------------------ | ---------------------------------------------------- |
| performance-budget.md         | PerformanceArchitecture.md     | Budget should reference architecture targets         |
| performance-benchmarks.md     | PerformanceArchitecture.md     | Benchmarks should validate architecture targets      |
| load-test-specification.md    | PerformanceTesting.md          | Load tests are a type of performance test            |
| visual-regression-testing.md  | ComponentLibrary.md            | Visual tests should reference component library      |
| api-versioning.md             | 12-API.md                      | Versioning is part of API specification              |
| database-migration-guide.md   | 08f-DATABASE-IMPLEMENTATION.md | Migration guide should reference implementation      |
| feature-flag-guide.md         | 60-FEATURE-FLAGS.md            | Feature flag guide should reference operations doc   |
| AdminDashboardArchitecture.md | ADMIN-USER-MANUAL.md           | Admin architecture docs should reference user manual |
| Capacity-planning.md          | 58-COST-MANAGEMENT.md          | Capacity and cost management are related             |
| debugging-guide.md            | 21-MONITORING.md               | Debugging should reference monitoring and logging    |
| postman-collection.json       | openapi.json                   | Postman collection should reference the OpenAPI spec |

---

_End of Document — Cross-Reference Index v1.0_
