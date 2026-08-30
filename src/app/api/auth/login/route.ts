import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUri = `${origin}/api/auth/callback`;
        const url = scalekit.getAuthorizationUrl(redirectUri);
        return NextResponse.redirect(url);
    } catch (error) {
        console.error("Login redirect error:", error);
        return NextResponse.json(
            { error: "Failed to generate login URL", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}