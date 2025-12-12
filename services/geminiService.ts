import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

const parseStudentData = async (inputText: string, imageBase64?: string, imageMimeType?: string): Promise<Partial<Student>[]> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    Extract student information from the provided input (text and/or image). 
    Return a JSON array of objects.
    
    Rules:
    - 'fullName' is required.
    - 'teachers' should be a comma-separated string if multiple.
    - 'startDate' and 'deadline' must be YYYY-MM-DD. Use current year if year is missing.
    - 'contactParent' and 'headTeacher' should be booleans based on context (e.g., "call mom", "HT issue").
    - 'level' should be inferred if possible, otherwise empty.
    - 'time' should be formatted like "5:20-6:20" if found.
    - If specific keywords like "Office Study" or "Hall Study" appear, hint at them but do not set 'section' strictly as that is handled by the UI context usually.
  `;

  const parts: any[] = [];

  // Add image part if provided
  if (imageBase64 && imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64
      }
    });
  }

  // Add text part (prompt + optional user text)
  parts.push({
    text: `${systemPrompt}\n\n${inputText ? `Text context: "${inputText}"` : ''}`
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fullName: { type: Type.STRING },
              behavior: { type: Type.STRING },
              level: { type: Type.STRING },
              teachers: { type: Type.STRING },
              startDate: { type: Type.STRING },
              deadline: { type: Type.STRING },
              contactParent: { type: Type.BOOLEAN },
              headTeacher: { type: Type.BOOLEAN },
              assistant: { type: Type.STRING },
              time: { type: Type.STRING },
            },
            required: ["fullName"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export { parseStudentData };