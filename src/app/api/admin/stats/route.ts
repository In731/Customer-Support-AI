import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { KnowledgeDocument, KnowledgeChunk } from "@/model/knowledge.model";
import { DailyAnalytics, UnansweredQuery } from "@/model/analytics.model";

export async function GET() {
    try {
        const isAdmin = await getAdminSession();
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        await connectDb();

        // 1. High-Level Platform KPI Counts
        const [
            totalCompanies,
            totalDocuments,
            totalVectors,
            totalUnansweredCount,
            analyticsTotals,
            companiesList
        ] = await Promise.all([
            Settings.countDocuments(),
            KnowledgeDocument.countDocuments(),
            KnowledgeChunk.countDocuments(),
            UnansweredQuery.countDocuments(), // Only count as requested
            DailyAnalytics.aggregate([
                {
                    $group: {
                        _id: null,
                        totalQueries: { $sum: "$totalQueries" },
                        deflectedQueries: { $sum: "$deflectedQueries" },
                        escalatedQueries: { $sum: "$escalatedQueries" }
                    }
                }
            ]),
            Settings.aggregate([
                {
                    $lookup: {
                        from: "knowledgedocuments",
                        localField: "ownerId",
                        foreignField: "tenantId",
                        as: "docs"
                    }
                },
                {
                    $lookup: {
                        from: "knowledgechunks",
                        localField: "ownerId",
                        foreignField: "tenantId",
                        as: "chunks"
                    }
                },
                {
                    $project: {
                        ownerId: 1,
                        businessName: 1,
                        supportEmail: 1,
                        allowedDomains: 1,
                        createdAt: 1,
                        documentCount: { $size: "$docs" },
                        vectorChunkCount: { $size: "$chunks" }
                    }
                },
                { $sort: { createdAt: -1 } }
            ])
        ]);

        const totals = analyticsTotals[0] || {
            totalQueries: 0,
            deflectedQueries: 0,
            escalatedQueries: 0
        };

        const deflectionRate = totals.totalQueries > 0
            ? Math.round((totals.deflectedQueries / totals.totalQueries) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            kpis: {
                totalCompanies,
                totalDocuments,
                totalVectors,
                totalQueries: totals.totalQueries,
                deflectedQueries: totals.deflectedQueries,
                escalatedQueries: totals.escalatedQueries,
                deflectionRate,
                totalUnansweredCount // Only the count
            },
            companies: companiesList
        });

    } catch (error) {
        console.error("Admin stats aggregation error:", error);
        return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
    }
}
