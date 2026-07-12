# Illustration System

> **Version:** 2.0 | **Status:** Ã¢Å“â€¦ Active | **Technologies:** Three.js/R3F, Spline, CSS Gradients, SVG

## 1. Design Philosophy

Avoid traditional flat vector "tech" characters. Use abstract, programmatic, geometric compositions reflecting backend architecture, AI neural networks, and 3D spatial concepts. Illustrations should look code-generated Ã¢â‚¬â€ because they often are. Every illustration must serve a purpose; decorative-only assets are evaluated for removal if they impact performance. If an illustration can be replaced by CSS gradient + SVG pattern without losing meaning, do that first.

## 2. Illustration Style

### Mediums

| Medium              | When to Use                                    | Tools                      |
| ------------------- | ---------------------------------------------- | -------------------------- |
| Three.js / R3F      | Interactive hero scenes, data visualizations   | R3F + Drei + Framer Motion |
| Spline exports      | Static complex scenes, performance-sensitive   | Spline Ã¢â€ â€™ glb export        |
| CSS gradients + SVG | Decorative backgrounds, noise, simple patterns | Pure CSS/SVG               |
| Lottie JSON         | 2D animated sequences, loading animations      | LottieFiles Ã¢â€ â€™ Lottie       |

### Visual Grammar

- **Geometry:** Cubes, torus knots, grids, wireframes, nodes, connection lines, isometric shapes
- **Colors:** Gradient ramp `accent-primary` Ã¢â€ â€™ `status-ai` Ã¢â€ â€™ `accent-secondary` Ã¢â‚¬â€ never flat single-color fills
- **Lighting:** Cinematic, single directional source with rim highlights
- **Texture:** SVG noise overlay at `opacity: 0.03` over gradients to prevent banding
- **Motion:** Slow ambient rotation (5Ã¢â‚¬â€œ15s per cycle), gentle floating Ã¢â‚¬â€ no jarring animation

### Core Motifs

| Motif            | Represents                  | Used In                        |
| ---------------- | --------------------------- | ------------------------------ |
| The Node         | Data points, AI embeddings  | Hero, AI chat background       |
| The Ray          | API requests, data flow     | Project cards, blog headers    |
| The Cube / Prism | Architecture, databases     | Loading screen, 404 page       |
| The Grid         | Infrastructure, scalability | Admin backgrounds              |
| The Pulse        | AI processing, activity     | AI features, status indicators |

## 3. Usage Tiers

| Tier       | Context                 | Implementation               | Perf Priority                    |
| ---------- | ----------------------- | ---------------------------- | -------------------------------- |
| Primary    | Hero sections, homepage | R3F interactive 3D           | Critical Ã¢â‚¬â€ LOD, DPR scaling      |
| Secondary  | Feature cards, headers  | Spline export / CSS gradient | High Ã¢â‚¬â€ lazy load, WebP fallback  |
| Tertiary   | Empty states, admin     | SVG / Lottie                 | Medium Ã¢â‚¬â€ respects reduced motion |
| Decorative | Backgrounds, noise      | CSS-only (zero JS)           | Low                              |

**Placement:** Hero Ã¢â€ â€™ Primary, Project cards Ã¢â€ â€™ Secondary, Admin empty Ã¢â€ â€™ Tertiary, Blog headers Ã¢â€ â€™ Secondary, Loading Ã¢â€ â€™ Tertiary, 404 Ã¢â€ â€™ Primary (simplified).

## 4. Creation Workflow

```
Concept (Figma) Ã¢â€ â€™ Spline Prototype Ã¢â€ â€™ Export glb/gltf (Draco)
  Ã¢â€ â€™ R3F Import (useGLTF) Ã¢â€ â€™ Add interaction (Framer Motion, useFrame)
    Ã¢â€ â€™ WebP fallback Ã¢â€ â€™ Performance audit
```

### Tooling

| Step            | Tool                     | Output                |
| --------------- | ------------------------ | --------------------- |
| Concept         | Figma / sketch           | Layout canvas         |
| 3D modeling     | Spline, Blender          | glb/gltf scene        |
| Web integration | R3F + Drei               | React 3D component    |
| Animation       | Framer Motion, useFrame  | Interactive + ambient |
| Compression     | Draco (via drei/useGLTF) | Compressed glb        |
| Static fallback | Spline render Ã¢â€ â€™ WebP     | `<Image />` component |

### Export Budgets

| Format     | Max Size | Compression | Notes                        |
| ---------- | -------- | ----------- | ---------------------------- |
| glb        | 500KB    | Draco       | Preferred single-file        |
| gltf + bin | 1MB      | Draco       | Complex scenes with textures |
| WebP       | 100KB    | Quality 85  | Static screenshot fallback   |
| Lottie     | 50KB     | dotLottie   | 2D animated sequences        |

## 5. Responsiveness

| Viewport          | Illustration Behavior                                        |
| ----------------- | ------------------------------------------------------------ |
| Desktop Ã¢â€°Â¥ 1024px  | All tiers Ã¢â‚¬â€ full 3D interactive                              |
| Tablet 768Ã¢â‚¬â€œ1023px | Primary (reduced DPR) + Secondary. Tertiary Ã¢â€ â€™ static SVG     |
| Mobile < 768px    | Primary only (WebGL or WebP fallback). All decorative hidden |

Implementation: `className="hidden md:block"` for decorative; `dynamic(() => import(...), { ssr: false })` for 3D.

## 6. Performance

**Loading:** `next/dynamic` with `ssr: false`. Hero LCP gets `priority` on fallback `<Image>`. Three.js code-split into separate chunk. `Suspense` boundary with GradientFallback placeholder.

**Fallback hierarchy:** Tier 1 Ã¢â€ â€™ full 3D + post-processing. Tier 2 Ã¢â€ â€™ reduced geometry, no bloom. Tier 3 Ã¢â€ â€™ static WebP. No WebGL Ã¢â€ â€™ CSS gradient + SVG.

**Reduced motion:**

```css
@media (prefers-reduced-motion: reduce) {
  .scene-3d {
    display: none;
  }
  .scene-fallback {
    display: block;
  }
}
```

When reduced motion: static WebP replaces 3D, ambient rotation stops, parallax disabled, particles hidden.

## 7. File Organization

| Directory                   | Contents              | Git LFS |
| --------------------------- | --------------------- | ------- |
| `public/models/`            | glb/gltf 3D files     | Yes     |
| `public/illustrations/`     | WebP static fallbacks | No      |
| `public/lottie/`            | Lottie JSON files     | No      |
| `components/3d/`            | R3F scene components  | N/A     |
| `components/illustrations/` | SVG/CSS components    | N/A     |

## 9. Creation Flow Diagram

```mermaid
flowchart LR
    A[Concept] --> B[Sketch]
    B --> C[3D Model]
    C --> D[Render]
    D --> E[Export]
    E --> F[Optimize]
    F --> G[Web Integration]
```

## 8. Audit Checklist

- [ ] Defined purpose tier (primary/secondary/tertiary/decorative)
- [ ] `dpr={[1, 2]}` + lazy loading for 3D
- [ ] WebP fallback for primary/secondary illustrations
- [ ] Reduced motion variant respects `prefers-reduced-motion`
- [ ] Decorative hidden on mobile (`hidden md:block`)
- [ ] File sizes: glb < 500KB, Lottie < 50KB, WebP < 100KB
- [ ] No stock photography or clip art
- [ ] Colors match brand gradient ramp (blue Ã¢â€ â€™ violet)
- [ ] Ambient motion Ã¢â€°Â¤ 15s per cycle Ã¢â‚¬â€ not jarring
- [ ] WebGL context loss handled gracefully (`onCreated` error recovery)
- [ ] SSR-safe Ã¢â‚¬â€ dynamic import with `ssr: false`
- [ ] No layout shift from illustration loading

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system