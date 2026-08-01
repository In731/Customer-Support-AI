import connectDb from "@/lib/db";
import Settings from "@/model/settings.model";
import { KnowledgeChunk } from "@/model/knowledge.model";
import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { message, ownerId } = await req.json()
        if (!message || !ownerId) {
            return NextResponse.json(
                { message: "message and owner id is required" },
                { status: 400 }
            )
        }
        await connectDb()
        const setting = await Settings.findOne({ ownerId })
        if (!setting) {
            return NextResponse.json(
                { message: "chat bot is not configured yet." },
                { status: 400 }
            )
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
                        // If you are using dedicated clusters, you can uncomment the filter line. For shared tier clusters (M0), filtering inside vectorSearch is limited.
                        // filter: { tenantId: ownerId } 
                    }
                },
                { $match: { tenantId: ownerId } }, // Enforce tenant filter after search if M0 tier is used
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

        const response = NextResponse.json(res.text)
        response.headers.set("Access-Control-Allow-Origin", "*");
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