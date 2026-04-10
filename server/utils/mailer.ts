// Email delivery via Resend HTTPS API only (Nodemailer removed).

async function sendViaResendApi(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS || "";
  const from = process.env.MAIL_FROM || "no-reply@example.com";
  const timeoutMs = Number(process.env.RESEND_API_TIMEOUT_MS || "15000");

  if (!apiKey) {
    console.error("[auth-email] No Resend API key configured");
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Resend API error ${response.status}: ${errorText || response.statusText}`);
    }

    console.log("[auth-email] Sent email via Resend API:", {
      to: options.to,
      subject: options.subject,
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[auth-email] Failed to send email:", {
      to: options.to,
      subject: options.subject,
      error: message,
    });
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendAuthEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  await sendViaResendApi(options);
}
