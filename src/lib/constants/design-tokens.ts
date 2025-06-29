// ABOUTME: Central design tokens for the app's design system
// Defines colors, typography, spacing, shadows, and animations

export const colors = {
  light: {
    // Primary palette
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    // Neutral palette
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
    // Semantic colors
    background: '#ffffff',
    foreground: '#09090b',
    card: '#ffffff',
    'card-foreground': '#09090b',
    popover: '#ffffff',
    'popover-foreground': '#09090b',
    muted: '#f4f4f5',
    'muted-foreground': '#71717a',
    accent: '#f4f4f5',
    'accent-foreground': '#18181b',
    destructive: '#ef4444',
    'destructive-foreground': '#fafafa',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#a855f7',
    // Glass effect colors
    glass: {
      background: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.18)',
    },
  },
  dark: {
    // Primary palette (adjusted for dark mode)
    primary: {
      50: '#3b0764',
      100: '#581c87',
      200: '#6b21a8',
      300: '#7c3aed',
      400: '#9333ea',
      500: '#a855f7',
      600: '#c084fc',
      700: '#d8b4fe',
      800: '#e9d5ff',
      900: '#f3e8ff',
      950: '#faf5ff',
    },
    // Neutral palette (inverted)
    neutral: {
      50: '#09090b',
      100: '#18181b',
      200: '#27272a',
      300: '#3f3f46',
      400: '#52525b',
      500: '#71717a',
      600: '#a1a1aa',
      700: '#d4d4d8',
      800: '#e4e4e7',
      900: '#f4f4f5',
      950: '#fafafa',
    },
    // Semantic colors
    background: '#09090b',
    foreground: '#fafafa',
    card: '#09090b',
    'card-foreground': '#fafafa',
    popover: '#09090b',
    'popover-foreground': '#fafafa',
    muted: '#18181b',
    'muted-foreground': '#a1a1aa',
    accent: '#27272a',
    'accent-foreground': '#fafafa',
    destructive: '#dc2626',
    'destructive-foreground': '#fafafa',
    border: '#27272a',
    input: '#27272a',
    ring: '#c084fc',
    // Glass effect colors
    glass: {
      background: 'rgba(9, 9, 11, 0.7)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
  },
} as const;

export const typography = {
  fonts: {
    sans: 'var(--font-sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
    mono: 'var(--font-mono, ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace)',
  },
  sizes: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
    '9xl': '8rem', // 128px
  },
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export const spacing = {
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const;

export const borderRadius = {
  none: '0px',
  sm: '0.125rem', // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  // Glass morphism shadows
  glass: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
    DEFAULT: '0 4px 16px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
  // Glow effects
  glow: {
    sm: '0 0 10px rgba(168, 85, 247, 0.3)',
    DEFAULT: '0 0 20px rgba(168, 85, 247, 0.4)',
    lg: '0 0 40px rgba(168, 85, 247, 0.5)',
  },
} as const;

export const animations = {
  durations: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  easings: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Spring-like easings
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    // Smooth easings
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    smoothOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  },
  // Framer Motion variants
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideIn: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    },
    rotateIn: {
      initial: { opacity: 0, rotate: -10 },
      animate: { opacity: 1, rotate: 0 },
      exit: { opacity: 0, rotate: 10 },
    },
  },
} as const;

// Utility function to get CSS variables for colors
export const getCSSVariables = (mode: 'light' | 'dark') => {
  const modeColors = colors[mode];
  const cssVars: Record<string, string> = {};

  // Convert flat color values
  Object.entries(modeColors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      cssVars[`--color-${key}`] = value;
    } else if (typeof value === 'object') {
      // Handle nested color objects
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        cssVars[`--color-${key}-${nestedKey}`] = nestedValue as string;
      });
    }
  });

  return cssVars;
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-index scale
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1100',
  modal: '1200',
  popover: '1300',
  tooltip: '1400',
  notification: '1500',
} as const;