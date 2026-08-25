import { describe, it, expect, vi } from 'vitest';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

describe('Knowledge Base Chunking Logic', () => {
    it('should split text correctly according to constraints', async () => {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const sampleText = "A".repeat(2500); // 2500 character long string
        const chunks = await splitter.splitText(sampleText);

        expect(chunks.length).toBeGreaterThan(0);
        
        // Ensure no chunk exceeds the max limit of 1000
        for (const chunk of chunks) {
            expect(chunk.length).toBeLessThanOrEqual(1000);
        }

        // Check if there are exactly 3 chunks based on the math
        // C1: 0-1000, C2: 800-1800, C3: 1600-2500
        expect(chunks.length).toBe(3);
    });

    it('should handle small texts without splitting', async () => {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const smallText = "This is a small snippet.";
        const chunks = await splitter.splitText(smallText);

        expect(chunks.length).toBe(1);
        expect(chunks[0]).toBe(smallText);
    });
});
