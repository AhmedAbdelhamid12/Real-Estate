/**
 * Web CSS injection for TIL Design Tokens
 * =========================================
 * Call injectTilTheme() once at app startup (before createRoot).
 * Inserts a <style> element with all CSS custom properties for both light and dark themes.
 */

import { lightTheme, darkTheme, typography, radius, shadow } from './tokens';

function buildRootVars(theme: Record<string, string>): string {
  return `
  --background: ${theme.background};
  --foreground: ${theme.foreground};
  --border: ${theme.border};
  --input: ${theme.input};
  --ring: ${theme.ring};
  --card: ${theme.card};
  --card-foreground: ${theme.cardForeground};
  --card-border: ${theme.cardBorder};
  --popover: ${theme.popover};
  --popover-foreground: ${theme.popoverForeground};
  --popover-border: ${theme.popoverBorder};
  --primary: ${theme.primary};
  --primary-foreground: ${theme.primaryForeground};
  --secondary: ${theme.secondary};
  --secondary-foreground: ${theme.secondaryForeground};
  --muted: ${theme.muted};
  --muted-foreground: ${theme.mutedForeground};
  --accent: ${theme.accent};
  --accent-foreground: ${theme.accentForeground};
  --destructive: ${theme.destructive};
  --destructive-foreground: ${theme.destructiveForeground};
  --sidebar: ${theme.sidebar};
  --sidebar-foreground: ${theme.sidebarForeground};
  --sidebar-border: ${theme.sidebarBorder};
  --sidebar-primary: ${theme.sidebarPrimary};
  --sidebar-primary-foreground: ${theme.sidebarPrimaryForeground};
  --sidebar-accent: ${theme.sidebarAccent};
  --sidebar-accent-foreground: ${theme.sidebarAccentForeground};
  --sidebar-ring: ${theme.sidebarRing};
  --chart-1: ${theme.chart1};
  --chart-2: ${theme.chart2};
  --chart-3: ${theme.chart3};
  --chart-4: ${theme.chart4};
  --chart-5: ${theme.chart5};`;
}

export function injectTilTheme(): void {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('til-design-tokens');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'til-design-tokens';
  style.textContent = `
:root {
  --button-outline: rgba(0,0,0,.10);
  --badge-outline: rgba(0,0,0,.05);
  --opaque-button-border-intensity: -8;
  --elevate-1: rgba(0,0,0,.03);
  --elevate-2: rgba(0,0,0,.08);

  --app-font-sans: ${typography.fontSans};
  --app-font-serif: ${typography.fontSerif};
  --app-font-mono: ${typography.fontMono};

  --radius: ${radius.webCss};

  --shadow-2xs: 0px 1px 2px 0px rgba(0,0,0,0.05);
  --shadow-xs:  0px 1px 2px 0px rgba(0,0,0,0.05);
  --shadow-sm:  ${shadow.sm};
  --shadow:     ${shadow.md};
  --shadow-md:  ${shadow.md};
  --shadow-lg:  ${shadow.lg};
  --shadow-xl:  ${shadow.xl};
  --shadow-2xl: ${shadow['2xl']};

  --sidebar-primary-border: hsl(from hsl(var(--sidebar-primary)) h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --sidebar-accent-border:  hsl(from hsl(var(--sidebar-accent))  h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --primary-border:         hsl(from hsl(var(--primary))         h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --secondary-border:       hsl(from hsl(var(--secondary))       h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --muted-border:           hsl(from hsl(var(--muted))           h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --accent-border:          hsl(from hsl(var(--accent))          h s calc(l + var(--opaque-button-border-intensity)) / alpha);
  --destructive-border:     hsl(from hsl(var(--destructive))     h s calc(l + var(--opaque-button-border-intensity)) / alpha);
${buildRootVars(lightTheme as unknown as Record<string, string>)}
}

.dark {
  --button-outline: rgba(255,255,255,.10);
  --badge-outline: rgba(255,255,255,.05);
  --opaque-button-border-intensity: 9;
  --elevate-1: rgba(255,255,255,.04);
  --elevate-2: rgba(255,255,255,.09);
${buildRootVars(darkTheme as unknown as Record<string, string>)}
}
`;

  document.head.prepend(style);
}
