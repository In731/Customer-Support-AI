import { cookies } from "next/headers";
import { scalekit } from "./scalekit";
import { AppSession } from "@/types";

export async function getSession(): Promise<AppSession | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;
        if (!token) {
            return null;
        }

        // Support both validateToken and validateAccessToken across Scalekit SDK versions
        let result: unknown = null;
        if (typeof (scalekit as unknown as { validateToken?: (t: string) => Promise<unknown> }).validateToken === "function") {
            result = await (scalekit as unknown as { validateToken: (t: string) => Promise<unknown> }).validateToken(token);
        } else if (typeof (scalekit as unknown as { validateAccessToken?: (t: string) => Promise<unknown> }).validateAccessToken === "function") {
            result = await (scalekit as unknown as { validateAccessToken: (t: string) => Promise<unknown> }).validateAccessToken(token);
        }

        if (!result || typeof result !== "object") {
            return null;
        }

        const claims = result as Record<string, unknown>;
        const userId = (claims.sub as string) || (claims.id as string) || ((claims.user as Record<string, unknown>)?.id as string);
        if (!userId) {
            return null;
        }

        let email = (claims.email as string) || ((claims.user as Record<string, unknown>)?.email as string) || "";
        let name = (claims.name as string) || ((claims.user as Record<string, unknown>)?.name as string) || "";

        // Fallback: If email wasn't in token claims, attempt to fetch user from Scalekit API without crashing on failure
        if (!email && scalekit.user && typeof scalekit.user.getUser === "function") {
            try {
                const profile = await scalekit.user.getUser(userId) as unknown as Record<string, unknown>;
                if (profile) {
                    email = (profile.email as string) || email;
                    name = (profile.name as string) || name;
                }
            } catch (err) {
                console.warn("Could not fetch user profile from Scalekit API, using token identity:", err);
            }
        }

        return {
            user: {
                id: userId,
                email: email || userId,
                name: name || undefined
            }
        };
    } catch (error) {
        console.error("Session validation error:", error);
        return null;
    }
}