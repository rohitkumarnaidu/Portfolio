# Component Standards — FAANG Enterprise React Architecture

> **Document:** `ComponentStandards.md` | **Version:** 5.0 (Enterprise Upgrade) | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal UX Engineer | **Review Cadence:** Quarterly  

## 1. Executive Summary
This document enforces FAANG-tier React component design, strictly mandating SOLID principles, atomic design hierarchy, and rendering optimization strategies for Next.js 14 Server Components and Client Components.

## 2. Directory Structure
```text
src/components/
├── ui/              # Base Atomic Components (Buttons, Inputs)
├── sections/        # Page-level Sections (Hero, Features)
├── 3d/              # R3F Canvas and Models
└── admin/           # Dashboard-specific components
```

## 3. Component Contract
- **Props Definition:** MUST use `zod` for validation and extract types or strictly define TS interfaces.
- **Server vs Client:** Components MUST be Server Components by default. Add `"use client"` only at the leaf nodes where interactivity, hooks (`useState`, `useEffect`), or browser APIs are required.
- **Performance:** Memoize expensive calculations. Suspend appropriately.
- **Accessibility:** Ensure ARIA attributes and keyboard navigation are fully implemented.

## 4. Implementation Guidelines
- Prefer CSS Modules or Tailwind.
- Enforce strict typing.
- No business logic inside presentation components. Use custom hooks for complex state.
