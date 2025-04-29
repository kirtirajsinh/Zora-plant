// src/lib/ai.ts (or your file path)
import { GoogleGenAI } from "@google/genai";


export const ExtractSymbolFromText = async (text: string): Promise<string> => {
    console.log("extracting Symbol")

    if(!process.env.GOOGLE_API_KEY) {
        console.log("NO API KEY present")
        return "";  // Return empty string instead of undefined
    }
    // --- Prompt Engineering ---
    // New prompt: Only return a single word (the symbol), no extra text or formatting.
    const prompt = `
Context: You are an AI assistant that extracts or generates a Crypto Coin token symbol from a user's request and Strictly respond with one word no description or any explanation.

User Request: "${text}"

Task: Analyze the User Request and return ONLY the desired ticker symbol for the token (usually 3-5 uppercase letters, one word, no spaces or special characters). 
- If the user explicitly mentions a symbol, return that symbol exactly as they wrote it (in uppercase).
- If no symbol is mentioned, generate a plausible, creative symbol based on the name, description, or theme of the request (e.g., if the request is about plants, you might return "PLANT" or "LEAF").
- Do NOT include any explanation, JSON, markdown, or extra text—just the symbol itself.

Example Input: "I want to create a token for my new dog walking service called 'Pawsome Walks'. The ticker should be PAWS."
Example Output: PAWS

Example Input: "Coin this myplant on zora"
Example Output: MYPLANT

Example Input: "Create a token for a plant lovers club."
Example Output: PLANTLOVERS

Now, process the User Request above and provide ONLY the symbol.
`;

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    try {
        const resp = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });
        const contentResponse = resp.text?.trim();

        if (!contentResponse) {
            throw new Error("Gemini AI response is empty or undefined.");
        }

        // Clean and validate the symbol
        const symbol = contentResponse.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (!symbol) {
            throw new Error(`AI returned an empty or invalid symbol. Original text: "${text}", Response: "${contentResponse}"`);
        }

        return symbol;
    } catch (error) {
        console.error("Error generating symbol with Gemini AI:", error);
        throw new Error(`AI processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
};

