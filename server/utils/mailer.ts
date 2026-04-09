import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT || "0");
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";

const hasSmtpConfig = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export async function sendAuthEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!transporter) {
    console.log("[auth-email] SMTP not configured, skipping send:", {
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@example.com",
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}
