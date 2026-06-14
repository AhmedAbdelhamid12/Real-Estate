/**
 * Web CSS injection for TIL Design Tokens
 * =========================================
 * Call injectTilTheme() once BEFORE createRoot() in main.tsx.
 * Injects all design tokens as CSS custom properties into <head>.
 * Supports both :root (light) and .dark class.
 */

import { lightColors, darkColors, hsl, typography, radius, shadows, animation } from './tokens';

type ColorMap = Record<string, string>;

function buildSemanticVars(c: ColorMap): string {
  return `
  /* Core surfaces */
  --background:         ${c.background};
  --foreground:         ${c.foreground};
  --surface:            ${c.surface};
  --muted:              ${c.muted};
  --subtle:             ${c.subtle};
  --muted-foreground:   ${c.mutedForeground};

  /* Card / Popover */
  --card:               ${c.card};
  --card-foreground:    ${c.foreground};
  --card-border:        ${c.border};
  --popover:            ${c.card};
  --popover-foreground: ${c.foreground};
  --popover-border:     ${c.border};

  /* Primary */
  --primary:            ${c.primary};
  --primary-hover:      ${c.primaryHover};
  --primary-muted:      ${c.primaryMuted};
  --primary-foreground: ${c.primaryForeground};

  /* Secondary */
  --secondary:            ${c.secondary};
  --secondary-foreground: ${c.secondaryForeground};

  /* Accent */
  --accent:            ${c.accent};
  --accent-hover:      ${c.accentHover};
  --accent-foreground: ${c.accentForeground};

  /* Status */
  --success:            ${c.success};
  --success-muted:      ${c.successMuted};
  --success-foreground: ${c.successForeground};
  --warning:            ${c.warning};
  --warning-muted:      ${c.warningMuted};
  --warning-foreground: ${c.warningForeground};
  --danger:             ${c.danger};
  --danger-muted:       ${c.dangerMuted};
  --danger-foreground:  ${c.dangerForeground};
  --info:               ${c.info};
  --info-muted:         ${c.infoMuted};
  --info-foreground:    ${c.infoForeground};
  --destructive:        ${c.destructive};
  --destructive-foreground: ${c.destructiveForeground};

  /* Borders */
  --border:  ${c.border};
  --divider: ${c.divider};
  --input:   ${c.input};
  --ring:    ${c.ring};

  /* Sidebar */
  --sidebar:                    ${c.sidebarBg};
  --sidebar-foreground:         ${c.sidebarText};
  --sidebar-border:             ${c.sidebarBorder};
  --sidebar-primary:            ${c.sidebarActive};
  --sidebar-primary-foreground: ${c.sidebarActiveFg};
  --sidebar-accent:             ${c.sidebarHover};
  --sidebar-accent-foreground:  ${c.sidebarText};
  --sidebar-ring:               ${c.ring};`;
}

function buildHslVars(): string {
  return `
  /* HSL primitives (hsl-wrapped Tailwind token references) */
  --hsl-navy:      ${hsl.navy};
  --hsl-gold:      ${hsl.gold};
  --hsl-navy-dark: ${hsl.navyDark};
  --hsl-navy-deep: ${hsl.navyDeep};`;
}

function buildTypographyVars(): string {
  return `
  --font-sans:    ${typography.fontFamily.sans};
  --font-mono:    ${typography.fontFamily.mono};
  --font-display: ${typography.fontFamily.display};
  --app-font-sans:    ${typography.fontFamily.sans};
  --app-font-serif:   Georgia, serif;
  --app-font-mono:    ${typography.fontFamily.mono};

  --text-xs:   ${typography.fontSize.xs}px;
  --text-sm:   ${typography.fontSize.sm}px;
  --text-base: ${typography.fontSize.base}px;
  --text-lg:   ${typography.fontSize.lg}px;
  --text-xl:   ${typography.fontSize.xl}px;
  --text-2xl:  ${typography.fontSize['2xl']}px;
  --text-3xl:  ${typography.fontSize['3xl']}px;
  --text-4xl:  ${typography.fontSize['4xl']}px;`;
}

function buildSpacingVars(): string {
  return `
  --radius:    ${radius.webCss};
  --radius-sm: calc(${radius.webCss} - 4px);
  --radius-md: calc(${radius.webCss} - 2px);
  --radius-lg: ${radius.webCss};
  --radius-xl: calc(${radius.webCss} + 8px);

  --shadow-sm:  ${shadows.web.sm};
  --shadow:     ${shadows.web.md};
  --shadow-md:  ${shadows.web.md};
  --shadow-lg:  ${shadows.web.lg};
  --shadow-glow:${shadows.web.glow};
  --shadow-2xl: ${shadows.web['2xl']};
  --shadow-xs:  0px 1px 2px 0px rgba(0,0,0,0.05);
  --shadow-2xs: 0px 1px 2px 0px rgba(0,0,0,0.05);

  --duration-fast:   ${animation.duration.fast}ms;
  --duration-normal: ${animation.duration.normal}ms;
  --duration-slow:   ${animation.duration.slow}ms;
  --ease-in:  ${animation.easing.easeIn};
  --ease-out: ${animation.easing.easeOut};
  --ease-spring: ${animation.easing.spring};`;
}

export function injectTilTheme(): void {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('til-design-tokens');
  if (existing) existing.remove();

  const lightVars = buildSemanticVars(lightColors as unknown as ColorMap);
  const darkVars  = buildSemanticVars(darkColors  as unknown as ColorMap);

  const style = document.createElement('style');
  style.id = 'til-design-tokens';
  style.textContent = `
:root {
  --button-outline: rgba(0,0,0,.10);
  --badge-outline:  rgba(0,0,0,.05);
  --opaque-button-border-intensity: -8;
  --elevate-1: rgba(0,0,0,.03);
  --elevate-2: rgba(0,0,0,.08);
${buildHslVars()}
${buildTypographyVars()}
${buildSpacingVars()}
${lightVars}

  /* Derived borders (Tailwind v4 relative color syntax) */
  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary,${hsl.gold})) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --sidebar-accent-border:  hsl(from hsl(var(--sidebar-accent,${hsl.navyDark})) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --primary-border:     hsl(from hsl(var(--primary,${hsl.navy})) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --secondary-border:   hsl(from hsl(var(--secondary,${hsl.gray50})) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --muted-border:       hsl(from hsl(var(--muted,${hsl.gray50})) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --accent-border:      hsl(from hsl(var(--accent,${hsl.gold})) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --destructive-border: hsl(from hsl(var(--destructive,${hsl.red})) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
}

.dark {
  --button-outline: rgba(255,255,255,.10);
  --badge-outline:  rgba(255,255,255,.05);
  --opaque-button-border-intensity: 9;
  --elevate-1: rgba(255,255,255,.04);
  --elevate-2: rgba(255,255,255,.09);
${darkVars}
}
`;

  document.head.prepend(style);
}
