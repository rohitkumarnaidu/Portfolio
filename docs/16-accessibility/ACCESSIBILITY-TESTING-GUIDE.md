# Accessibility Testing Guide

> **Document:** `ACCESSIBILITY-TESTING-GUIDE.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Parent Document:** `ACCESSIBILITY-ARCHITECTURE.md` — practical testing companion
> **WCAG Statement:** `WCAG-STATEMENT.md`

---

## 1. Automated Testing

### Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| **axe-core** (`@axe-core/react`) | WCAG violation detection | Playwright tests run `axe` on every page template per PR |
| **Lighthouse Accessibility** | Scoring (0-100) | CI pipeline evaluates every deploy; threshold ≥ 90 |
| **eslint-plugin-jsx-a11y** | Static analysis in editor | Pre-commit hook, IDE warnings during development |
| **W3C HTML Validator** | HTML parsing validity | CI check on build output |

### What Automated Tests Catch

- Missing or empty `alt` text on images
- Insufficient color contrast (AA: 4.5:1 normal, 3:1 large text)
- Missing ARIA labels on interactive elements
- Duplicate IDs in the DOM
- Incorrect heading hierarchy (skipped levels)
- Missing form labels (`<label>` associated with `<input>`)
- `aria-*` attribute misuse or invalid values
- Missing `lang` attribute on `<html>`

### What Automated Tests Miss

- Whether keyboard navigation order is logical (not just present)
- Whether screen reader announcements make sense in context
- Whether focus management is correct (no lost focus, correct restoration)
- Whether error messages are helpful and clear
- Whether custom interactions have proper screen reader descriptions
- Whether reduced motion fallbacks are visually acceptable

### CI Integration

```
Every PR:
  1. Playwright + axe-core scans all public page templates
  2. Lighthouse CI collects a11y score (threshold: ≥ 90)
  3. ESLint jsx-a11y checks pass (pre-commit hook)
  4. Build fails if any axe violation found (P0 blocker)
```

---

## 2. Manual Testing

### 2.1 Keyboard Navigation

Test every critical user flow using keyboard only:

| Test | Method | Pass Criteria |
|------|--------|--------------|
| Tab through all interactive elements | Press Tab repeatedly | Every link, button, input, and control is reachable |
| Reverse navigation | Shift+Tab | Same elements reachable in reverse order |
| Skip link | Press Tab on page load | First tab press reveals "Skip to main content" link; activates on Enter |
| Modal focus trap | Open modal, Tab repeatedly | Focus cycles within modal; Esc closes and focus returns to trigger |
| Dropdown menus | Enter/Space to open, Arrow keys to navigate, Esc to close | Follows WAI-ARIA keyboard pattern |
| Form submission | Tab through fields, Enter to submit | Focus moves to first invalid field on error |
| Custom controls | Arrow keys, Home/End for carousels/tabs | WAI-ARIA expected behavior |

**Focus indicator verification:** Every interactive element must show a visible 2px ring (accent color, 2px offset) via `:focus-visible`. No focus rings on mouse click.

### 2.2 Screen Reader Testing

| Screen Reader | OS | Browser | Test Frequency | Flows to Test |
|--------------|----|---------|---------------|--------------|
| NVDA | Windows | Firefox | Every PR | Navigation, modal, form submission, dynamic content updates |
| VoiceOver | macOS | Safari | Every PR | Same flows + gesture navigation on trackpad |
| JAWS | Windows | Chrome | Quarterly | Regression on critical flows |

**Screen reader test checklist per flow:**
1. Page title is announced on load
2. Skip link is announced and functional
3. Landmarks are announced (`banner`, `navigation`, `main`, `contentinfo`)
4. Headings provide a logical outline of page content
5. Links are announced with clear purpose (no "click here")
6. Images with `alt=""` are skipped; informative images have description
7. Form fields announce label, type, required state, and error state
8. Dynamic content changes are announced via `aria-live` regions
9. Modal/dialog title and description are announced on open
10. Status messages (success, error, loading) are announced

### 2.3 Color Contrast

| Text Type | Required Ratio | Verification Method |
|-----------|---------------|-------------------|
| Normal text (< 18px bold / < 24px regular) | ≥ 4.5:1 | Design token CI check + axe DevTools |
| Large text (≥ 18px bold / ≥ 24px regular) | ≥ 3:1 | Design token CI check |
| UI components and graphical objects | ≥ 3:1 | Component-level manual check |
| Focus indicators | ≥ 3:1 against adjacent colors | Manual check per component |

Contrast is verified at the design token level (see `ACCESSIBILITY-ARCHITECTURE.md §8`). Any new color pair must be added to the token matrix.

### 2.4 Zoom Testing

- Zoom browser to 200% — verify no content is cut off, no horizontal scrolling appears
- Zoom to 400% — verify core functionality remains usable
- Test on mobile viewport at 200% zoom

### 2.5 Reduced Motion

- Enable `prefers-reduced-motion: reduce` in OS/browser dev tools
- Verify all CSS animations are disabled (or snapped to end state)
- Verify Framer Motion and GSAP animations respect the preference
- Verify Three.js 3D scenes pause or render static

---

## 3. WCAG 2.2 AA Compliance Checklist

### Perceivable

- [ ] 1.1.1 Non-text Content — all images have alt text; icons have `aria-label` or `aria-hidden`
- [ ] 1.3.1 Info and Relationships — semantic HTML, proper heading nesting, ARIA landmarks
- [ ] 1.3.2 Meaningful Sequence — DOM order matches visual order
- [ ] 1.3.4 Orientation — content works in portrait and landscape
- [ ] 1.3.5 Identify Input Purpose — `autocomplete` attributes on form fields
- [ ] 1.4.1 Use of Color — information not conveyed by color alone
- [ ] 1.4.3 Contrast (Minimum) — 4.5:1 normal text, 3:1 large text
- [ ] 1.4.4 Resize Text — 200% zoom without loss
- [ ] 1.4.10 Reflow — no horizontal scroll at 320px width
- [ ] 1.4.11 Non-text Contrast — UI components ≥ 3:1
- [ ] 1.4.12 Text Spacing — no loss with spacing overrides
- [ ] 1.4.13 Content on Hover or Focus — dismissible, hoverable, persistent

### Operable

- [ ] 2.1.1 Keyboard — all functionality via keyboard
- [ ] 2.1.2 No Keyboard Trap — focus cycles properly in modals
- [ ] 2.4.1 Bypass Blocks — skip link present
- [ ] 2.4.2 Page Titled — unique descriptive title per page
- [ ] 2.4.3 Focus Order — tab order matches visual order
- [ ] 2.4.4 Link Purpose (In Context) — link text describes destination
- [ ] 2.4.5 Multiple Ways — nav, search, breadcrumbs
- [ ] 2.4.6 Headings and Labels — descriptive headings and labels
- [ ] 2.4.7 Focus Visible — 2px ring via `:focus-visible`
- [ ] 2.4.11 Focus Not Obscured (AA) — no hidden focus indicators
- [ ] 2.5.2 Pointer Cancellation — up-event required for activation
- [ ] 2.5.3 Label in Name — visible label matches accessible name
- [ ] 2.5.7 Dragging Movements — pointer alternative for drag
- [ ] 2.5.8 Target Size (Minimum) — ≥ 24x24px

### Understandable

- [ ] 3.1.1 Language of Page — `<html lang="en">`
- [ ] 3.2.3 Consistent Navigation — nav order same across pages
- [ ] 3.2.4 Consistent Identification — same components labeled consistently
- [ ] 3.3.1 Error Identification — input errors described to user
- [ ] 3.3.2 Labels or Instructions — all inputs have visible labels
- [ ] 3.3.3 Error Suggestion — error messages suggest fix
- [ ] 3.3.4 Error Prevention (Legal, Financial, Data) — confirmation on destructive actions
- [ ] 3.3.7 Accessible Authentication — password alternative supported

### Robust

- [ ] 4.1.1 Parsing — valid HTML, no duplicate IDs
- [ ] 4.1.2 Name, Role, Value — custom controls have correct ARIA
- [ ] 4.1.3 Status Messages — `role="status"` or `role="alert"` on messages

---

## 4. Accessibility Regression Testing

| Trigger | Action | Tool | Pass/Fail |
|---------|--------|------|-----------|
| Every PR | axe-core scan on all page templates | Playwright + axe | 0 violations |
| Every PR | Keyboard nav test on changed components | Manual | All flows navigable |
| Every PR | Lighthouse a11y score check | Lighthouse CI | ≥ 90 |
| Every deploy | Full screen reader test on critical flows | NVDA + VoiceOver | All flows announced correctly |
| Weekly | Color contrast token scan | CI script | All tokens ≥ ratio |
| Monthly | Full WCAG 2.2 AA audit (all criteria) | Manual | 100% pass |
| Quarterly | Expert audit with JAWS + TalkBack | External or dedicated | All gaps documented |
| Continuous | Track a11y issues in bug tracker | Project management | P0/P1 fixed within sprint |

### Issue Severity Classification

| Severity | Definition | Response Time | Fix Target |
|----------|-----------|---------------|------------|
| P0 (Critical) | WCAG A failure, keyboard trap, content inaccessible | 24 hours | Current sprint |
| P1 (High) | WCAG AA failure, screen reader flow broken | 48 hours | Next sprint |
| P2 (Medium) | AAA failure, minor labeling issue | 1 week | Within 2 sprints |
| P3 (Low) | Enhancement, preference not bug | 1 month | Backlog |

---

## 5. Related Documentation

- `docs/16-accessibility/ACCESSIBILITY-ARCHITECTURE.md` — Full architecture & component specs
- `docs/16-accessibility/WCAG-STATEMENT.md` — Published accessibility statement
- `docs/16-accessibility/ACCESSIBILITY-CHECKLIST.md` — Quick-reference checklist
- `docs/13-testing/CODE-REVIEW-CHECKLIST.md` — Code review a11y checks
