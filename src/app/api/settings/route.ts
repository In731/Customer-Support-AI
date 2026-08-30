import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/getSession";

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const ownerId = sessionData?.user?.id;
        if (!ownerId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { businessName, supportEmail, knowledge, primaryColor, widgetIcon, welcomeMessage, allowedDomains } = await req.json()
        await connectDb()
        const settings = await Settings.findOneAndUpdate(
            { ownerId },
            { ownerId, businessName, supportEmail, knowledge, primaryColor, widgetIcon, welcomeMessage, allowedDomains },
            { new: true, upsert: true }
        )
        return NextResponse.json(settings)
    } catch (error: unknown) {
        console.error("Settings update error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to update settings";
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
}


