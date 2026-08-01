import mongoose, { Schema, Document } from "mongoose";

export interface IKnowledgeDocument extends Document {
  tenantId: string;
  title: string;
  fileName?: string;
  status: "processing" | "embedded" | "failed";
  createdAt: Date;
}

const KnowledgeDocumentSchema: Schema = new Schema({
  tenantId: { type: String, required: true },
  title: { type: String, required: true },
  fileName: { type: String },
  status: { type: String, enum: ["processing", "embedded", "failed"], default: "processing" },
  createdAt: { type: Date, default: Date.now }
});

export const KnowledgeDocument = mongoose.models.KnowledgeDocument || mongoose.model<IKnowledgeDocument>("KnowledgeDocument", KnowledgeDocumentSchema);

export interface IKnowledgeChunk extends Document {
  documentId: mongoose.Types.ObjectId;
  tenantId: string;
  text: string;
  embedding: number[];
}

const KnowledgeChunkSchema: Schema = new Schema({
  documentId: { type: Schema.Types.ObjectId, ref: "KnowledgeDocument", required: true },
  tenantId: { type: String, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }
});

export const KnowledgeChunk = mongoose.models.KnowledgeChunk || mongoose.model<IKnowledgeChunk>("KnowledgeChunk", KnowledgeChunkSchema);
