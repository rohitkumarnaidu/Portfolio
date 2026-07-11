# Accessibility Checklist

> **Document:** `ACCESSIBILITY-CHECKLIST.md` | **Version:** 1.0 | **Last Updated:** July 2026
> Quick-reference for design, development, and QA stages.

---

## Pre-Development (Design Review)

- [ ] Color contrast verified for all new token pairs (≥ 4.5:1 normal, ≥ 3:1 large text)
- [ ] Focus states designed with visible 2px indicator (accent color, 2px offset)
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Content not conveyed by color alone (icons + text supplement color)
- [ ] Heading hierarchy defined (h1 → h2 → h3, no skipped levels)
- [ ] Semantic landmark elements identified (header, nav, main, footer)

## During Development

- [ ] Semantic HTML used over generic `<div>`s (landmarks, lists, headings)
- [ ] ARIA labels added where native semantics are insufficient
- [ ] All form inputs have visible `<label>` with `for` attribute
- [ ] Keyboard handlers implemented: Enter, Space, Escape, Arrow keys
- [ ] `alt` text on all informative images; `alt=""` on decorative images
- [ ] Dynamic content changes use `aria-live` regions (polite or assertive)
- [ ] `autocomplete` attributes on form fields for input purpose identification
- [ ] Error messages linked via `aria-describedby` with `aria-invalid`
- [ ] Skip-to-content link is first tabbable element on every page
- [ ] `prefers-reduced-motion` respected (CSS + JS animation fallbacks)
- [ ] `:focus-visible` used instead of `:focus` to avoid mouse focus rings

## Pre-PR

- [ ] axe-core scan passes with 0 violations on all changed pages
- [ ] Keyboard navigation verified: all interactive elements reachable and operable
- [ ] No keyboard traps — focus cycles within modals and returns to trigger on close
- [ ] Focus order matches visual layout (no positive `tabindex` values)
- [ ] Reduced motion: animations disabled when `prefers-reduced-motion: reduce`
- [ ] ESLint jsx-a11y rules pass (pre-commit hook)
- [ ] Color contrast checked on any new components/tokens

## Pre-Deploy

- [ ] Lighthouse a11y score ≥ 90 (CI gate)
- [ ] Screen reader test passes for all new or changed flows (NVDA + VoiceOver)
- [ ] Zoom test at 200%: no content loss or horizontal scrolling
- [ ] All interactive components work at 400% zoom on mobile viewport
- [ ] No new axe violations introduced

## Quarterly

- [ ] Full WCAG 2.2 AA audit against all 35 criteria (see `ACCESSIBILITY-TESTING-GUIDE.md §3`)
- [ ] Expert screen reader audit with JAWS (Windows) + TalkBack (Android)
- [ ] Design token color contrast re-verification
- [ ] Accessibility statement updated with current status
- [ ] Known issues register reviewed and remediated
- [ ] User testing with assistive technologies conducted

---

## Related

| Resource | Location |
|----------|----------|
| Full testing guide | `docs/16-accessibility/ACCESSIBILITY-TESTING-GUIDE.md` |
| Architecture & component specs | `docs/16-accessibility/ACCESSIBILITY-ARCHITECTURE.md` |
| WCAG compliance statement | `docs/16-accessibility/WCAG-STATEMENT.md` |
