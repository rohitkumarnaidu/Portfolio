const path = require('path');
const plugin = require('tailwindcss/plugin');

const config = {
  content: [
    path.resolve(__dirname, '../src/**/*.{ts,tsx}'),
    path.resolve(__dirname, './preview.tsx'),
  ],

  darkMode: ['selector', '[data-theme="dark"]'],

  theme: {
    extend: {
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
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
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
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'accent-focus': 'var(--shadow-accent-focus)',
        'accent-active': 'var(--shadow-accent-active)',
        'accent-hover': 'var(--shadow-accent-hover)',
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      transitionDuration: {
        instant: '0ms',
        micro: '100ms',
        fast: '200ms',
        normal: '300ms',
        slow: '500ms',
        reveal: '600ms',
        emphasis: '1000ms',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
        in: 'cubic-bezier(0.7, 0, 0.84, 0)',
        'in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.45, 0, 0.55, 1)',
      },
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
    },
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
        '.depth-mid': { transform: 'translateZ(0)' },
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
      });
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--border-accent) transparent',
        },
      });
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-balance': { textWrap: 'balance' },
        '.text-pretty': { textWrap: 'pretty' },
      });
    }),
  ],
};

module.exports = config;
