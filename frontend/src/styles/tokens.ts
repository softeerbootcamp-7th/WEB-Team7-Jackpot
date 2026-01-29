/**
 * Design System Tokens
 * Auto-generated from Figma Design System
 * Last updated: 2026-01-28
 */

// ============================================================================
// COLORS - Primitive & Semantic
// ============================================================================

export const colors = {
  // Gray Scale
  gray: {
    50: '#f8f8f8',
    100: '#efefef',
    200: '#dcdcdc',
    300: '#bdbdbd',
    400: '#989898',
    500: '#7c7c7c',
    600: '#656565',
    700: '#525252',
    800: '#464646',
    900: '#3d3d3d',
    950: '#292929',
    white: '#ffffff',
    black: '#000000',
  },

  // Purple - Primary Brand Color
  purple: {
    50: '#f0f2fd',
    100: '#e3e8fc',
    200: '#ccd3f9',
    300: '#aeb7f3',
    400: '#8d91ec',
    500: '#7371e3',
    600: '#5b4dd3',
    700: '#5547bb',
    800: '#453b98',
    900: '#3c3679',
    950: '#242046',
  },

  // Blue - Secondary Brand Color
  blue: {
    50: '#eef7ff',
    100: '#d9ecff',
    200: '#bcdeff',
    300: '#8ecaff',
    400: '#59acff',
    500: '#2783ff',
    600: '#1b69f5',
    700: '#1453e1',
    800: '#1743b6',
    900: '#193c8f',
    950: '#142657',
  },

  // Semantic Colors
  red: {
    600: '#ed2015', // Error
  },
  green: {
    500: '#28c840', // Success
  },
} as const;

// ============================================================================
// SEMANTIC COLOR ALIASES
// ============================================================================

export const semanticColors = {
  // Primary Actions
  primary: colors.purple[500],
  primaryHover: colors.purple[600],
  primaryPress: colors.purple[700],
  primaryDisabled: colors.gray[300],

  // Secondary Actions
  secondary: colors.blue[500],
  secondaryHover: colors.blue[600],
  secondaryPress: colors.blue[700],
  secondaryDisabled: colors.gray[300],

  // Text & Labels
  textStrong: colors.gray[900],
  textDefault: colors.gray[800],
  textSecondary: colors.gray[600],
  textTertiary: colors.gray[500],
  textDisabled: colors.gray[400],
  textInverse: colors.gray.white,

  // Backgrounds
  bgDefault: colors.gray.white,
  bgAlternative: colors.gray[50],
  bgEmphasizeA: colors.purple[50],
  bgEmphasizeB: colors.blue[50],
  bgDisabled: colors.gray[100],

  // Borders & Lines
  lineDefault: colors.gray[200],
  lineEmphasis: colors.purple[300],

  // Status Colors
  error: colors.red[600],
  success: colors.green[500],
  warning: colors.purple[500],
  info: colors.blue[500],
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // pretendard 수정 필요
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },

  fontSize: {
    xs: ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
    sm: ['14px', { lineHeight: '20px', letterSpacing: '0.2px' }],
    base: ['16px', { lineHeight: '24px', letterSpacing: '0px' }],
    lg: ['18px', { lineHeight: '28px', letterSpacing: '0px' }],
    xl: ['20px', { lineHeight: '28px', letterSpacing: '0px' }],
    '2xl': ['24px', { lineHeight: '32px', letterSpacing: '0px' }],
    '3xl': ['32px', { lineHeight: '40px', letterSpacing: '0px' }],
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Text Styles
  body: {
    default: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
      color: colors.gray[800],
    },
    emphasis: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '24px',
      color: colors.gray[900],
    },
  },

  headline: {
    large: {
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '40px',
      color: colors.gray[950],
    },
    medium: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '32px',
      color: colors.gray[950],
    },
    small: {
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '28px',
      color: colors.gray[900],
    },
  },

  label: {
    default: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '20px',
      color: colors.gray[700],
    },
    strong: {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '20px',
      color: colors.gray[900],
    },
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '32px',
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: '150ms ease-in-out',
  base: '250ms ease-in-out',
  slow: '350ms ease-in-out',
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
} as const;
