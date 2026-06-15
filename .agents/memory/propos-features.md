---
name: PropOS feature completions
description: Completed features, fixes, and patterns across web CRM and mobile app
---

## Mobile Auth Screens
- `register.tsx`, `forgot-password.tsx`, `verify-email.tsx` created in `artifacts/mobile/app/`
- All use `customFetch` from `@workspace/api-client-react` (returns parsed body, throws on error)
- `verify-email.tsx` has 60-second countdown timer
- All three registered in `_layout.tsx` AuthGate screen list
- Login footer has links to register and forgot-password

## Mobile Language Switcher
- `LanguageContext.tsx` in `artifacts/mobile/contexts/` — stores EN/AR in AsyncStorage
- `LanguageProvider` wraps the app in `_layout.tsx` (inside AuthProvider)
- Toggle button added to SETTINGS section of `profile.tsx` (below theme toggle)
- Shows gold-accented EN/AR badge pill; updates immediately on tap

## Web i18n
- All 8 pages (Leads, Projects, Clients, Dashboard, Planner, Employees, Profile, Reports) use `useI18n` hook
- `t()` keys: leads.*, clients.*, projects.*, employees.*, reports.*, profile.*, planner.*, nav.*, common.*
- All defined in `artifacts/crm/src/contexts/i18nContext.tsx`

## AppLayout RTL Fix
- `artifacts/crm/src/components/layout/AppLayout.tsx` outer div uses `dir={dir}`
- `dir` comes from `useI18n()` context
- Sidebar slides to right side in Arabic

## ProjectsPage imageUrl
- `projectSchema` includes `imageUrl: z.string().url().optional()`
- Create form has Cover Image URL field with live preview
- Project cards show actual image when `imageUrl` is set; fallback to Building2 icon
- API (`/api/projects`) already accepts and stores `imageUrl`

## ResalePage Photos
- `AddPhotoDialog` already existed — accepts URL + shows preview before saving
- POST to `/api/resale/:id/photos` with `{ url }` body
- `PhotoGallery` component already displays multi-photo carousels with nav arrows

## apiFetch vs customFetch
- `apiFetch` = raw fetch with `credentials: "include"` — use on web only
- `customFetch` = applies baseUrl + Bearer token — use on mobile
- `customFetch` returns PARSED body (not Response object); throws on non-2xx

## Framer Motion
- Variants `type` must be `"spring" as const` to avoid TS error
