import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}', '../../packages/ui/src/**/*.{ts,tsx}'],

  // Theme toggle uses data-theme attribute on <html>
  darkMode: ['selector', '[data-theme="dark"]'],

  theme: {
    extend: {
      // ── Colors ──────────────────────────────────────────────
      colors: {
        accent: {
          50: 'var(--accent-50)',
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          800: 'var(--accent-800)',
        },
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          elevated: 'var(--surface-elevated)',
        },
        border: {
          primary: 'var(--border-primary)',
          accent: 'var(--border-accent)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
          link: 'var(--text-link)',
        },
        semantic: {
          success: 'var(--semantic-success)',
          'success-bg': 'var(--semantic-success-bg)',
          warning: 'var(--semantic-warning)',
          'warning-bg': 'var(--semantic-warning-bg)',
          error: 'var(--semantic-error)',
          'error-bg': 'var(--semantic-error-bg)',
          info: 'var(--semantic-info)',
          'info-bg': 'var(--semantic-info-bg)',
        },
      },

      // ── Typography ──────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      fontSize: {
        display: [
          'clamp(3rem, 4vw + 1rem, 4.5rem)',
          { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' },
        ],
        h1: [
          'clamp(2.25rem, 4vw + 1rem, 3.75rem)',
          { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.01em' },
        ],
        h2: ['clamp(1.75rem, 3vw + 0.75rem, 2.25rem)', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['clamp(1.375rem, 2vw + 0.5rem, 1.75rem)', { lineHeight: '1.25', fontWeight: '600' }],
        h4: [
          'clamp(1.125rem, 1.5vw + 0.25rem, 1.375rem)',
          { lineHeight: '1.3', fontWeight: '600' },
        ],
        'body-lg': ['clamp(1rem, 1vw + 0.5rem, 1.125rem)', { lineHeight: '1.6' }],
        body: ['clamp(0.938rem, 1vw + 0.5rem, 1rem)', { lineHeight: '1.6' }],
        'body-sm': ['clamp(0.813rem, 0.5vw + 0.5rem, 0.875rem)', { lineHeight: '1.5' }],
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        button: ['0.875rem', { lineHeight: '1', fontWeight: '500', letterSpacing: '0.01em' }],
        code: ['0.875rem', { lineHeight: '1.5' }],
      },

      // ── Spacing Scale ───────────────────────────────────────
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },

      // ── Shadows ─────────────────────────────────────────────
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        // Enterprise glow policy: accent-colored shadows for focus/active/hover
        'accent-focus': 'var(--shadow-accent-focus)',
        'accent-active': 'var(--shadow-accent-active)',
        'accent-hover': 'var(--shadow-accent-hover)',
      },

      // ── Border Radius ───────────────────────────────────────
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },

      // ── Transition Duration ─────────────────────────────────
      transitionDuration: {
        instant: '0ms',
        micro: '100ms',
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
        reveal: '600ms',
        emphasis: '1000ms',
      },

      // ── Transition Timing ───────────────────────────────────
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        in: 'cubic-bezier(0.7, 0, 0.84, 0)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.45, 0, 0.55, 1)',
      },

      // ── Keyframes ───────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-in-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        // Mesh gradient animation
        'mesh-shift': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 10px) scale(0.95)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        // Particle float
        'particle-float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '25%': { transform: 'translateY(-20px) translateX(10px)' },
          '50%': { transform: 'translateY(-10px) translateX(-5px)' },
          '75%': { transform: 'translateY(-30px) translateX(15px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        wiggle: 'wiggle 0.3s ease-in-out',
        'mesh-shift': 'mesh-shift 8s ease-in-out infinite',
        'particle-float': 'particle-float 6s ease-in-out infinite',
      },

      // ── z-index ────────────────────────────────────────────
      zIndex: {
        sticky: '30',
        dropdown: '40',
        drawer: '50',
        modal: '60',
        toast: '70',
        tooltip: '80',
        overlay: '100',
        'modal-content': '110',
      },

      // ── Max Width ──────────────────────────────────────────
      maxWidth: {
        prose: '65ch',
      },

      // ── Perspective (depth layer system) ────────────────────
      perspective: {
        near: '800px',
        mid: '1000px',
        far: '1200px',
      },
    },

    // ── Container (top-level, not extend) ────────────────────
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '0',
      },
    },
  },

  plugins: [
    // ── Glassmorphism Utilities ──────────────────────────────
    plugin(({ addUtilities }) => {
      addUtilities({
        '.glass-subtle': {
          background: 'var(--glass-subtle)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-medium': {
          background: 'var(--glass-medium)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        },
        '.glass-prominent': {
          background: 'var(--glass-prominent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
      });
    }),

    // ── Neumorphism Utilities ────────────────────────────────
    plugin(({ addUtilities }) => {
      addUtilities({
        '.neu-flat': {
          boxShadow: 'var(--neu-light-flat-light), var(--neu-light-flat-dark)',
        },
        '.neu-raised': {
          boxShadow: 'var(--neu-light-raised-light), var(--neu-light-raised-dark)',
        },
        '.neu-pressed': {
          boxShadow: 'var(--neu-light-pressed-light), var(--neu-light-pressed-dark)',
        },
        '.neu-raised-hover': {
          boxShadow: 'var(--neu-light-raised-hover-light), var(--neu-light-raised-hover-dark)',
        },
        '.neu-transition': {
          transition: 'box-shadow 200ms ease-out, transform 150ms ease-out',
        },
      });
    }),

    // ── Depth Layer Utilities ────────────────────────────────
    plugin(({ addUtilities }) => {
      addUtilities({
        '.depth-container': {
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        },
        '.depth-far': {
          transform: 'translateZ(-50px) scale(0.85)',
          opacity: '0.5',
          willChange: 'transform',
        },
        '.depth-mid': {
          transform: 'translateZ(0)',
        },
        '.depth-near': {
          transform: 'translateZ(30px) scale(1.08)',
          willChange: 'transform',
        },
        '.depth-hover': {
          transform: 'translateZ(80px) scale(1.15)',
          transition: 'transform 200ms ease-out',
        },
      });
    }),

    // ── Background Pattern Utilities ─────────────────────────
    plugin(({ addUtilities }) => {
      addUtilities({
        '.bg-dots': {
          backgroundImage:
            'radial-gradient(circle, var(--dot-color, var(--border-primary)) var(--dot-size, 1px), transparent var(--dot-size, 1px))',
          backgroundSize: 'var(--dot-spacing, 20px) var(--dot-spacing, 20px)',
        },
        '.bg-grid': {
          backgroundImage:
            'linear-gradient(var(--grid-color, var(--border-primary)) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color, var(--border-primary)) 1px, transparent 1px)',
          backgroundSize: 'var(--grid-size, 24px) var(--grid-size, 24px)',
        },
        '.bg-mesh-1': {
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, var(--accent-500), transparent), radial-gradient(ellipse 50% 80% at 80% 50%, #06b6d4, transparent), radial-gradient(ellipse 50% 80% at 20% 50%, #a78bfa, transparent)',
        },
        '.bg-mesh-2': {
          background:
            'radial-gradient(ellipse 60% 60% at 20% 80%, var(--accent-500), transparent), radial-gradient(ellipse 60% 60% at 80% 20%, #6ee7b7, transparent), radial-gradient(ellipse 60% 60% at 50% 50%, #a78bfa, transparent)',
        },
        '.scrim-light': {
          '&::after': {
            content: "''",
            position: 'absolute',
            inset: '0',
            background: 'var(--scrim-light, rgba(0,0,0,0.3))',
            pointerEvents: 'none',
          },
        },
        '.scrim-dark': {
          '&::after': {
            content: "''",
            position: 'absolute',
            inset: '0',
            background: 'var(--scrim-dark, rgba(0,0,0,0.6))',
            pointerEvents: 'none',
          },
        },
      });
    }),

    // ── Thin Scrollbar Utility ──────────────────────────────
    plugin(({ addUtilities }) => {
      addUtilities({
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-accent) transparent',
        },
      });
    }),

    // ── Text Balance ─────────────────────────────────────────
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-balance': {
          textWrap: 'balance',
        },
        '.text-pretty': {
          textWrap: 'pretty',
        },
      });
    }),
  ],
};

export default config;
