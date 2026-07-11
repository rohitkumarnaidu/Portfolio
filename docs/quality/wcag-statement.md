# Accessibility Statement

> **Document:** `wcag-statement.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Published | **Standard:** WCAG 2.2 Level AA
> **Review Cadence:** Quarterly | **Next Review:** October 2026

---

## Commitment

Portfolio is committed to ensuring digital accessibility for all users, regardless of ability. We believe that every individual deserves equal access to information and functionality. This commitment is embedded in our development lifecycle — accessibility is not an afterthought or a compliance checkbox; it is a core design principle verified at every stage from component architecture through production monitoring.

We aim to make our platform perceivable, operable, understandable, and robust for the widest possible audience, including users of assistive technologies such as screen readers, speech recognition software, and keyboard-only navigation.

---

## Conformance Status

The Web Content Accessibility Guidelines (WCAG) 2.2 define requirements for designers and developers to improve accessibility for people with disabilities. This platform aims to conform to **WCAG 2.2 Level AA**.

| Standard | Target Status | Current Status | Verification Method |
|----------|--------------|----------------|---------------------|
| WCAG 2.2 Level A | 100% | ✅ In progress | Automated + manual audit |
| WCAG 2.2 Level AA | 100% | ✅ In progress | Automated + manual audit |
| WCAG 2.2 Level AAA | Where feasible | 🔄 Partial | Manual expert review |

---

## Current Status

| Metric | Value |
|--------|-------|
| **Overall Compliance Target** | WCAG 2.2 AA |
| **Lighthouse Accessibility Score** | ≥ 95 (target) |
| **axe-core Violations** | 0 (target) |
| **Keyboard Navigable** | 100% of interactive elements |
| **Focus Indicators Visible** | All interactive elements |
| **Color Contrast Ratio** | ≥ 4.5:1 (normal text), ≥ 3:1 (large text) |
| **Screen Reader Compatible** | NVDA, VoiceOver, JAWS |
| **Reduced Motion Support** | Implemented via `prefers-reduced-motion` |
| **Last Evaluation** | July 2026 |
| **Next Evaluation** | October 2026 |

---

## Evaluation Approach

### Automated Testing

- **Tool:** axe-core via Playwright (integrated into CI/CD pipeline)
- **Scope:** Every pull request triggers automated a11y tests across all page templates
- **Threshold:** Zero violations permitted for merge (P0 blocker in QA gate model)
- **Frequency:** Every commit on feature branches + nightly full scan

### Manual Testing

| Method | Tools | Frequency | Scope |
|--------|-------|-----------|-------|
| Screen reader testing | NVDA (Windows), VoiceOver (macOS), JAWS (Windows) | Per release | All user flows, interactive components |
| Keyboard-only navigation | Native browser keyboard | Per PR | Tab order, focus trapping, skip links |
| Zoom and magnification | Browser zoom (200%, 400%), OS magnifier | Per release | Content reflow, readability |
| Motion sensitivity | `prefers-reduced-motion` toggle | Per release | Animation fallbacks |
| Color contrast verification | Contrast Ratio tools, token-level verification | Per design review | All color pairings |

### Color Contrast Verification

Contrast ratios are verified at the **design token level** rather than per-component, ensuring systemic compliance:

| Token Type | Ratio Requirement | Verification |
|------------|-------------------|-------------|
| Text on background | ≥ 4.5:1 (AA normal text) | Design token CI check |
| Large text (≥ 18px bold / ≥ 24px regular) | ≥ 3:1 | Design token CI check |
| UI components and graphical objects | ≥ 3:1 | Component-level test |
| Focus indicators | ≥ 3:1 against adjacent colors | Component-level test |

### Motion Support

The platform respects `prefers-reduced-motion` at multiple layers:
- CSS media query: Disables non-essential animations
- JavaScript (Framer Motion, GSAP): Reduces or eliminates motion based on user preference
- Three.js scenes: Suspends animation loops when reduced motion is detected

---

## Accessibility Features

### Semantic HTML

| Feature | Implementation |
|---------|---------------|
| Landmarks | `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` throughout |
| Heading hierarchy | Properly nested `h1`–`h6` with no gaps |
| Lists | Native `<ul>` / `<ol>` for list content |
| Tables | `<table>` with `<caption>`, `<thead>`, `<th scope>` for data tables |
| Forms | Native `<form>`, `<label>` associated with `<input>`, `<fieldset>`, `<legend>` for groups |

### ARIA Patterns

All interactive components use ARIA patterns from the WAI-ARIA Authoring Practices Guide:

| Component | ARIA Pattern | Role/States |
|-----------|-------------|-------------|
| Navigation | `aria-current="page"` on active link | Menu / menubar |
| Modals / Dialogs | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` | Focus trap, escape to close |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` | Arrow key navigation |
| Accordions | `role="button"`, `aria-expanded`, `aria-controls` | Enter/Space to toggle |
| Tooltips | `role="tooltip"`, `aria-describedby` | Hover and focus trigger |
| Alerts / Toast | `role="alert"`, `aria-live="polite"` | Auto-announcement |
| Skip links | Same-page anchor to `#main-content` | First tabbable element |

### Keyboard Navigation

- All interactive elements are reachable via sequential keyboard navigation
- Visible focus indicators with 3:1 minimum contrast ratio
- No keyboard traps — modals trap focus within but close with Escape
- Custom widgets follow WAI-ARIA keyboard patterns (arrow keys, Home/End where applicable)

### Focus Management

- Focus is programmatically moved to new content (modals, page transitions, dynamic updates)
- Focus is returned to the triggering element when dismissed (modals, drawers)
- `:focus-visible` used for keyboard-only focus indicators (no mouse focus rings)
- Skip-to-content link is the first focusable element on every page

### Forms and Inputs

- Every input has an associated `<label>` (visible, not placeholder-only)
- Required fields indicated with `aria-required="true"` and visible asterisk
- Error messages linked via `aria-describedby` and `aria-invalid`
- Success and error announcements via `aria-live` region
- Form validation is accessible: inline errors, error summary at form top, focus moved to first error

### Reduced Motion

- CSS `@media (prefers-reduced-motion: reduce)` disables animations site-wide
- Framer Motion components check `reducedMotion` context
- Three.js 3D scenes respect motion preference and pause animation loops
- GSAP animations respect reduced motion and snap to end state

---

## Technical Specifications

This statement is supported by a comprehensive accessibility architecture documented in `docs/quality/AccessibilityArchitecture.md`, which provides:

| Document Section | Content |
|-----------------|---------|
| **§1–2** | Accessibility vision, north star, and strategic objectives |
| **§3** | Full WCAG 2.2 criteria compliance matrix (A, AA, AAA) |
| **§4** | Technology stack for accessibility (Radix UI, Tailwind, Framer Motion) |
| **§5** | Semantic HTML foundation and landmark structure |
| **§6** | Keyboard navigation specifications |
| **§7** | Screen reader support and ARIA implementation |
| **§8** | Color and contrast system with token-level ratios |
| **§9** | Motion and animation accessibility |
| **§10** | Focus management strategy |
| **§11–12** | Forms, inputs, error handling, and validation accessibility |
| **§14** | ARIA implementation patterns per component |
| **§16** | Component-level accessibility specifications |
| **§17** | Screen reader optimization catalog |
| **§18** | Testing strategy (automated + manual + CI integration) |
| **§19** | Full compliance checklist with pass/fail/partial status |
| **§20–21** | Governance, monitoring, and auditing standards |

---

## Known Limitations

| Issue | Impact | Planned Remediation | Target |
|-------|--------|-------------------|--------|
| Third-party embedded content (if any) | May not meet all WCAG criteria | Evaluate alternatives or provide accessible fallback | Q4 2026 |
| Complex 3D visualizations | May be difficult to perceive for some users | Text alternatives, descriptive captions, simplified 2D mode | Q4 2026 |
| PDF documents (if hosted) | May not be fully accessible | Provide HTML alternatives alongside PDFs | Q4 2026 |

---

## Feedback

We welcome feedback on the accessibility of the Portfolio platform. If you encounter accessibility barriers or have suggestions for improvement, please contact us:

| Channel | Contact |
|---------|---------|
| **Email** | accessibility@portfolio.dev |
| **Response SLA** | 5 business days for initial acknowledgment |

We will respond within 5 business days and address reported issues in accordance with our accessibility governance process.

---

## Enforcement and Governance

This statement is reviewed **quarterly** as part of the QA governance process (`docs/quality/30-QA.md`). The review encompasses:

1. Re-audit automated test results (axe-core violations trend)
2. Review manual test findings from previous quarter
3. Update known issues register
4. Assess new features for accessibility compliance before release
5. Verify color contrast of any new design tokens
6. Confirm screen reader compatibility of any new components

The Accessibility Architecture (`docs/quality/AccessibilityArchitecture.md`) is owned by the Principal Accessibility Expert with monthly review cadence. All accessibility violations are tracked as bugs in the project management system, with **P0/P1 status** for any WCAG A or AA failure.

---

## Related Documents

| Document | Location |
|----------|----------|
| Accessibility Architecture | `docs/quality/AccessibilityArchitecture.md` |
| QA Framework | `docs/quality/30-QA.md` |
| Testing Architecture | `docs/quality/TestingArchitecture.md` |
| Definition of Done | `docs/quality/DefinitionOfDone.md` |
| Code Review Checklist | `docs/quality/CodeReviewChecklist.md` |

---

## Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | July 2026 | Accessibility Lead | Initial WCAG 2.2 AA compliance statement |
