import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_PASSWORD || "nexsupport_admin_2026";

/**
 * Generates a deterministic hash for the admin session cookie.
 */
function getExpectedToken(): string {
    return crypto.createHash("sha256").update(ADMIN_SECRET + "_admin_session_salt").digest("hex");
}

/**
 * Verifies if the incoming password matches the environment variable.
 */
export function verifyAdminPassword(password: string): boolean {
    if (!password) return false;
    return password === ADMIN_SECRET;
}

/**
 * Generates an admin session token upon successful password validation.
 */
export function generateAdminSessionToken(): string {
    return getExpectedToken();
}

/**
 * Server-side check to verify if the request has an authenticated Admin session.
 */
export async function getAdminSession(): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("admin_session")?.value;
        if (!token) return false;
        
        // Constant-time comparison to prevent timing attacks
        const expected = getExpectedToken();
        if (token.length !== expected.length) return false;
        return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
    } catch (error) {
        console.error("Admin session verification error:", error);
        return false;
    }
}
