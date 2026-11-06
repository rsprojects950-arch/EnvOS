import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/resend";
import { validateEmail } from "@/lib/email-validator";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limit: Max 3 resend attempts per 5 minutes per IP
    const rateCheck = checkRateLimit(`resend:${clientIp}`, {
      intervalMs: 5 * 60 * 1000,
      maxRequests: 3,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${rateCheck.retryAfterSeconds} seconds before requesting another email.`,
        },
        { status: 429 }
      );
    }

    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = validation.normalizedEmail;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationUrl = `${appUrl}/api/auth/verify?email=${encodeURIComponent(normalizedEmail)}`;

    const emailResult = await sendVerificationEmail({
      email: normalizedEmail,
      name,
      verificationUrl,
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Verification email re-sent successfully via Resend.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to resend email." }, { status: 500 });
  }
}

