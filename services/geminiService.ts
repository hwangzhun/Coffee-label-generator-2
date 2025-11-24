import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// We create the client only if the key exists to avoid immediate errors, 
// but we handle the missing key in the function call.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateBeanDetails = async (name: string, origin: string, processType: string): Promise<{ flavorNotes: string, description: string } | null> => {
  if (!ai) {
    console.error("API Key is missing.");
    return null;
  }

  if (!name && !origin) return null;

  try {
    const prompt = `
      我正在为一款咖啡豆设计标签。
      名称: ${name}
      产地: ${origin}
      处理法: ${processType}

      请生成:
      1. flavorNotes: 3-5个诱人的风味关键词（用中文，逗号分隔）。
      2. description: 一段简短的、有营销吸引力的描述（中文，30字以内）。
      
      请以 JSON 格式返回。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flavorNotes: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["flavorNotes", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};