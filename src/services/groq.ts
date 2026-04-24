import Groq from "groq-sdk";

const cleanKey = (key: string) => {
  if (!key) return "";
  let k = key;
  if (k.includes('=')) k = k.split('=')[1];
  return k.trim().replace(/^["']|["']$/g, '');
};

const getGroqKey = () => {
  const vKey = (import.meta.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || "");
  const clean = cleanKey(vKey);
  // Groq keys start with gsk_
  if (clean && clean.startsWith('gsk_') && clean.length > 30) return clean;
  return "";
};

export const generateGroqResponse = async (
  prompt: string,
  systemInstruction: string,
  onChunk?: (text: string) => void
) => {
  const apiKey = getGroqKey();
  if (!apiKey) return null;

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
    
    const stream = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;
      if (onChunk) onChunk(content);
    }

    return fullText;
  } catch (error) {
    console.error("Groq Fallback Error:", error);
    return null;
  }
};
