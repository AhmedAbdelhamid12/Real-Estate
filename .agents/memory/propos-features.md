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
- IMPORTANT: `t()` uses `{{var}}` double-brace format for var substitution (line 780 in i18nContext.tsx)
- All translation strings now use `{{var}}` — single-brace `{var}` WON'T be replaced

## AppLayout RTL Fix
- `artifacts/crm/src/components/layout/AppLayout.tsx` outer div uses `dir={dir}`
- `dir` comes from `useI18n()` context
- Sidebar slides to right side in Arabic

## ProjectsPage
- Full CRUD: create/edit/delete with dialogs
- Fields: name, location, ownerName, avgPrice, description, imageUrl, totalUnits, completionPercentage, deliveryDate, status
- Image upload via `/api/upload` endpoint (device file picker)
- Status dropdown: planning/under_construction/completed/cancelled
- Completion % shown as progress bar overlay on card image

## ResalePage
- Edit button opens dialog to edit unit details (PATCH /api/resale/:unitId)
- Fixed `{count}/{active}` bug by fixing translation strings to use `{{var}}`
- ToggleHideField + AddPhotoDialog + Edit + Delete in admin actions per card

## LeadsListPage
- Card grid view (4 cols), Arabic form labels
- Extra form fields: nationality, governorate, budget, notes
- Bulk Import button → BulkImportModal
- Cards have: View (navigate to /leads/:id), Assign (AssignLeadModal), Delete buttons

## LeadsKanbanPage
- Status-specific column gradient backgrounds + colored headers
- Drag-and-drop still works; cards navigate to /leads/:id on click
- Column counts show in colored badges

## ClientsPage
- Card grid view with avatar initials (color-hashed)
- Stats strip: total clients, this month, total deal value
- Sort options: newest, oldest, name A-Z, highest deal value
- Click card → details dialog

## EmployeesPage
- Card click navigates to /employees/:id
- Edit/Delete buttons stop propagation; appear on hover in top-right corner
- Online indicator dot (green/grey) on avatar

## PermissionsPage
- Custom toggle switch buttons (no Switch component — proper role-colored toggles)
- Role tabs: indigo/violet/blue/emerald gradient active states
- Lock/Unlock icons per permission

## ProfilePage
- File upload from device via hidden input + /api/upload endpoint
- Camera overlay on hover for avatar
- Removes URL-input approach (photo upload only)

## apiFetch vs customFetch
- `apiFetch` = raw fetch with `credentials: "include"` — use on web only
- `customFetch` = applies baseUrl + Bearer token — use on mobile
- `customFetch` returns PARSED body (not Response object); throws on non-2xx

## Workflow Config
- API server: `PORT=8080 pnpm --filter @workspace/api-server run dev`
- CRM frontend: `BASE_PATH=/ PORT=5173 pnpm --filter @workspace/crm run dev`
- Both run in same workflow via `&` (background)
- vite.config.ts requires BOTH `PORT` and `BASE_PATH` env vars (throws if missing)

## Framer Motion
- Variants `type` must be `"spring" as const` to avoid TS error
