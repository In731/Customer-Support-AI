import connectDb from "@/lib/db";
import { DailyAnalytics, UnansweredQuery } from "@/model/analytics.model";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

export async function GET(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const tenantId = (sessionData as any)?.user?.id;
        
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDb();

        // Get the last 30 days of analytics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dateStr = thirtyDaysAgo.toISOString().split("T")[0];

        const metrics = await DailyAnalytics.find({
            ownerId: tenantId,
            date: { $gte: dateStr }
        }).sort({ date: 1 });

        // Get the latest 50 unanswered queries
        const unanswered = await UnansweredQuery.find({ ownerId: tenantId })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ success: true, metrics, unanswered });
    } catch (error) {
        console.error("Analytics GET error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
