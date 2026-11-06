import { Resend } from "resend";
import { validateEmail } from "./email-validator";

export interface SendVerificationEmailParams {
  email: string;
  name?: string;
  verificationUrl: string;
}

export async function sendVerificationEmail({
  email,
  name,
  verificationUrl,
}: SendVerificationEmailParams): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "EnvOS <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("[Resend] Missing RESEND_API_KEY in environment variables.");
    return {
      success: false,
      error: "Resend API key is not configured.",
    };
  }

  const validation = validateEmail(email);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error || "Invalid recipient email address.",
    };
  }

  const recipientName = name?.trim() || "Developer";

  // Modern Apple / EnvOS Dark Glass Styled Email HTML Template
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your EnvOS Account</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #05070c;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f1f5f9;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #05070c;
      padding: 40px 16px;
    }
    .card {
      max-width: 520px;
      margin: 0 auto;
      background: #0c101a;
      border: 1px solid #1e293b;
      border-radius: 24px;
      padding: 40px 36px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      text-align: center;
    }
    .logo-badge {
      display: inline-block;
      padding: 8px 18px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 0.05em;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14.5px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 24px 0;
    }
    .btn-container {
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      padding: 14px 34px;
      border-radius: 14px;
      box-shadow: 0 8px 24px rgba(2, 132, 199, 0.35);
    }
    .divider {
      border-top: 1px solid #1e293b;
      margin: 32px 0 24px 0;
    }
    .footer-text {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }
    .fallback-url {
      font-size: 11px;
      color: #38bdf8;
      word-break: break-all;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo-badge">🪐 EnvOS CLOUD WORKSPACE</div>
      <h1>Verify your Email Address</h1>
      <p>Hello ${recipientName},</p>
      <p>
        Thank you for creating an account on EnvOS. Please verify your email address to activate your cloud operating system, collaborative workspaces, and runner nodes.
      </p>

      <div class="btn-container">
        <a href="${verificationUrl}" class="btn" target="_blank">
          Verify Email & Launch Workspace
        </a>
      </div>

      <p class="footer-text">
        This link will expire in 24 hours. If you did not create an account on EnvOS, you can safely ignore this email.
      </p>

      <div class="divider"></div>

      <div class="footer-text">
        Having trouble with the button? Copy and paste this URL into your browser:<br>
        <div class="fallback-url">${verificationUrl}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Verify your EnvOS Workspace Account",
      html: emailHtml,
    });

    if (result.error) {
      console.error("[Resend Error]", result.error);
      return {
        success: false,
        error: result.error.message || "Failed to send email via Resend.",
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (err: any) {
    console.error("[Resend Exception]", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with Resend API.",
    };
  }
}
