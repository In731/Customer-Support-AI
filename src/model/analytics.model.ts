import { Schema, model, models } from "mongoose";

// --- Daily Analytics ---
interface IDailyAnalytics {
    ownerId: string;
    date: string; // Format: YYYY-MM-DD
    totalQueries: number;
    deflectedQueries: number;
    escalatedQueries: number; // e.g. unanswered or explicitly escalated
}

const dailyAnalyticsSchema = new Schema<IDailyAnalytics>({
    ownerId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    totalQueries: { type: Number, default: 0 },
    deflectedQueries: { type: Number, default: 0 },
    escalatedQueries: { type: Number, default: 0 },
}, { timestamps: true });

// Compound index for fast upserts per day per tenant
dailyAnalyticsSchema.index({ ownerId: 1, date: 1 }, { unique: true });

export const DailyAnalytics = models.DailyAnalytics || model<IDailyAnalytics>("DailyAnalytics", dailyAnalyticsSchema);


// --- Unanswered Queries ---
interface IUnansweredQuery {
    ownerId: string;
    question: string;
    createdAt: Date;
}

const unansweredQuerySchema = new Schema<IUnansweredQuery>({
    ownerId: { type: String, required: true, index: true },
    question: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// TTL Index: Auto-delete unanswered queries after 30 days (2592000 seconds)
unansweredQuerySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const UnansweredQuery = models.UnansweredQuery || model<IUnansweredQuery>("UnansweredQuery", unansweredQuerySchema);
