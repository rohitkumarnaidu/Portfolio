# Illustration System

> **Version:** 2.0 | **Status:** ✅ Active | **Technologies:** Three.js/R3F, Spline, CSS Gradients, SVG

## 1. Design Philosophy
Avoid traditional flat vector "tech" characters. Use abstract, programmatic, geometric compositions reflecting backend architecture, AI neural networks, and 3D spatial concepts. Illustrations should look code-generated — because they often are. Every illustration must serve a purpose; decorative-only assets are evaluated for removal if they impact performance.

## 2. Illustration Style
- **Primary Medium:** Three.js / React Three Fiber (interactive) or Spline (static/complex)
- **Secondary:** CSS mesh gradients + SVG geometric patterns
- **Tertiary:** Lottie JSON animations (complex 2D motion)
- **Geometry:** Cubes, torus knots, grids, wireframes, nodes, connection lines
- **Colors:** Gradient ramp via accent-primary → status-ai → accent-secondary
- **Lighting:** Cinematic, single strong source with rim highlights
- **Texture:** Subtle SVG noise overlay `opacity: 0.03` to prevent banding
- **Motion:** Slow ambient rotation/pulsing — no jarring animation

**Core Motifs:** The Node (data points, AI embeddings), The Ray (API requests, data flow), The Cube/Prism (architecture, databases), The Grid (infrastructure, scalability), The Pulse (AI processing).

## 3. Usage Tiers
| Tier | Context | Implementation | Performance Priority |
|------|---------|---------------|---------------------|
| Primary | Hero sections, homepage canvas | R3F interactive 3D | Critical — LOD + DPR |
| Secondary | Feature cards, section headers | Spline export / CSS gradient | High — lazy load |
| Tertiary | Empty states, admin dashboard | SVG / Lottie | Medium — respects reduced motion |
| Decorative | Backgrounds, noise overlays | CSS-only (zero JS) | Low |

**Where:** Hero background, project card motifs, admin empty states, blog headers, loading screens, 404 page.

## 4. Creation Workflow
```
Concept Sketch (Figma) → Spline Prototype → Export glb/gltf → Compress (Draco) → R3F import → Add interaction (Framer Motion)
```

**Tooling:** R3F + Drei for interactive scenes, Spline for static renders, CSS keyframes for simple backgrounds, Lottie (`lottie-react`) for 2D animation.

**Export Specs:** glb < 500KB (Draco compressed), gltf+bin < 1MB, WebP < 100KB (static fallback, quality 85), Lottie JSON < 50KB.

## 5. Responsiveness
| Viewport | Illustrations |
|----------|--------------|
| Desktop ≥ 1024px | All tiers |
| Tablet 768–1023px | Primary + secondary (tertiary → static SVG) |
| Mobile < 768px | Primary only (degraded). Decorative hidden |

Implementation: `className="hidden md:block"` for decorative, dynamic import for 3D.

## 6. Performance
**Loading:** Lazy via `next/dynamic` with `ssr: false`. Priority loading for hero LCP. Three.js code-split into separate chunk.

**Fallback hierarchy:**
```
High-end GPU → Full interactive 3D
Mid-range → Reduced polygons, no post-processing
Low-end → Static WebP
No WebGL → CSS gradient + SVG
```

**Reduced motion:** `prefers-reduced-motion` → static version, skip animation loop.

## 7. File Organization
| Directory | Contents |
|-----------|----------|
| `public/models/` | glb/gltf 3D files |
| `public/illustrations/` | WebP static fallbacks |
| `public/lottie/` | Lottie JSON files |
| `components/3d/` | R3F scene components |
| `components/illustrations/` | SVG/CSS illustration components |

## 8. Audit Checklist
- [ ] Defined purpose tier (primary/secondary/tertiary/decorative)
- [ ] `dpr={[1, 2]}` + lazy loading for 3D
- [ ] WebP fallback for all primary/secondary illustrations
- [ ] Reduced motion variant respects `prefers-reduced-motion`
- [ ] Decorative hidden on mobile (`hidden md:block`)
- [ ] File size budgets met (glb < 500KB, Lottie < 50KB, WebP < 100KB)
- [ ] No stock photography or clip art
- [ ] Colors match brand gradient ramp
- [ ] Ambient animation (not jarring)
- [ ] WebGL context loss handled gracefully
