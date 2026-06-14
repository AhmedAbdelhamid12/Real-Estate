import nodemailer from "nodemailer";
import { logger } from "./logger";

function createTransport() {
  const host = process.env["SMTP_HOST"];
  const port = Number(process.env["SMTP_PORT"] ?? "587");
  const user = process.env["SMTP_USER"];
  const pass = process.env["SMTP_PASS"];

  if (!host || !user || !pass) {
    logger.warn("SMTP env vars not configured — emails will be logged only");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM_NAME = "PropOS CRM";
const FROM_EMAIL = process.env["SMTP_FROM"] ?? process.env["SMTP_USER"] ?? "noreply@propos.app";

async function send(opts: { to: string; subject: string; html: string }) {
  const transport = createTransport();
  if (!transport) {
    logger.info({ to: opts.to, subject: opts.subject }, "Email (SMTP not configured)");
    return;
  }
  await transport.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    ...opts,
  });
}

export async function sendVerificationCode(
  to: string,
  name: string,
  code: string
) {
  await send({
    to,
    subject: "Your PropOS CRM verification code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a1a1a">Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Use the code below to verify your email address. It expires in 15 minutes.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;padding:24px;background:#f4f4f5;border-radius:8px;margin:24px 0">
          ${code}
        </div>
        <p style="color:#666;font-size:13px">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendWelcomePendingApproval(to: string, name: string) {
  await send({
    to,
    subject: "Account created — awaiting admin approval",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a1a1a">You're almost in!</h2>
        <p>Hi ${name},</p>
        <p>Your email has been verified. Your account is now pending approval by an administrator.</p>
        <p>You'll receive another email as soon as your account is approved.</p>
        <p style="color:#666;font-size:13px">— The PropOS CRM team</p>
      </div>
    `,
  });
}

export async function sendAdminNewUserAlert(
  adminEmails: string[],
  newUserName: string,
  newUserEmail: string,
  role: string
) {
  if (adminEmails.length === 0) return;
  await send({
    to: adminEmails.join(", "),
    subject: `New user awaiting approval: ${newUserName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a1a1a">New registration pending approval</h2>
        <p>A new user has verified their email and is waiting for your approval:</p>
        <ul>
          <li><strong>Name:</strong> ${newUserName}</li>
          <li><strong>Email:</strong> ${newUserEmail}</li>
          <li><strong>Requested role:</strong> ${role}</li>
        </ul>
        <p>Log in to the PropOS CRM admin panel to approve or reject this account.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetLink(
  to: string,
  name: string,
  resetUrl: string
) {
  await send({
    to,
    subject: "Reset your PropOS CRM password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1a1a1a">Password reset request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the link below — it expires in 1 hour.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
            Reset Password
          </a>
        </div>
        <p style="color:#666;font-size:13px">If you didn't request a reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
