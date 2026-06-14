---
name: Editorial Design System
description: Editorial palette applied system-wide to PropOS CRM web + mobile; key token values, patterns, and pitfalls
---

## Active Palette (darkColors in tokens.ts)
- background: `#080F1C`, card: `#0D1A2E`, surface/muted: `#0D1829`
- border: `rgba(200,168,75,0.15)` — gold-tinted, NOT solid navy
- mutedForeground: `#3D5878` — deeper/more navy-tinted than default slate-500
- sidebarBg: `#060D18`, sidebarBorder: `rgba(200,168,75,0.14)`
- Gold accents: primary `#C9A84C`, hover `#D4B86A`

## Visual Signatures Applied
- **LoginPage.tsx**: full editorial split-panel layout — "Sign / In." stroke display type + stats left, underline inputs + outlined gold CTA right
- **Sidebar.tsx**: 2px gold gradient accent line at very top of sidebar (before logo)
- **TopBar.tsx**: gold border-bottom `rgba(200,168,75,0.14)` instead of `border-b` class
- **index.css**: `.dark body` grid texture via `background-image` linear-gradients (48×48 grid, gold at 0.028 opacity); utility classes `til-gold-divider`, `til-card-glow`

## Token Propagation
- **Web**: all changes auto-propagate via CSS custom properties from `injectTilTheme()` — charts, cards, inputs, badges all use semantic tokens
- **Mobile**: `useColors()` hook → `c = theme.colors` → reads `darkColors` from tokens.ts → all screens update automatically

## Mobile Hardcoded Color Pattern
- Use `c.sidebarActiveFg` (not hardcoded `#0A1E38`) for dark text/icons on gold/primary backgrounds
- `c.sidebarActiveFg` = `#060D18` — the token for "foreground on sidebar active (gold) item"
- Static `StyleSheet.create()` cannot reference `c` — only `makeStyles(c, ...)` functions can

**Why:** `#0A1E38` was hardcoded old navy; `sidebarActiveFg` is the design-token equivalent and stays in sync
