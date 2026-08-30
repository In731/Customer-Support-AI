import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

export async function POST() {
    try {
        const sessionData = await getSession();
        const ownerId = sessionData?.user?.id;
        if (!ownerId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        await connectDb();
        const setting = await Settings.findOne({ ownerId });
        return NextResponse.json(setting);
    } catch (error: unknown) {
        console.error("Settings fetch error:", error);
        return NextResponse.json(
            { message: "Failed to fetch settings" },
            { status: 500 }
        );
    }
}