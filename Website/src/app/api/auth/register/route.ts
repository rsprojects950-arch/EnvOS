import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendVerificationEmail } from "@/lib/resend";
import { validateEmail } from "@/lib/email-validator";
import { checkRateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    // 1. IP-Based Sliding Window Rate Limiting (5 requests per 10 minutes)
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateCheck = checkRateLimit(`register:${clientIp}`, {
      intervalMs: 10 * 60 * 1000,
      maxRequests: 5,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 2. Production Email & Anti-Burner Validation
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = validation.normalizedEmail;

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 1. Register with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name || normalizedEmail.split("@")[0],
        },
        emailRedirectTo: `${appUrl}/api/auth/callback`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Build custom verification link
    // Users can click this link to verify and activate their workspace
    const verificationUrl = `${appUrl}/api/auth/verify?email=${encodeURIComponent(normalizedEmail)}`;

    // 3. Dispatch branded verification email via Resend
    const emailResult = await sendVerificationEmail({
      email: normalizedEmail,
      name,
      verificationUrl,
    });

    if (!emailResult.success) {
      console.warn("[Register Warning] Resend email dispatch failed:", emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      email: normalizedEmail,
      emailSent: emailResult.success,
      resendDetails: emailResult.data || null,
    });
  } catch (err: any) {
    console.error("[Register Error]", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}

