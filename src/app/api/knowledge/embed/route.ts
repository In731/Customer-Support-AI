import { NextRequest, NextResponse } from "next/server";
import { KnowledgeChunk, KnowledgeDocument } from "@/model/knowledge.model";
import { GoogleGenAI } from "@google/genai";
import { getSession } from "@/lib/getSession";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import connectDb from "@/lib/db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Rate Limiter: Allow 60 batch requests per minute (plenty for our Client-Side queue of 5 chunks)
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
});

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const tenantId = sessionData?.user?.id;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Apply rate limiting
        const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
        const { success } = await ratelimit.limit(`embed_${ip}`);
        if (!success) {
            return NextResponse.json({ error: "Too many batch requests. Slow down." }, { status: 429 });
        }

        await connectDb();
        const { documentId, chunks } = await req.json();

        if (!documentId || !chunks || !Array.isArray(chunks)) {
            return NextResponse.json({ error: "Invalid payload. Expected documentId and chunks array." }, { status: 400 });
        }

        // Security Patch: Prevent massive array payload attacks (Resource Exhaustion)
        if (chunks.length > 20) {
            return NextResponse.json({ error: "Payload too large. Maximum 20 chunks allowed per batch." }, { status: 413 });
        }

        // Security Patch: Verify Document Ownership
        const docExists = await KnowledgeDocument.findOne({ _id: documentId, tenantId });
        if (!docExists) {
            return NextResponse.json({ error: "Document not found or unauthorized." }, { status: 404 });
        }

        // Process the batch
        const docsToInsert = [];
        for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            
            const response = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: chunk,
            });
            
            const rawValues = (response as unknown as { embedding?: { values: number[] }; embeddings?: Array<{ values: number[] }> }).embedding?.values 
                || (response as unknown as { embedding?: { values: number[] }; embeddings?: Array<{ values: number[] }> }).embeddings?.[0]?.values;
                
            const embedding = rawValues ? rawValues.slice(0, 768) : null;
            if (embedding && embedding.length > 0) {
                docsToInsert.push({
                    documentId,
                    tenantId,
                    text: chunk,
                    embedding
                });
            }
        }

        // Bulk insert to MongoDB for massive performance gain
        if (docsToInsert.length > 0) {
            await KnowledgeChunk.insertMany(docsToInsert);
        }

        return NextResponse.json({ success: true, message: `Embedded ${docsToInsert.length} chunks.` });
    } catch (error: unknown) {
        console.error("Embedding batch error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to embed batch";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
