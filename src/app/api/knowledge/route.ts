import { NextRequest, NextResponse } from "next/server";
import { KnowledgeDocument, KnowledgeChunk } from "@/model/knowledge.model";
import mongoose from "mongoose";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URL as string, { family: 4 });
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const textSnippet = formData.get("textSnippet") as string | null;
        // In a real app, this should come from user session
        const tenantId = formData.get("tenantId") as string || "default_tenant";

        let extractedText = "";
        let title = "Text Snippet";
        let fileName = undefined;

        if (file) {
            fileName = file.name;
            title = file.name;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (file.type === "application/pdf") {
                const pdfData = await pdfParse(buffer);
                extractedText = pdfData.text;
            } else if (file.type === "text/plain") {
                extractedText = buffer.toString('utf-8');
            } else {
                return NextResponse.json({ error: "Unsupported file type. Use PDF or TXT." }, { status: 400 });
            }
        } else if (textSnippet) {
            extractedText = textSnippet;
        } else {
            return NextResponse.json({ error: "Please provide a file or text snippet." }, { status: 400 });
        }

        if (!extractedText || !extractedText.trim()) {
            return NextResponse.json({ error: "No text found to process." }, { status: 400 });
        }

        // 1. Create Document Record
        const documentRecord = await KnowledgeDocument.create({
            tenantId,
            title,
            fileName,
            status: "processing"
        });

        await connectDB();

        // 2. Clear out any old 3072-dimension vectors for this user
        await KnowledgeChunk.deleteMany({ tenantId });

        // 2. Chunk text
        const chunks = chunkText(extractedText, 1000, 200);

        // 3. Generate embeddings
        for (const chunk of chunks) {
            if (!chunk.trim()) continue;
            const response = await ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: chunk,
            });
            const embedding = response.embeddings?.[0]?.values?.slice(0, 768);
            if (embedding) {
                await KnowledgeChunk.create({
                    documentId: documentRecord._id,
                    tenantId,
                    text: chunk,
                    embedding
                });
            }
        }

        documentRecord.status = "embedded";
        await documentRecord.save();

        return NextResponse.json({ success: true, message: "Knowledge ingested successfully.", documentId: documentRecord._id });
    } catch (error: any) {
        console.error("Ingestion error:", error);
        return NextResponse.json({ error: error.message || "Failed to ingest knowledge" }, { status: 500 });
    }
}

function chunkText(text: string, chunkSize: number, overlap: number) {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += chunkSize - overlap;
    }
    return chunks;
}
