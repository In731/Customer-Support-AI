import { NextRequest, NextResponse } from "next/server";
import { KnowledgeChunk } from "@/model/knowledge.model";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { getSession } from "@/lib/getSession";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URL as string, { family: 4 });
}

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const tenantId = (sessionData as any)?.user?.id;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { documentId, chunks } = await req.json();

        if (!documentId || !chunks || !Array.isArray(chunks)) {
            return NextResponse.json({ error: "Invalid payload. Expected documentId and chunks array." }, { status: 400 });
        }

        // Process the batch
        const docsToInsert = [];
        for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            
            // We use gemini-embedding-001 sequentially in this batch
            const response = await ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: chunk,
            });
            
            const embedding = response.embeddings?.[0]?.values?.slice(0, 768);
            if (embedding) {
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
    } catch (error: any) {
        console.error("Embedding batch error:", error);
        return NextResponse.json({ error: error.message || "Failed to embed batch" }, { status: 500 });
    }
}
