/**
 * TIL Real Estate Group — Design Tokens (Complete System)
 * ========================================================
 * Single source of truth for BOTH web (CRM) and mobile app.
 * Edit here → changes hot-reload instantly on both platforms.
 */

// ─── BRAND PRIMITIVES ──────────────────────────────────────────────────────
export const brand = {
  navy:      '#0F2D52',
  navyDark:  '#0A1E38',
  navyDeep:  '#060F1C',
  navyMid:   '#1A4A7A',
  navyLight: '#2563B0',
  gold:      '#C9A84C',
  goldLight: '#D4B86A',
  goldDark:  '#A8893A',
  offWhite:  '#F8F9FC',
  white:     '#FFFFFF',
  black:     '#000000',
} as const;

// ─── HSL VALUES (for CSS custom properties, no hsl() wrapper) ──────────────
export const hsl = {
  navy:      '213 73% 19%',
  navyDark:  '213 75% 13%',
  navyDeep:  '213 60% 7%',
  navyMid:   '213 65% 29%',
  navyLight: '213 65% 43%',
  gold:      '42 52% 54%',
  goldLight: '42 55% 63%',
  goldDark:  '42 48% 45%',
  offWhite:  '220 33% 98%',
  white:     '0 0% 100%',
  gray50:    '220 20% 97%',
  gray100:   '220 13% 91%',
  gray200:   '220 13% 87%',
  gray400:   '220 9% 62%',
  gray500:   '220 9% 46%',
  gray600:   '215 15% 40%',
  gray700:   '213 40% 20%',
  gray800:   '213 50% 14%',
  gray900:   '213 60% 10%',
  gray950:   '213 65% 7%',
  red:       '0 72% 51%',
  redDark:   '0 63% 42%',
  green:     '142 71% 38%',
  greenLight:'142 76% 46%',
  amber:     '38 92% 50%',
  blue:      '213 80% 55%',
  purple:    '260 72% 55%',
  orange:    '25 95% 53%',
} as const;

// ─── SEMANTIC COLORS — LIGHT THEME ─────────────────────────────────────────
export const lightColors = {
  // Core surfaces
  background:        '#F8F9FC',
  surface:           '#FFFFFF',
  card:              '#FFFFFF',
  foreground:        '#0F2D52',
  muted:             '#F1F5FB',
  subtle:            '#E5E7F0',
  mutedForeground:   '#64748B',

  // Primary (Navy)
  primary:           '#0F2D52',
  primaryHover:      '#1A4A7A',
  primaryMuted:      'rgba(15,45,82,0.10)',
  primaryForeground: '#FFFFFF',

  // Secondary
  secondary:           '#F1F5FB',
  secondaryForeground: '#0F2D52',

  // Accent (Gold)
  accent:           '#C9A84C',
  accentHover:      '#D4B86A',
  accentForeground: '#0F2D52',

  // Status
  success:           '#22C55E',
  successMuted:      '#F0FDF4',
  successForeground: '#166534',
  warning:           '#F59E0B',
  warningMuted:      '#FFFBEB',
  warningForeground: '#92400E',
  danger:            '#DC2626',
  dangerMuted:       '#FEF2F2',
  dangerForeground:  '#991B1B',
  info:              '#3B82F6',
  infoMuted:         '#EFF6FF',
  infoForeground:    '#1E40AF',

  // Semantic aliases
  destructive:           '#DC2626',
  destructiveForeground: '#FFFFFF',

  // Borders & inputs
  border:  '#E2E8F0',
  divider: '#F1F5F9',
  input:   '#E2E8F0',
  ring:    '#C9A84C',

  // Sidebar (always dark in light mode)
  sidebarBg:        '#0A1E38',
  sidebarText:      '#E5E7EB',
  sidebarActive:    '#C9A84C',
  sidebarActiveFg:  '#0A1E38',
  sidebarHover:     'rgba(201,168,76,0.12)',
  sidebarBorder:    'rgba(255,255,255,0.08)',

  // Tab bar
  tabBarBg:       '#0F2D52',
  tabBarActive:   '#C9A84C',
  tabBarInactive: 'rgba(255,255,255,0.45)',
} as const;

// ─── SEMANTIC COLORS — DARK THEME (Editorial) ──────────────────────────────
export const darkColors = {
  background:        '#080F1C',
  surface:           '#0D1829',
  card:              '#0D1A2E',
  foreground:        '#E4EBF5',
  muted:             '#0D1829',
  subtle:            '#1A2D4D',
  mutedForeground:   '#3D5878',

  primary:           '#C9A84C',
  primaryHover:      '#D4B86A',
  primaryMuted:      'rgba(201,168,76,0.12)',
  primaryForeground: '#080F1C',

  secondary:           '#1A2D4D',
  secondaryForeground: '#E4EBF5',

  accent:           '#C9A84C',
  accentHover:      '#D4B86A',
  accentForeground: '#080F1C',

  success:           '#4ADE80',
  successMuted:      '#052E16',
  successForeground: '#4ADE80',
  warning:           '#FBBF24',
  warningMuted:      '#1C1200',
  warningForeground: '#FBBF24',
  danger:            '#F87171',
  dangerMuted:       '#1C0000',
  dangerForeground:  '#F87171',
  info:              '#60A5FA',
  infoMuted:         '#1E2D4D',
  infoForeground:    '#60A5FA',

  destructive:           '#F87171',
  destructiveForeground: '#080F1C',

  border:  'rgba(200,168,75,0.15)',
  divider: 'rgba(200,168,75,0.07)',
  input:   'rgba(255,255,255,0.07)',
  ring:    '#C9A84C',

  sidebarBg:       '#060D18',
  sidebarText:     '#C8D8E8',
  sidebarActive:   '#C9A84C',
  sidebarActiveFg: '#060D18',
  sidebarHover:    'rgba(200,168,75,0.10)',
  sidebarBorder:   'rgba(200,168,75,0.14)',

  tabBarBg:       '#060D18',
  tabBarActive:   '#C9A84C',
  tabBarInactive: 'rgba(255,255,255,0.38)',
} as const;

// ─── CRM STATUS COLORS ─────────────────────────────────────────────────────
export const crmStatus = {
  new:         { bg: '#3B82F6', muted: '#EFF6FF', text: '#1D4ED8', label: 'New' },
  called:      { bg: '#8B5CF6', muted: '#F5F3FF', text: '#7C3AED', label: 'Called' },
  qualified:   { bg: '#10B981', muted: '#ECFDF5', text: '#059669', label: 'Qualified' },
  proposal:    { bg: '#F59E0B', muted: '#FFFBEB', text: '#D97706', label: 'Proposal' },
  negotiation: { bg: '#F97316', muted: '#FFF7ED', text: '#EA580C', label: 'Negotiation' },
  won:         { bg: '#22C55E', muted: '#F0FDF4', text: '#16A34A', label: 'Won' },
  lost:        { bg: '#EF4444', muted: '#FEF2F2', text: '#DC2626', label: 'Lost' },
} as const;

export type CrmStatusKey = keyof typeof crmStatus;

// ─── TYPOGRAPHY ────────────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    sans:    "'Inter', system-ui, -apple-system, sans-serif",
    mono:    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    display: "'Inter', system-ui, sans-serif",
  },
  fontSize: {
    xs:    12,
    sm:    14,
    base:  16,
    lg:    18,
    xl:    20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal:   '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
  },
  lineHeight: {
    tight:   1.25,
    normal:  1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight:  -0.5,
    normal: 0,
    wide:   0.5,
  },
} as const;

// ─── SPACING ───────────────────────────────────────────────────────────────
export const spacing = {
  0:  0,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
} as const;

// ─── BORDER RADIUS ─────────────────────────────────────────────────────────
export const radius = {
  none:   0,
  sm:     6,
  md:     10,
  base:   12,
  lg:     14,
  xl:     20,
  full:   9999,
  webCss: '0.625rem',
} as const;

// ─── SHADOWS ───────────────────────────────────────────────────────────────
export const shadows = {
  web: {
    sm:   '0px 1px 3px 0px rgba(0,0,0,0.10), 0px 1px 2px -1px rgba(0,0,0,0.10)',
    md:   '0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)',
    lg:   '0px 10px 15px -3px rgba(0,0,0,0.10), 0px 4px 6px -4px rgba(0,0,0,0.10)',
    glow: '0px 0px 20px 0px rgba(201,168,76,0.28)',
    '2xl':'0px 25px 50px -12px rgba(0,0,0,0.25)',
  },
  native: {
    sm:   { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4,  elevation: 2 },
    md:   { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8,  elevation: 4 },
    lg:   { shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 8 },
    glow: { shadowColor: '#C9A84C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.40, shadowRadius: 14, elevation: 6 },
  },
} as const;

// ─── ANIMATION ─────────────────────────────────────────────────────────────
export const animation = {
  duration: {
    fast:   150,
    normal: 250,
    slow:   400,
  },
  easing: {
    easeIn:  'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ─── COMBINED TOKEN MAP ────────────────────────────────────────────────────
export const tokens = {
  brand,
  hsl,
  light:     lightColors,
  dark:      darkColors,
  crmStatus,
  typography,
  spacing,
  radius,
  shadows,
  animation,
} as const;

export type TilTokens   = typeof tokens;
export type LightColors = typeof lightColors;
export type DarkColors  = typeof darkColors;
