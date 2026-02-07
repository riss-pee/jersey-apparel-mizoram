
import {GoogleGenAI} from "@google/genai";

export const generateProductDescription = async (team: string, name: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a high-end sports copywriter for 'Jersey Apparel Mizoram'. 
      Write a compelling, premium description for a football jersey for ${team} called ${name}.
      
      Requirements:
      - Highlight the authentic fabric quality and moisture-wicking technology.
      - Mention that it's perfect for both the pitch and casual streetwear in Aizawl.
      - Evoke local pride and passion for the beautiful game in Mizoram.
      - Use professional but exciting language.
      - Keep it under 80 words.`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text?.trim() || "Unmatched quality meets unparalleled comfort. Represent your favorite colors with this premium edition kit, engineered for performance and styled for the streets of Aizawl.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A premium quality jersey built for performance and style. Featuring high-grade fabric designed for the ultimate fan experience.";
  }
};
