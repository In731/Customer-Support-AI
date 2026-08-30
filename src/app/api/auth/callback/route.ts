import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const redirectUri = `${origin}/api/auth/callback`;

    if (!code) {
      return NextResponse.json({ message: "Authorization code not found" }, { status: 400 });
    }

    const session = await scalekit.authenticateWithCode(code, redirectUri) as unknown as Record<string, unknown>;
    const token = (session.accessToken as string) || (session.access_token as string) || (session.idToken as string) || (session.id_token as string);

    if (!token) {
      console.error("No access token found in Scalekit response:", session);
      return NextResponse.redirect(`${origin}?auth_error=no_token`);
    }

    const response = NextResponse.redirect(`${origin}/dashboard`);

    response.cookies.set("access_token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Scalekit Auth Callback Error:", error);
    return NextResponse.redirect(`${origin}?auth_error=true`);
  }
}