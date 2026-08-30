import { cookies } from "next/headers";
import { scalekit } from "./scalekit";
import { AppSession } from "@/types";

export async function getSession(): Promise<AppSession | null> {
    const session = await cookies();
    const token = session.get("access_token")?.value;
    if (!token) {
        return null;
    }
    try {
        const result = await scalekit.validateToken(token);
        if (!result || typeof result !== "object" || !("sub" in result)) {
            return null;
        }
        const user = await scalekit.user.getUser((result as { sub: string }).sub);
        return { user: user as unknown as { id: string; email?: string; name?: string } };
    } catch (error) {
        console.error("Session validation error:", error);
        return null;
    }
}