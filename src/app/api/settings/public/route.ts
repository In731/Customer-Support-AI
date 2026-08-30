import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const ownerId = req.nextUrl.searchParams.get("ownerId");
        
        if (!ownerId) {
            return NextResponse.json(
                { message: "owner id is required" },
                { status: 400 }
            )
        }

        await connectDb()
        const setting = await Settings.findOne({ ownerId })
        
        if (!setting) {
            return NextResponse.json(
                { message: "chat bot is not configured yet." },
                { status: 404 }
            )
        }

        // ONLY return safe public configuration data. DO NOT return knowledge or supportEmail.
        const publicSettings = {
            businessName: setting.businessName || "Support AI",
            primaryColor: setting.primaryColor || "#000000",
            widgetIcon: setting.widgetIcon || "🤖",
            welcomeMessage: setting.welcomeMessage || "Hi! How can I help you today?"
        }

        const response = NextResponse.json(publicSettings)
        
        // Ensure CORS is allowed so any website can fetch the UI config
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        
        return response
    } catch (error: unknown) {
        console.error("Public settings error:", error);
        return NextResponse.json(
            { message: "Failed to load widget settings" },
            { status: 500 }
        );
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(null, {
        status: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    })
}
