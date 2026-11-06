import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Redirect to login or dashboard with verified status badge
  const redirectUrl = new URL("/login", appUrl);
  redirectUrl.searchParams.set("verified", "true");
  if (email) {
    redirectUrl.searchParams.set("email", email);
  }

  return NextResponse.redirect(redirectUrl);
}

