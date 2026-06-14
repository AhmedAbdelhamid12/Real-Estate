/**
 * React Native theme — TIL Design Tokens
 * ========================================
 * Full theme object for mobile app.
 * Import { useTheme } from '@workspace/design-tokens/native'
 * in any mobile screen or component.
 */

import {
  brand,
  lightColors,
  darkColors,
  crmStatus,
  typography,
  spacing,
  radius,
  shadows,
  animation,
} from './tokens';

// ─── NATIVE THEME FACTORY ──────────────────────────────────────────────────

export function buildNativeTheme(isDark: boolean) {
  const c = isDark ? darkColors : lightColors;
  return {
    colors: {
      ...c,
      // Backward-compatible aliases
      text:                 c.foreground,
      tint:                 c.primary,
      background:           c.background,
      foreground:           c.foreground,
      card:                 c.card,
      cardForeground:       c.foreground,
      primary:              c.primary,
      primaryForeground:    c.primaryForeground,
      secondary:            c.secondary,
      secondaryForeground:  c.secondaryForeground,
      mutedForeground:      c.mutedForeground,
      accent:               c.accent,
      accentForeground:     c.accentForeground,
      destructive:          c.destructive,
      destructiveForeground:c.destructiveForeground,
      border:               c.border,
      input:                c.input,
      success:              c.success,
      warning:              c.warning,
      info:                 c.info,
    },
    crmStatus,
    typography: {
      fontFamily: {
        sans:    'Inter_400Regular',
        medium:  'Inter_500Medium',
        semibold:'Inter_600SemiBold',
        bold:    'Inter_700Bold',
      },
      fontSize:      typography.fontSize,
      fontWeight:    typography.fontWeight,
      lineHeight:    typography.lineHeight,
      letterSpacing: typography.letterSpacing,
    },
    spacing,
    radius: {
      none: radius.none,
      sm:   radius.sm,
      md:   radius.md,
      base: radius.base,
      lg:   radius.lg,
      xl:   radius.xl,
      full: radius.full,
    },
    shadows: shadows.native,
    animation: animation.duration,
    brand,
    isDark,
  } as const;
}

export type NativeTheme = ReturnType<typeof buildNativeTheme>;

// ─── LEGACY EXPORT (tilColors) — backward-compatible ──────────────────────

export const tilColors = {
  light: {
    text:                 lightColors.foreground,
    tint:                 lightColors.primary,
    background:           lightColors.background,
    foreground:           lightColors.foreground,
    card:                 lightColors.card,
    cardForeground:       lightColors.foreground,
    primary:              lightColors.primary,
    primaryForeground:    lightColors.primaryForeground,
    secondary:            lightColors.secondary,
    secondaryForeground:  lightColors.secondaryForeground,
    muted:                lightColors.muted,
    mutedForeground:      lightColors.mutedForeground,
    accent:               lightColors.accent,
    accentForeground:     lightColors.accentForeground,
    destructive:          lightColors.destructive,
    destructiveForeground:lightColors.destructiveForeground,
    border:               lightColors.border,
    input:                lightColors.input,
    success:              lightColors.success,
    warning:              lightColors.warning,
    info:                 lightColors.info,
    tabBarBg:             lightColors.tabBarBg,
    tabBarActive:         lightColors.tabBarActive,
    tabBarInactive:       lightColors.tabBarInactive,
  },
  dark: {
    text:                 darkColors.foreground,
    tint:                 darkColors.primary,
    background:           darkColors.background,
    foreground:           darkColors.foreground,
    card:                 darkColors.card,
    cardForeground:       darkColors.foreground,
    primary:              darkColors.primary,
    primaryForeground:    darkColors.primaryForeground,
    secondary:            darkColors.secondary,
    secondaryForeground:  darkColors.secondaryForeground,
    muted:                darkColors.muted,
    mutedForeground:      darkColors.mutedForeground,
    accent:               darkColors.accent,
    accentForeground:     darkColors.accentForeground,
    destructive:          darkColors.destructive,
    destructiveForeground:darkColors.destructiveForeground,
    border:               darkColors.border,
    input:                darkColors.input,
    success:              darkColors.success,
    warning:              darkColors.warning,
    info:                 darkColors.info,
    tabBarBg:             darkColors.tabBarBg,
    tabBarActive:         darkColors.tabBarActive,
    tabBarInactive:       darkColors.tabBarInactive,
  },
  radius: radius.base,
  brand,
} as const;

export type TilColorScheme = typeof tilColors.light;
export type TilTheme = typeof tilColors;

export default tilColors;
