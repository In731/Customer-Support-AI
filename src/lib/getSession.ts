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
        const validator = typeof scalekit.validateToken === "function" 
            ? scalekit.validateToken.bind(scalekit) 
            : typeof (scalekit as unknown as { validateAccessToken?: (t: string) => Promise<unknown> }).validateAccessToken === "function"
                ? (scalekit as unknown as { validateAccessToken: (t: string) => Promise<unknown> }).validateAccessToken.bind(scalekit)
                : null;

        if (!validator) {
            console.error("Scalekit token validator method not found");
            return null;
        }

        const result = await validator(token);
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