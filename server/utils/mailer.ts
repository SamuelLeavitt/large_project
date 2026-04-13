// Email delivery via Resend HTTPS API only (Nodemailer removed).

async function sendViaResendApi(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.MAIL_FROM || "";
  const timeoutMs = Number(process.env.RESEND_API_TIMEOUT_MS || "15000");

  if (!apiKey) {
    console.error("[auth-email] No Resend API key configured");
    return false;
  }

  if (!from) {
    console.error("[auth-email] No MAIN_FROM env variable configured);
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
      console.error("[auth-email] Resend raw error response:", errorText);
      throw new Error(`Resend API error ${response.status}: ${errorText || response.statusText}`);
    }

    console.log("[auth-email] Sent email via Resend API:", {
      from,
      to: options.to,
      subject: options.subject,
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[auth-email] Failed to send email:", {
      from,
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
  const sent = await sendViaResendApi(options);

  if (!sent) {
    throw new Error("Verification email failed to send");
  }
}
