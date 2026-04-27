import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const isEmailEnabled = !!process.env.RESEND_API_KEY;

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resend) {
    console.warn("[mail] RESEND_API_KEY not set. Email skipped:", subject, "->", to);
    return { success: false, reason: "EMAIL_DISABLED" };
  }
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@castfolio.com",
      to,
      subject,
      html,
      text,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("[mail] Failed to send email:", error);
    return { success: false, error };
  }
}

export async function sendNotificationEmail({
  to,
  title,
  body,
  link,
}: {
  to: string;
  title: string;
  body: string;
  link?: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1a1a1a;">${title}</h2>
      <p style="color: #444; line-height: 1.6;">${body}</p>
      ${link ? `<a href="${link}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #2563EB; color: white; border-radius: 6px; text-decoration: none;">확인하기</a>` : ""}
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Castfolio · <a href="${process.env.NEXT_PUBLIC_APP_URL}">castfolio.com</a></p>
    </div>
  `;
  return sendEmail({ to, subject: title, html });
}
