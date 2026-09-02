import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, generateAdminSessionToken } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        if (!password || !verifyAdminPassword(password)) {
            return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
        }

        const token = generateAdminSessionToken();
        const response = NextResponse.json({ success: true, message: "Admin authenticated" });

        response.cookies.set("admin_session", token, {
            httpOnly: true,
            maxAge: 8 * 60 * 60, // 8 hours
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return response;
    } catch (error) {
        console.error("Admin login error:", error);
        return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
}
