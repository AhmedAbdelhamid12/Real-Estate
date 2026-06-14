---
name: Mobile auth pattern
description: How Expo mobile app handles authentication in the PropOS monorepo
---

- `setBaseUrl()` from `@workspace/api-client-react` is called at module level in `app/_layout.tsx` (outside any component), NOT inside AuthContext.
- AuthContext stores JWT in AsyncStorage under key `auth_token`.
- `/auth/me` fetch uses both `Authorization: Bearer <tok>` header AND `Cookie: token=<tok>` for compatibility with cookie-based sessions.
- Auth routing guard lives in `AuthGate` component wrapping the Stack in `_layout.tsx`.
- `useAuthContext()` exposes `{ user, token, isLoading, signIn, signOut }`.

**Why:** Expo bundles run outside the web proxy so absolute URLs are required; the dual header approach handles both session cookie and bearer token auth modes.
