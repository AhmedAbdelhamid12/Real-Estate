---
name: Design tokens shared package
description: How lib/design-tokens connects to both CRM (web) and mobile app
---

## Setup
- Package: `lib/design-tokens` → `@workspace/design-tokens`
- Single source of truth: `lib/design-tokens/src/tokens.ts`
- Web entry: `src/web.ts` exports `injectTilTheme()` — injects `<style>` into `<head>` at startup
- Native entry: `src/native.ts` exports `tilColors` — drop-in for mobile's constants/colors.ts

## Web CRM integration
- `artifacts/crm/vite.config.ts` has explicit aliases:
  - `@workspace/design-tokens/web` → `lib/design-tokens/src/web.ts`
  - `@workspace/design-tokens/native` → `lib/design-tokens/src/native.ts`
  - `@workspace/design-tokens/tokens` → `lib/design-tokens/src/tokens.ts`
  - `@workspace/design-tokens` → `lib/design-tokens/src/index.ts`
- `server.fs.strict: false` required so Vite can serve files outside artifact root
- `artifacts/crm/src/main.tsx` calls `injectTilTheme()` before `createRoot`
- `artifacts/crm/src/index.css` contains only Tailwind config (@theme inline, @layer base) — no :root or .dark blocks

## Mobile integration
- Metro bundler resolves `@workspace/design-tokens` via pnpm workspace symlinks automatically
- `artifacts/mobile/constants/colors.ts` re-exports from `@workspace/design-tokens/native`

**Why:**
Needed cross-platform design consistency; changing tokens.ts propagates to both platforms with no manual sync.

**How to apply:**
To change any brand color, typography, or radius: edit `lib/design-tokens/src/tokens.ts` only. Both apps pick up changes on hot reload.

**Critical:**
- Import paths inside `lib/design-tokens/src/` must use bare extensions (e.g. `./tokens` not `./tokens.js`) — Metro can't resolve `.js` imports to `.ts` files.
- pnpm workspace resolution works for Metro but NOT automatically for Vite — Vite needs explicit aliases.
