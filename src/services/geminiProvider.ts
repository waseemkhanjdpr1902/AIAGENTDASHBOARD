import { GoogleGenerativeAI } from "@google/generative-ai";

const cleanKey = (key: string) => {
  if (!key) return "";
  let k = key;
  if (k.includes('=')) k = k.split('=')[1];
  return k.trim().replace(/^["']|["']$/g, '');
};

const getGeminiKey = () => {
    // VITE_ prefix for client side
    const vKey = (import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "");
    const clean = cleanKey(vKey);
    // Real keys are usually ~39 chars
    if (clean && clean.length > 20) return clean;
    return "";
};

export const generateGeminiResponse = async (
  prompt: string,
  systemInstruction: string,
  onChunk?: (text: string) => void
) => {
  const apiKey = getGeminiKey();
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: systemInstruction 
    });

    const result = await model.generateContentStream(prompt);

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      if (onChunk) onChunk(chunkText);
    }

    return fullText;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
