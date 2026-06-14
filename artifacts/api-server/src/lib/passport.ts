import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { db, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

export function configurePassport() {
  const googleClientId = process.env["GOOGLE_CLIENT_ID"];
  const googleClientSecret = process.env["GOOGLE_CLIENT_SECRET"];
  const facebookClientId = process.env["FACEBOOK_CLIENT_ID"];
  const facebookClientSecret = process.env["FACEBOOK_CLIENT_SECRET"];

  if (googleClientId && googleClientSecret) {
    const callbackURL = `${process.env["APP_URL"] ?? ""}/api/auth/google/callback`;
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL,
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email =
              profile.emails?.[0]?.value?.toLowerCase() ?? null;
            if (!email) {
              return done(new Error("No email from Google profile"), undefined);
            }

            // Check if a user with this oauth combo already exists
            const [existing] = await db
              .select()
              .from(usersTable)
              .where(
                and(
                  eq(usersTable.oauthProvider, "google"),
                  eq(usersTable.oauthId, profile.id)
                )
              )
              .limit(1);

            if (existing) {
              return done(null, existing);
            }

            // Check if email already registered with password
            const [byEmail] = await db
              .select()
              .from(usersTable)
              .where(eq(usersTable.email, email))
              .limit(1);

            if (byEmail) {
              // Link oauth to existing account
              const [updated] = await db
                .update(usersTable)
                .set({ oauthProvider: "google", oauthId: profile.id })
                .where(eq(usersTable.id, byEmail.id))
                .returning();
              return done(null, updated);
            }

            // Create new user
            const [user] = await db
              .insert(usersTable)
              .values({
                name: profile.displayName || email.split("@")[0],
                email,
                oauthProvider: "google",
                oauthId: profile.id,
                emailVerifiedAt: new Date(),
                status: "pending",
                role: "sales",
              })
              .returning();

            return done(null, user);
          } catch (err) {
            logger.error({ err }, "Google OAuth error");
            return done(err as Error, undefined);
          }
        }
      )
    );
  } else {
    logger.warn("Google OAuth not configured (GOOGLE_CLIENT_ID/SECRET missing)");
  }

  if (facebookClientId && facebookClientSecret) {
    const callbackURL = `${process.env["APP_URL"] ?? ""}/api/auth/facebook/callback`;
    passport.use(
      new FacebookStrategy(
        {
          clientID: facebookClientId,
          clientSecret: facebookClientSecret,
          callbackURL,
          profileFields: ["id", "emails", "name", "displayName"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email =
              profile.emails?.[0]?.value?.toLowerCase() ?? null;

            const [existing] = await db
              .select()
              .from(usersTable)
              .where(
                and(
                  eq(usersTable.oauthProvider, "facebook"),
                  eq(usersTable.oauthId, profile.id)
                )
              )
              .limit(1);

            if (existing) {
              return done(null, existing);
            }

            if (email) {
              const [byEmail] = await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.email, email))
                .limit(1);

              if (byEmail) {
                const [updated] = await db
                  .update(usersTable)
                  .set({ oauthProvider: "facebook", oauthId: profile.id })
                  .where(eq(usersTable.id, byEmail.id))
                  .returning();
                return done(null, updated);
              }
            }

            const displayName =
              profile.displayName ||
              `${profile.name?.givenName ?? ""} ${profile.name?.familyName ?? ""}`.trim() ||
              "Facebook User";

            const userEmail = email ?? `fb_${profile.id}@oauth.local`;

            const [user] = await db
              .insert(usersTable)
              .values({
                name: displayName,
                email: userEmail,
                oauthProvider: "facebook",
                oauthId: profile.id,
                emailVerifiedAt: email ? new Date() : null,
                status: "pending",
                role: "sales",
              })
              .returning();

            return done(null, user);
          } catch (err) {
            logger.error({ err }, "Facebook OAuth error");
            return done(err as Error, undefined);
          }
        }
      )
    );
  } else {
    logger.warn("Facebook OAuth not configured (FACEBOOK_CLIENT_ID/SECRET missing)");
  }
}
