> **Status:** ⚠️ Partially Implemented — some aspects are aspirational

# Prompt Versioning Guide

## Overview
How prompts are versioned, stored, and deployed in the AI system.

## Prompt Storage Format
Prompts are stored in the PromptLibrary as versioned markdown files:

```
docs/ai/prompts/
  v1/
    system-prompt.md
    greeting.md
    portfolio-query.md
  v2/
    system-prompt.md
    portfolio-query.md
```

## Versioning Scheme
- **Semantic versioning:** MAJOR.MINOR.PATCH
- **MAJOR:** Breaking change to prompt behavior
- **MINOR:** Non-breaking addition or refinement
- **PATCH:** Fix, grammar, formatting

## Prompt Registry
Each prompt is registered in a central prompt registry with:
- Unique ID
- Name
- Version
- Description
- Target model
- Created/last modified dates
- Author

## CI/CD Integration
- Prompt changes go through PR review
- Automated testing: verify prompt renders correctly
- Canary deployment: test with % of traffic
- Rollback: git revert + redeploy

## Testing
- Unit tests: verify prompt template renders with expected variables
- Integration tests: verify prompt produces expected output format
- Evaluation: compare versions on test dataset

## Change Log
Each prompt version should document:
- What changed
- Why it changed
- Impact on model behavior
- Author and reviewer

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) Ã¢â‚¬â€ Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) Ã¢â‚¬â€ Cross-reference system
