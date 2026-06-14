import { Resend } from "resend";
import { logger } from "./logger";

const resend = process.env["RESEND_API_KEY"]
  ? new Resend(process.env["RESEND_API_KEY"])
  : null;

if (!resend) {
  logger.warn("RESEND_API_KEY not configured — emails will be logged only");
}

const FROM_NAME = "PropOS CRM";
const FROM_EMAIL = process.env["SMTP_FROM"] ?? "onboarding@resend.dev";

async function send(opts: { to: string; subject: string; html: string }) {
  if (!resend) {
    logger.info({ to: opts.to, subject: opts.subject }, "Email (Resend not configured)");
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      logger.error({ error }, "Resend email error");
    }
  } catch (err) {
    logger.error({ err }, "Failed to send email via Resend");
  }
}

const brandColor = "#C9A84C";
const bgColor = "#0F172A";

function baseTemplate(content: string) {
  return `
    <div style="background:${bgColor};min-height:100vh;padding:40px 0;font-family:'Segoe UI',sans-serif">
      <div style="max-width:520px;margin:auto;background:#1E293B;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4)">
        <div style="background:${brandColor};padding:24px 32px;text-align:center">
          <h1 style="margin:0;color:#0F172A;font-size:22px;font-weight:700;letter-spacing:1px">PropOS CRM</h1>
        </div>
        <div style="padding:32px">
          ${content}
        </div>
        <div style="padding:16px 32px;border-top:1px solid #334155;text-align:center">
          <p style="margin:0;color:#64748B;font-size:12px">© 2026 PropOS CRM · TIL Real Estate Group</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendVerificationCode(to: string, name: string, code: string) {
  await send({
    to,
    subject: "Your PropOS verification code",
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 8px">Verify your email</h2>
      <p style="color:#94A3B8;margin:0 0 24px">Hi ${name}, use the code below to verify your email. It expires in <strong style="color:#F1F5F9">15 minutes</strong>.</p>
      <div style="font-size:40px;font-weight:800;letter-spacing:12px;text-align:center;padding:24px;background:#0F172A;border-radius:10px;margin:0 0 24px;color:${brandColor};border:2px solid ${brandColor}">
        ${code}
      </div>
      <p style="color:#64748B;font-size:13px;margin:0">If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
}

export async function sendWelcomePendingApproval(to: string, name: string) {
  await send({
    to,
    subject: "Account created — awaiting admin approval",
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 8px">You're almost in! 🎉</h2>
      <p style="color:#94A3B8;margin:0 0 16px">Hi ${name},</p>
      <p style="color:#94A3B8;margin:0 0 16px">Your email has been verified successfully. Your account is now <strong style="color:${brandColor}">pending admin approval</strong>.</p>
      <p style="color:#94A3B8;margin:0">You'll receive another email as soon as your account is activated.</p>
    `),
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
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 16px">New registration pending approval</h2>
      <p style="color:#94A3B8;margin:0 0 20px">A new user has verified their email and is waiting for your approval:</p>
      <div style="background:#0F172A;border-radius:8px;padding:20px;margin:0 0 20px">
        <p style="margin:0 0 8px;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Name:</span> ${newUserName}</p>
        <p style="margin:0 0 8px;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Email:</span> ${newUserEmail}</p>
        <p style="margin:0;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Role:</span> ${role}</p>
      </div>
      <a href="${process.env["APP_URL"] ?? ""}/employees/pending" style="display:inline-block;background:${brandColor};color:#0F172A;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Review in PropOS CRM</a>
    `),
  });
}

export async function sendPasswordResetLink(to: string, name: string, resetUrl: string) {
  await send({
    to,
    subject: "Reset your PropOS CRM password",
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 8px">Password reset request</h2>
      <p style="color:#94A3B8;margin:0 0 16px">Hi ${name},</p>
      <p style="color:#94A3B8;margin:0 0 24px">We received a request to reset your password. Click the button below — it expires in <strong style="color:#F1F5F9">1 hour</strong>.</p>
      <div style="text-align:center;margin:0 0 24px">
        <a href="${resetUrl}" style="display:inline-block;background:${brandColor};color:#0F172A;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Reset Password</a>
      </div>
      <p style="color:#64748B;font-size:13px;margin:0">If you didn't request a reset, you can safely ignore this email.</p>
    `),
  });
}

export async function sendAccountApprovedEmail(to: string, name: string, appUrl: string) {
  await send({
    to,
    subject: "Your PropOS account has been approved! 🎉",
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 8px">Welcome to PropOS CRM! 🎉</h2>
      <p style="color:#94A3B8;margin:0 0 16px">Hi ${name},</p>
      <p style="color:#94A3B8;margin:0 0 24px">Great news! Your account has been <strong style="color:#22C55E">approved</strong>. You can now log in and start using the platform.</p>
      <div style="text-align:center;margin:0 0 24px">
        <a href="${appUrl}/login" style="display:inline-block;background:${brandColor};color:#0F172A;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">Log in to PropOS</a>
      </div>
    `),
  });
}

export async function sendAccountRejectedEmail(to: string, name: string, reason: string | null) {
  await send({
    to,
    subject: "PropOS account application update",
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 8px">Account Application Update</h2>
      <p style="color:#94A3B8;margin:0 0 16px">Hi ${name},</p>
      <p style="color:#94A3B8;margin:0 0 16px">Unfortunately, your PropOS CRM account application was not approved at this time.</p>
      ${reason ? `<div style="background:#0F172A;border-radius:8px;padding:16px;margin:0 0 16px"><p style="margin:0;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Reason:</span> ${reason}</p></div>` : ""}
      <p style="color:#64748B;font-size:13px;margin:0">If you believe this is an error, please contact your administrator.</p>
    `),
  });
}

export async function sendLeadAssignedEmail(
  to: string,
  salesName: string,
  leadName: string,
  leadPhone: string,
  projectName: string | null,
  appUrl: string
) {
  await send({
    to,
    subject: `New lead assigned to you: ${leadName}`,
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 8px">New Lead Assigned 🎯</h2>
      <p style="color:#94A3B8;margin:0 0 16px">Hi ${salesName}, a new lead has been assigned to you:</p>
      <div style="background:#0F172A;border-radius:8px;padding:20px;margin:0 0 20px">
        <p style="margin:0 0 8px;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Lead:</span> ${leadName}</p>
        <p style="margin:0 0 8px;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Phone:</span> ${leadPhone}</p>
        ${projectName ? `<p style="margin:0;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Project:</span> ${projectName}</p>` : ""}
      </div>
      <a href="${appUrl}/leads" style="display:inline-block;background:${brandColor};color:#0F172A;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">View Lead in PropOS</a>
    `),
  });
}

export async function sendLeadStatusChangedEmail(
  to: string,
  salesName: string,
  leadName: string,
  oldStatus: string,
  newStatus: string,
  appUrl: string
) {
  const isWon = newStatus === "won";
  const emoji = isWon ? "🏆" : newStatus === "lost" ? "😔" : "📊";
  await send({
    to,
    subject: `Lead status updated: ${leadName} → ${newStatus}`,
    html: baseTemplate(`
      <h2 style="color:#F1F5F9;margin:0 0 8px">Lead Status Updated ${emoji}</h2>
      <p style="color:#94A3B8;margin:0 0 16px">Hi ${salesName},</p>
      <div style="background:#0F172A;border-radius:8px;padding:20px;margin:0 0 20px">
        <p style="margin:0 0 8px;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Lead:</span> ${leadName}</p>
        <p style="margin:0 0 8px;color:#94A3B8"><span style="color:${brandColor};font-weight:600">Previous status:</span> ${oldStatus}</p>
        <p style="margin:0;color:#94A3B8"><span style="color:${brandColor};font-weight:600">New status:</span> <span style="color:${isWon ? "#22C55E" : "#F1F5F9"}">${newStatus}</span></p>
      </div>
      ${isWon ? `<p style="color:#22C55E;font-weight:600;margin:0 0 20px">Congratulations on closing the deal! 🎉</p>` : ""}
      <a href="${appUrl}/leads" style="display:inline-block;background:${brandColor};color:#0F172A;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">View in PropOS</a>
    `),
  });
}
