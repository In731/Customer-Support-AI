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

import { getSession } from "@/lib/getSession";

export async function POST(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const tenantId = (sessionData as any)?.user?.id;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const formData = await req.formData();
        const textSnippet = formData.get("textSnippet") as string | null;
        const uploadedFiles = formData.getAll("files").filter((value): value is File => value instanceof File);
        const legacyFile = formData.get("file");
        if (uploadedFiles.length === 0 && legacyFile instanceof File) {
            uploadedFiles.push(legacyFile);
        }

        if (uploadedFiles.length === 0 && !textSnippet) {
            return NextResponse.json({ error: "Please provide at least one PDF, TXT file, or text snippet." }, { status: 400 });
        }

        const sources = uploadedFiles.length > 0
            ? uploadedFiles.map((file) => ({ file, title: file.name, fileName: file.name }))
            : [{ file: null, title: "Text Snippet", fileName: undefined }];
        const documents = [];

        for (const source of sources) {
            let documentRecord;
            try {
                let extractedText = textSnippet || "";
                if (source.file) {
                    const buffer = Buffer.from(await source.file.arrayBuffer());
                    if (source.file.type === "application/pdf") {
                        extractedText = (await pdfParse(buffer)).text;
                    } else if (source.file.type === "text/plain") {
                        extractedText = buffer.toString("utf-8");
                    } else {
                        throw new Error(`${source.file.name}: only PDF and TXT files are supported.`);
                    }
                }

                if (!extractedText.trim()) {
                    throw new Error(`${source.title}: no text found to process.`);
                }

                documentRecord = await KnowledgeDocument.create({
                    tenantId,
                    title: source.title,
                    fileName: source.fileName,
                    status: "processing"
                });

                const chunks = chunkText(extractedText, 1000, 200);
                for (const chunk of chunks) {
                    if (!chunk.trim()) continue;
                    const response = await ai.models.embedContent({
                        model: "gemini-embedding-001",
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
                documents.push({ id: documentRecord._id, title: documentRecord.title, status: documentRecord.status });
            } catch (error: any) {
                if (documentRecord) {
                    documentRecord.status = "failed";
                    await documentRecord.save();
                }
                return NextResponse.json({ error: error.message || "Failed to ingest knowledge" }, { status: 400 });
            }
        }

        return NextResponse.json({ success: true, message: `${documents.length} document(s) uploaded and processed successfully.`, documents });
    } catch (error: any) {
        console.error("Ingestion error:", error);
        return NextResponse.json({ error: error.message || "Failed to ingest knowledge" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const tenantId = (sessionData as any)?.user?.id;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const documents = await KnowledgeDocument.aggregate([
            { $match: { tenantId } },
            {
                $lookup: {
                    from: "knowledgechunks",
                    let: { documentId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$documentId", "$$documentId"] } } },
                        { $count: "count" }
                    ],
                    as: "chunkStats"
                }
            },
            {
                $project: {
                    title: 1,
                    fileName: 1,
                    status: 1,
                    createdAt: 1,
                    chunkCount: { $ifNull: [{ $arrayElemAt: ["$chunkStats.count", 0] }, 0] }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json(documents);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to load documents" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const sessionData = await getSession();
        const tenantId = (sessionData as any)?.user?.id;
        if (!tenantId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { documentId } = await req.json();
        if (!documentId) {
            return NextResponse.json({ error: "documentId is required" }, { status: 400 });
        }

        await connectDB();
        const document = await KnowledgeDocument.findOne({ _id: documentId, tenantId });
        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        await KnowledgeChunk.deleteMany({ documentId: document._id, tenantId });
        await KnowledgeDocument.deleteOne({ _id: document._id });

        return NextResponse.json({ success: true, message: "Document removed from the knowledge base." });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to remove document" }, { status: 500 });
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
