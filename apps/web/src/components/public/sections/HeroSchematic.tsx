export function HeroSchematic() {
  return (
    <svg className="hero__schematic" viewBox="0 0 520 340" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hero-schematic-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--rule)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="520" height="340" fill="url(#hero-schematic-grid)" />

      <line x1="24" y1="296" x2="496" y2="296" stroke="var(--rule-strong)" strokeWidth="1" />

      <polyline
        points="48,252 184,214 320,160 456,92"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="48" cy="252" r="4" fill="var(--accent)" />
      <circle cx="184" cy="214" r="4" fill="var(--accent)" />
      <circle cx="320" cy="160" r="4" fill="var(--accent)" />
      <circle cx="456" cy="92" r="4" fill="var(--accent)" />

      <text x="24" y="36" className="hero__schematic-label">
        SIGNAL TRACE
      </text>
      <text x="496" y="320" textAnchor="end" className="hero__schematic-label">
        04 NODES
      </text>
    </svg>
  );
}
