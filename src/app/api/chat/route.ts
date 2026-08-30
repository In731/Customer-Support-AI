import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { KnowledgeChunk } from "@/model/knowledge.model";
import { DailyAnalytics, UnansweredQuery } from "@/model/analytics.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { isOriginAllowed } from "@/lib/cors";

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(15, "1 m"), // 15 requests per minute per IP to match Gemini Free Tier
    analytics: true,
});

export async function POST(req: NextRequest) {
    try {
        const { message, ownerId } = await req.json()
        if (!message || !ownerId) {
            return NextResponse.json(
                { message: "message and owner id is required" },
                { status: 400 }
            )
        }

        // Apply rate limiting
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            const res = NextResponse.json({ message: "Too many requests" }, { status: 429 });
            res.headers.set("Access-Control-Allow-Origin", "*");
            res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.headers.set("Access-Control-Allow-Headers", "Content-Type");
            return res;
        }

        await connectDb()
        const setting = await Settings.findOne({ ownerId })
        if (!setting) {
            return NextResponse.json(
                { message: "chat bot is not configured yet." },
                { status: 400 }
            )
        }

        // Domain Whitelisting (CORS Firewall)
        const requestOrigin = req.headers.get("origin") || req.headers.get("referer") || "";
        let allowedOrigin = "*";
        
        if (setting.allowedDomains && setting.allowedDomains.length > 0) {
            const isAllowed = isOriginAllowed(requestOrigin, setting.allowedDomains);
            if (!isAllowed) {
                const res = NextResponse.json({ message: "Forbidden: Domain not whitelisted" }, { status: 403 });
                res.headers.set("Access-Control-Allow-Origin", requestOrigin || "*");
                return res;
            }
            allowedOrigin = requestOrigin;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // 1. Generate Embedding for user message
        const embeddingResponse = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: message,
        });
        const queryEmbedding = embeddingResponse.embeddings?.[0]?.values?.slice(0, 768);

        let additionalKnowledge = "";
        if (queryEmbedding) {
            // 2. Perform Vector Search in MongoDB
            const similarChunks = await KnowledgeChunk.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index", // Name of the index in Atlas
                        path: "embedding",
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 3,
                        filter: { tenantId: ownerId } 
                    }
                },
                {
                    $project: {
                        text: 1,
                        score: { $meta: "vectorSearchScore" }
                    }
                }
            ]);
            additionalKnowledge = similarChunks.map(c => c.text).join("\n\n");
        }

        const KNOWLEDGE = `
        business name- ${setting.businessName || "not provided"}
        supportEmail- ${setting.supportEmail || "not provided"}
        knowledge- ${setting.knowledge || " not provided"}
        
        Additional specific documentation context:
        ${additionalKnowledge}
        `

        const prompt = `
You are a professional customer support assistant for this business.

Use ONLY the information provided below to answer the customer's question.
You may rephrase, summarize, or interpret the information if needed.
Do NOT invent new policies, prices, or promises.
If you cannot answer the question based on the information provided, reply EXACTLY with: "I'm sorry, I don't have that information in my knowledge base. Please contact our human support team at ${setting.supportEmail || "our support email"} for further assistance. Is there anything else I can help you with today?"

--------------------
BUSINESS INFORMATION
--------------------
${KNOWLEDGE}

--------------------
CUSTOMER QUESTION
--------------------
${message}

--------------------
ANSWER
--------------------
`;

        const res = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
        });

        const responseText = res.text || "I'm sorry, I don't have that information in my knowledge base.";
        const isEscalated = responseText.includes("I'm sorry, I don't have that information in my knowledge base.");
        const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // Asynchronously log analytics so we don't block the response
        (async () => {
            try {
                await DailyAnalytics.findOneAndUpdate(
                    { ownerId, date: dateStr },
                    { 
                        $inc: { 
                            totalQueries: 1, 
                            deflectedQueries: isEscalated ? 0 : 1,
                            escalatedQueries: isEscalated ? 1 : 0
                        } 
                    },
                    { upsert: true }
                );

                if (isEscalated) {
                    await UnansweredQuery.create({ ownerId, question: message });
                }
            } catch (err) {
                console.error("Analytics Logging Error:", err);
            }
        })();

        const response = NextResponse.json(responseText)
        response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response

    } catch (error) {
        console.error("CHAT API ERROR:", error);
        const response = NextResponse.json(
            { message: `chat error ${error}` },
            { status: 500 }
        )
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type");
        return response
    }
}

export const OPTIONS = async () => {
    return NextResponse.json(null, {
        status: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    })
}