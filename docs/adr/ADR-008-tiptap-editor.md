# ADR-008: TipTap for Rich Text Editor

> **Status:** Accepted | **Date:** 2026-06-17 | **Author:** Architecture Board  
> **Deciders:** Staff Frontend Architect, Principal UX Architect  
> **Reference:** [SystemArchitecture.md §5.2](../architecture/SystemArchitecture.md)

## Context

The admin CMS needs a rich text editor for blog posts and section content. Requirements: markdown support, code block syntax highlighting, image embedding, collaborative-ready architecture, extensible with custom blocks, and JSON output format (stored as JSONB in PostgreSQL).

## Decision

We adopt **TipTap** as the rich text editor.

## Options Considered

| Option         | Pros                                                                                                                                                     | Cons                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **TipTap** ✅  | ProseMirror-based (production-proven), headless (full styling control), JSON output, extensible node/mark system, React integration, collaborative-ready | Learning curve for custom extensions, premium features require paid plan |
| **Quill**      | Simple, good defaults, Delta format                                                                                                                      | Limited extensibility, aging codebase, React wrapper issues              |
| **Draft.js**   | Facebook-backed, React-native, immutable data model                                                                                                      | Complex API, declining maintenance, heavy bundle                         |
| **Plate**      | TipTap alternative, React-first, plugin system                                                                                                           | Smaller community, less documentation, newer                             |
| **MDX Editor** | Markdown-native, component embedding                                                                                                                     | Too specialized for CMS use case, limited rich formatting                |

## Consequences

### Positive

- Headless architecture allows full design system integration (no style conflicts)
- JSON output stored directly in PostgreSQL JSONB columns
- Custom extensions for portfolio-specific blocks (project cards, code demos, metrics)
- ProseMirror foundation is battle-tested (used by Atlassian, GitLab, NY Times)

### Negative

- Premium features (collaboration, AI suggestions) require TipTap Cloud ($)
- Custom extension development has steeper learning curve than config-based editors
- Bundle size ~50KB gzipped (acceptable for admin-only)

## Compliance

- Aligns with Constitution §5.2: "Headless editor with structured output"
