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
        await connectDb()
        const setting = await Settings.findOne(
            { ownerId }
        )
        return NextResponse.json(setting)
    } catch (error) {
        return NextResponse.json(
            { message: `get setting error ${error}` },
            { status: 500 }
        )
    }
}