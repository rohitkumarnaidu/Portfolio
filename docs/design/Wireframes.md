# Wireframes — Design File Reference

> **Version:** 2.0 | **Status:** ✅ Active | **Tool:** Pencil (.pen) | **Owner:** Design Lead

## 1. Overview
Wireframes are maintained in **Pencil .pen files** (not Markdown). This document indexes the wireframe files, summarizes what has been wireframed, and documents reading conventions. .pen files support interaction, flow arrows, state toggles, and annotations that static Markdown cannot replicate.

## 2. Design Files
| File | Path | Contents |
|------|------|----------|
| Main Wireframes | `docs/design/wireframes.pen` | All screens, flows, mobile variants |
| Components Library | `docs/design/components.pen` | Reusable components with states |
| Design Tokens | `docs/design/tokens.pen` | Visual color/type/spacing reference |
| User Flows | `docs/design/flows.pen` | Flow diagrams with annotations |

**To open:** Use Pencil MCP `open_document({ path: "docs/design/wireframes.pen" })`.

## 3. Wireframed Screens

### Public Portfolio
| Screen | File Section | States |
|--------|-------------|--------|
| Homepage | `screens/public/home` | Default, scrolled 50%, scrolled 100% |
| About | `screens/public/about` | Default, expanded timeline item |
| Projects Grid | `screens/public/projects` | Default, filtered by tech/category |
| Project Detail | `screens/public/project-[slug]` | Default, lightbox open, mobile |
| Blog Listing | `screens/public/blog` | Default, search active, paginated |
| Blog Post | `screens/public/blog-[slug]` | Default, code block expanded |
| Contact Form | `screens/public/contact` | Default, validation errors, success |

### Admin Dashboard
| Screen | File Section | States |
|--------|-------------|--------|
| Dashboard Overview | `screens/admin/overview` | Default with stats + activity |
| Projects CRUD | `screens/admin/projects` | List, create form, edit form, delete confirm |
| Blog CRUD | `screens/admin/blog` | List, create (editor), edit |
| Media Library | `screens/admin/media` | Grid, upload dialog, selected |
| Analytics | `screens/admin/analytics` | Default, date range selected |
| Settings | `screens/admin/settings` | Default, unsaved warning |

### Mobile Variants
| Screen | Key Differences |
|--------|----------------|
| Homepage | Bottom nav, reduced hero, single-column |
| Projects | Filter via bottom sheet, single-column cards |
| Blog | Single column, search in sticky header |
| Admin | Hamburger menu, tables as card list |
| Contact | Full-screen, keyboard-aware |
| AI Chat | Full-screen bottom sheet (vs floating modal) |

### User Flows
| Flow | Start → End | File Section |
|------|-------------|-------------|
| Project Browse | Home → Projects Grid → Detail | `flows/project-browse` |
| Blog Read | Blog Listing → Post → Share | `flows/blog-read` |
| Contact Submit | Any page → Contact Form → Success | `flows/contact` |
| Admin Login | Login → Dashboard → Edit Project | `flows/admin-login` |
| AI Chat | Any page → Chat → Response → Dismiss | `flows/ai-chat` |

## 4. Wireframe Conventions
| Convention | Appearance | Meaning |
|------------|-----------|---------|
| Thin border | 1px blue `#3b82f6` rectangle | Screen boundary |
| Dashed border | 1px dashed violet `#8b5cf6` | Interaction zone |
| Gray fill | `#9ca3af` at opacity | Image/video placeholder |
| Annotation | Amber `#f59e0b` text, 10px | Behavior notes or rationale |
| Flow arrow | Solid `#3b82f6`, 1.5px | Navigation path |
| State label | `[State: Empty]` bracket notation | Alternative state |
| Device indicator | Icon + label top-right | Mobile/tablet/desktop variant |
| Component ref | `ref: Button/Primary` | Links to component library |

**Annotation examples:** "On click, expand to full-screen lightbox" / "Show if no projects exist" / "Hides on mobile, replaced by bottom sheet" / "Entrance: fade + slide up, stagger 80ms".

**Versioning:** Each screen labeled `v1.2` top-left. Major bump = layout change, minor = spacing/content. Changelog in `docs/design/wireframes-changelog.md`.

## 5. How to Access
1. Open `wireframes.pen` via `open_document` Pencil MCP tool
2. Navigate via layer panel or search by section name
3. Leave feedback as annotation nodes prefixed `[FEEDBACK]`
4. Edit via `batch_design` MCP operations
5. Visual QA via `snapshot_layout` (structure) or `get_screenshot` (visual)
6. Export via `export_nodes` for stakeholder PNG/PDF review

**New contributor checklist:** Open wireframes.pen → browse screens per §3 → review components.pen → check flows.pen → verify mobile variants exist → run snapshot_layout (check for clipping) → confirm all annotations current (no stale `[TODO]`).
