import { Router } from "express";
import crypto from "crypto";
import passport from "passport";
import { db, usersTable } from "@workspace/db";
import { eq, and, gt, inArray } from "drizzle-orm";
import {
  createSession,
  deleteSession,
  hashPassword,
  verifyPassword,
  getUserFromRequest,
} from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";
import {
  sendVerificationCode,
  sendWelcomePendingApproval,
  sendAdminNewUserAlert,
  sendPasswordResetLink,
} from "../lib/email";
import { sanitizeUser } from "../lib/sanitize";
import { notificationsTable } from "@workspace/db";
import type { User } from "@workspace/db";

const router = Router();

function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getAppUrl(req: { headers: { host?: string } }): string {
  if (process.env["APP_URL"]) return process.env["APP_URL"];
  const protocol = process.env["NODE_ENV"] === "production" ? "https" : "http";
  return `${protocol}://${req.headers.host ?? "localhost"}`;
}

// GET /auth/team-leaders — public, for register form
router.get("/auth/team-leaders", async (req, res): Promise<void> => {
  try {
    const leaders = await db
      .select({ id: usersTable.id, name: usersTable.name })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, "team_leader"),
          eq(usersTable.status, "active")
        )
      );
    res.json(leaders);
  } catch {
    res.json([]);
  }
});

// POST /auth/register
router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, role, teamLeaderId } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: string;
    teamLeaderId?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const validRoles = ["ceo", "admin", "director", "team_leader", "sales"] as const;
  type ValidRole = typeof validRoles[number];
  const userRole: ValidRole = (validRoles.includes(role as ValidRole) ? role : "sales") as ValidRole;

  if (userRole === "sales" && !teamLeaderId) {
    // teamLeaderId is optional for sales (admin can assign later)
  }

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const verifyCode = generateVerifyCode();
  const verifyTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email: email.toLowerCase(),
      passwordHash,
      phone: phone ?? null,
      status: "pending",
      role: userRole,
      teamLeaderId: userRole === "sales" && teamLeaderId ? teamLeaderId : null,
      verifyToken: verifyCode,
      verifyTokenExpires,
    })
    .returning();

  // Send verification code email (non-blocking)
  sendVerificationCode(user.email, user.name, verifyCode).catch((err) => {
    req.log.error({ err }, "Failed to send verification email");
  });

  res.status(201).json({ user: sanitizeUser(user) });
});

// POST /auth/verify-email
router.post("/auth/verify-email", async (req, res): Promise<void> => {
  const { email, code } = req.body as { email?: string; code?: string };

  if (!email || !code) {
    res.status(400).json({ error: "email and code are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    res.status(400).json({ error: "Invalid code" });
    return;
  }

  if (user.emailVerifiedAt) {
    res.json({ success: true, message: "Email already verified" });
    return;
  }

  if (
    !user.verifyToken ||
    user.verifyToken !== code ||
    !user.verifyTokenExpires ||
    user.verifyTokenExpires < new Date()
  ) {
    res.status(400).json({ error: "Invalid or expired verification code" });
    return;
  }

  await db
    .update(usersTable)
    .set({
      emailVerifiedAt: new Date(),
      verifyToken: null,
      verifyTokenExpires: null,
    })
    .where(eq(usersTable.id, user.id));

  // Send welcome email + in-app notifications + email admins (non-blocking)
  sendWelcomePendingApproval(user.email, user.name).catch((err) => {
    req.log.error({ err }, "Failed to send welcome email");
  });

  db.select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(
      and(
        inArray(usersTable.role, ["admin", "ceo"]),
        eq(usersTable.status, "active")
      )
    )
    .then(async (admins) => {
      if (admins.length === 0) return;

      // In-app notifications for each admin/CEO
      await db.insert(notificationsTable).values(
        admins.map((admin) => ({
          userId: admin.id,
          type: "new_user_pending",
          titleEn: "New user awaiting approval",
          bodyEn: `${user.name} (${user.email}) registered as ${user.role} and is pending approval.`,
          link: "/employees/pending",
        }))
      );

      // Email admins
      const adminEmails = admins.map((a) => a.email);
      await sendAdminNewUserAlert(adminEmails, user.name, user.email, user.role);
    })
    .catch((err) => {
      req.log.error({ err }, "Failed to send admin notifications");
    });

  res.json({ success: true });
});

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Enforce email verification for password-based accounts
  if (!user.emailVerifiedAt) {
    res.status(403).json({ error: "Please verify your email before logging in. Check your inbox for the verification code." });
    return;
  }

  const token = await createSession(user.id);

  res.cookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ user: sanitizeUser(user), token, accessToken: token });
});

// POST /auth/logout
router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.["session"];
  if (token) {
    await deleteSession(token);
    res.clearCookie("session", { path: "/" });
  }
  res.json({ success: true });
});

// GET /auth/me
router.get("/auth/me", async (req, res): Promise<void> => {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json(sanitizeUser(user));
});

// POST /auth/forgot-password
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  // Always respond OK to avoid email enumeration
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db
      .update(usersTable)
      .set({ resetToken, resetTokenExpires })
      .where(eq(usersTable.id, user.id));

    const appUrl = getAppUrl(req);
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    sendPasswordResetLink(user.email, user.name, resetUrl).catch((err) => {
      req.log.error({ err }, "Failed to send password reset email");
    });
  }

  res.json({ success: true });
});

// POST /auth/reset-password
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    res.status(400).json({ error: "token and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.resetToken, token))
    .limit(1);

  if (
    !user ||
    !user.resetTokenExpires ||
    user.resetTokenExpires < new Date()
  ) {
    res.status(400).json({ error: "Invalid or expired reset token" });
    return;
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(usersTable)
    .set({ passwordHash, resetToken: null, resetTokenExpires: null })
    .where(eq(usersTable.id, user.id));

  res.json({ success: true });
});

// POST /auth/resend-verification
router.post("/auth/resend-verification", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (!user) {
    res.status(400).json({ error: "No account found with this email" });
    return;
  }

  if (user.emailVerifiedAt) {
    res.status(400).json({ error: "Email already verified" });
    return;
  }

  const verifyCode = generateVerifyCode();
  const verifyTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

  await db
    .update(usersTable)
    .set({ verifyToken: verifyCode, verifyTokenExpires })
    .where(eq(usersTable.id, user.id));

  sendVerificationCode(user.email, user.name, verifyCode).catch((err) => {
    req.log.error({ err }, "Failed to resend verification email");
  });

  res.json({ success: true });
});

// ── OAuth ─────────────────────────────────────────────────────────────────────

async function handleOAuthCallback(
  req: Parameters<typeof getUserFromRequest>[0],
  res: { cookie: Function; redirect: Function; status: Function; json: Function },
  user: User
) {
  const token = await createSession(user.id);
  (res as any).cookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  // Redirect to frontend — if new/pending user, the frontend AuthContext handles the pending screen
  (res as any).redirect("/");
}

// GET /auth/google
router.get(
  "/auth/google",
  (req, res, next) => {
    const googleConfigured = !!process.env["GOOGLE_CLIENT_ID"];
    if (!googleConfigured) {
      res.status(503).json({ error: "Google OAuth is not configured" });
      return;
    }
    passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
  }
);

// GET /auth/google/callback
router.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err: Error | null, user: User | false) => {
      if (err || !user) {
        return res.redirect("/?error=oauth_failed");
      }
      await handleOAuthCallback(req, res, user);
    })(req, res, next);
  }
);

// GET /auth/facebook
router.get(
  "/auth/facebook",
  (req, res, next) => {
    const facebookConfigured = !!process.env["FACEBOOK_CLIENT_ID"];
    if (!facebookConfigured) {
      res.status(503).json({ error: "Facebook OAuth is not configured" });
      return;
    }
    passport.authenticate("facebook", { scope: ["email"], session: false })(req, res, next);
  }
);

// GET /auth/facebook/callback
router.get(
  "/auth/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", { session: false }, async (err: Error | null, user: User | false) => {
      if (err || !user) {
        return res.redirect("/?error=oauth_failed");
      }
      await handleOAuthCallback(req, res, user);
    })(req, res, next);
  }
);

export default router;
