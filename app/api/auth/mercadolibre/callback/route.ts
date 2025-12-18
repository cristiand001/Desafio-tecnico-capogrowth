import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/lib/mercadolibre";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is required" },
      { status: 400 }
    );
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);

    console.log("=== OAuth Callback Debug ===");
    console.log("Token received:", tokenResponse.access_token ? "YES" : "NO");
    console.log("Token length:", tokenResponse.access_token?.length);
    console.log("Expires in:", tokenResponse.expires_in);
    console.log("User ID:", tokenResponse.user_id);
    console.log("About to set cookies...");

    // Create redirect response to home page
    const redirectUrl = new URL("/", request.nextUrl.origin);
    redirectUrl.searchParams.set("success", "true");

    const response = NextResponse.redirect(redirectUrl);

    // Store token in HTTP-only cookie for security
    response.cookies.set("ml_access_token", tokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: tokenResponse.expires_in,
      path: "/",
    });

    response.cookies.set("ml_refresh_token", tokenResponse.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    response.cookies.set("ml_user_id", String(tokenResponse.user_id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: tokenResponse.expires_in,
      path: "/",
    });

    console.log("Cookies set successfully");
    console.log("Redirecting to:", redirectUrl.toString());

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);

    const redirectUrl = new URL("/", request.nextUrl.origin);
    redirectUrl.searchParams.set("error", "auth_failed");

    return NextResponse.redirect(redirectUrl);
  }
}
