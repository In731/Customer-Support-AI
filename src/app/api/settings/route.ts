import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/getSession";

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const ownerId = (sessionData as any)?.user?.id;
        if (!ownerId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { businessName, supportEmail, knowledge, primaryColor, widgetIcon, welcomeMessage } = await req.json()
        await connectDb()
        const settings = await Settings.findOneAndUpdate(
            { ownerId },
            { ownerId, businessName, supportEmail, knowledge, primaryColor, widgetIcon, welcomeMessage },
            { new: true, upsert: true }
        )
        return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json(
            { message: `settings error ${error}` },
            { status: 500 }
        )
    }
}


