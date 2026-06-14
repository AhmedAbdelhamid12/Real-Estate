/**
 * React Native theme for TIL Design Tokens
 * ==========================================
 * Drop-in replacement for artifacts/mobile/constants/colors.ts
 * Import tilColors from '@workspace/design-tokens/native'
 */

import { brand, radius } from './tokens';

export const tilColors = {
  light: {
    text:                 brand.navy,
    tint:                 brand.navyMid,
    background:           brand.offWhite,
    foreground:           brand.navy,
    card:                 brand.white,
    cardForeground:       brand.navy,
    primary:              brand.navy,
    primaryForeground:    brand.white,
    secondary:            '#F1F5FB',
    secondaryForeground:  '#475569',
    muted:                '#F1F5FB',
    mutedForeground:      '#94A3B8',
    accent:               brand.gold,
    accentForeground:     brand.navy,
    destructive:          '#DC2626',
    destructiveForeground: brand.white,
    border:               '#E2E8F0',
    input:                '#E2E8F0',
    success:              '#22C55E',
    warning:              '#F59E0B',
    info:                 '#3B82F6',
    sidebar:              brand.navyDark,
    sidebarForeground:    '#EBEBEB',
    tabBar:               brand.navy,
    tabBarActive:         brand.gold,
    tabBarInactive:       'rgba(255,255,255,0.5)',
  },
  dark: {
    text:                 '#F1F5F9',
    tint:                 brand.gold,
    background:           '#060F1C',
    foreground:           '#F1F5F9',
    card:                 '#0A1828',
    cardForeground:       '#F1F5F9',
    primary:              brand.gold,
    primaryForeground:    '#060F1C',
    secondary:            '#1E293B',
    secondaryForeground:  '#94A3B8',
    muted:                '#1E293B',
    mutedForeground:      '#64748B',
    accent:               brand.gold,
    accentForeground:     '#060F1C',
    destructive:          '#F87171',
    destructiveForeground: '#060F1C',
    border:               '#1A3A5C',
    input:                '#1A3A5C',
    success:              '#4ADE80',
    warning:              '#FBBF24',
    info:                 '#60A5FA',
    sidebar:              '#040C18',
    sidebarForeground:    '#E5E5E5',
    tabBar:               '#040C18',
    tabBarActive:         brand.gold,
    tabBarInactive:       'rgba(255,255,255,0.4)',
  },
  radius: radius.base,
  brand,
} as const;

export type TilColorScheme = typeof tilColors.light;
export type TilTheme = typeof tilColors;

export default tilColors;
