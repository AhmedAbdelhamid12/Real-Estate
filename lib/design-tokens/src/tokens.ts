/**
 * TIL Real Estate Group — Design Tokens
 * =======================================
 * Single source of truth for all brand colors, typography, spacing, and radius.
 * Change values here → automatically reflected in both web (CRM) and mobile app.
 */

export const brand = {
  navy:      '#0F2D52',
  navyDark:  '#0A1E38',
  navyDeep:  '#060F1C',
  navyMid:   '#1A4A7A',
  gold:      '#C9A84C',
  goldLight: '#D4B86A',
  offWhite:  '#F8F9FC',
  white:     '#FFFFFF',
} as const;

/**
 * HSL triplets (no "hsl()" wrapper) — used by web CSS custom properties.
 * Format: "H S% L%"
 */
export const hsl = {
  navy:      '213 73% 19%',
  navyDark:  '213 75% 13%',
  navyDeep:  '213 60% 7%',
  navyMid:   '213 65% 29%',
  gold:      '42 52% 54%',
  goldLight: '42 55% 63%',
  offWhite:  '220 33% 98%',
  white:     '0 0% 100%',
  black:     '0 0% 0%',

  red:       '0 72% 51%',
  green:     '142 76% 36%',
  amber:     '38 92% 50%',
  blue:      '213 60% 55%',

  gray50:    '220 20% 96%',
  gray100:   '220 13% 91%',
  gray400:   '220 9% 62%',
  gray500:   '220 9% 46%',
  gray600:   '215 20% 60%',
  gray700:   '213 40% 18%',
  gray800:   '213 40% 15%',
  gray900:   '213 60% 10%',
} as const;

export const typography = {
  fontSans:  "'Inter', system-ui, -apple-system, sans-serif",
  fontSerif: 'Georgia, serif',
  fontMono:  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  scale: {
    xs:   12,
    sm:   14,
    base: 16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  weight: {
    normal:   '400',
    medium:   '500',
    semibold: '600',
    bold:     '700',
  },
} as const;

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
} as const;

export const radius = {
  none:   0,
  sm:     4,
  md:     6,
  base:   8,
  lg:     12,
  xl:     16,
  full:   9999,
  webCss: '0.5rem',
} as const;

export const shadow = {
  sm:  '0px 1px 3px 0px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)',
  md:  '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)',
  lg:  '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)',
  xl:  '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)',
  '2xl': '0px 25px 50px -12px rgba(0,0,0,0.25)',
} as const;

/** Semantic color roles for light theme */
export const lightTheme = {
  background:          hsl.offWhite,
  foreground:          hsl.navy,
  border:              hsl.gray100,
  input:               hsl.gray100,
  ring:                hsl.gold,
  card:                hsl.white,
  cardForeground:      hsl.navy,
  cardBorder:          hsl.gray100,
  popover:             hsl.white,
  popoverForeground:   hsl.navy,
  popoverBorder:       hsl.gray100,
  primary:             hsl.navy,
  primaryForeground:   hsl.white,
  secondary:           hsl.gray50,
  secondaryForeground: hsl.navy,
  muted:               '220 20% 96%',
  mutedForeground:     hsl.gray500,
  accent:              hsl.gold,
  accentForeground:    hsl.navy,
  destructive:         hsl.red,
  destructiveForeground: hsl.white,
  sidebar:             hsl.navyDark,
  sidebarForeground:   '0 0% 92%',
  sidebarBorder:       '213 55% 20%',
  sidebarPrimary:      hsl.gold,
  sidebarPrimaryForeground: hsl.navyDark,
  sidebarAccent:       '213 55% 22%',
  sidebarAccentForeground: '0 0% 95%',
  sidebarRing:         hsl.gold,
  chart1: '213 73% 35%',
  chart2: hsl.gold,
  chart3: hsl.green,
  chart4: hsl.amber,
  chart5: hsl.red,
} as const;

/** Semantic color roles for dark theme */
export const darkTheme = {
  background:          hsl.navyDeep,
  foreground:          '0 0% 95%',
  border:              hsl.gray700,
  input:               hsl.gray700,
  ring:                hsl.gold,
  card:                hsl.gray900,
  cardForeground:      '0 0% 95%',
  cardBorder:          hsl.gray700,
  popover:             hsl.gray900,
  popoverForeground:   '0 0% 95%',
  popoverBorder:       hsl.gray700,
  primary:             hsl.gold,
  primaryForeground:   '213 75% 10%',
  secondary:           hsl.gray700,
  secondaryForeground: '0 0% 95%',
  muted:               hsl.gray800,
  mutedForeground:     hsl.gray600,
  accent:              hsl.gold,
  accentForeground:    '213 75% 10%',
  destructive:         '0 62.8% 42%',
  destructiveForeground: hsl.white,
  sidebar:             '213 75% 6%',
  sidebarForeground:   '0 0% 90%',
  sidebarBorder:       '213 50% 14%',
  sidebarPrimary:      hsl.gold,
  sidebarPrimaryForeground: '213 75% 10%',
  sidebarAccent:       '213 55% 16%',
  sidebarAccentForeground: '0 0% 95%',
  sidebarRing:         hsl.gold,
  chart1: hsl.gold,
  chart2: hsl.blue,
  chart3: '142 71% 45%',
  chart4: '38 92% 55%',
  chart5: '0 72% 55%',
} as const;
