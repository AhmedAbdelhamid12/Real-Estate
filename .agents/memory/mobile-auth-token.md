---
name: Mobile auth token fix
description: Why the API login route must return token in the response body, not just set a cookie
---

## The Problem
The Express login route set a `session` cookie and returned `{ user }` (no token).
The Expo mobile app cannot reliably read httpOnly cookies cross-origin.
The mobile AuthContext expected `data.token ?? data.accessToken` from the login response body.
Result: token was always empty string → every subsequent request returned 401.

## The Fix
`artifacts/api-server/src/routes/auth.ts` login handler:
```typescript
res.json({ user: sanitizeUser(user), token, accessToken: token });
```

Both `token` and `accessToken` are returned so either pattern in the client works.

**Why:**
Express session cookies work for web (same origin via Vite proxy), but Expo/RN fetch does not forward httpOnly cookies cross-origin. Mobile must use Bearer token header instead.

**How to apply:**
- `getUserFromRequest` in auth.ts already reads `req.headers.authorization?.replace("Bearer ", "")` — no server-side change needed there.
- Mobile AsyncStorage stores the token under key `auth_token`.
- Mobile sends `Authorization: Bearer {token}` on every authenticated request.
- Do NOT rely on `Cookie` header from mobile clients — it won't work in Expo web/native.
