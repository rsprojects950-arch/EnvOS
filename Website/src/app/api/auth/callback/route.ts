import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { isDisposableDomain } from "@/lib/email-validator";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin;

  const response = NextResponse.redirect(new URL("/dashboard", appUrl));

  if (code) {
    try {
      const supabase = createServerClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data?.session) {
        const userEmail = (data.session.user?.email || "").trim().toLowerCase();
        if (isDisposableDomain(userEmail)) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login?error=disposable_email", appUrl));
        }

        // Set secure auth cookies for server and middleware access
        response.cookies.set("sb-access-token", data.session.access_token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: data.session.expires_in,
        });

        response.cookies.set("sb-refresh-token", data.session.refresh_token, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });
      }
    } catch (err) {
      console.error("[Auth Callback Server Error]", err);
    }
  }

  return response;
}
