const { GoogleGenAI } = require("@google/genai");

async function listModels() {
    const ai = new GoogleGenAI({ apiKey: "AQ.Ab8RN6J9hlJ9-djZnQUr_s1seyiJrcj6XYU_TId-KqyXDkS8Fw" });
    
    try {
        // Since we don't know the exact method in this SDK, we might have to use raw fetch.
        // Let's try raw fetch to Gemini API to list models.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        console.log("Supported Models for generateContent:");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                console.log(m.name);
            }
        });
    } catch(e) {
        console.error(e);
    }
}
listModels();
