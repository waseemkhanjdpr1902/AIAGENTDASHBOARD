import Anthropic from "@anthropic-ai/sdk";

const cleanKey = (key: string) => {
  if (!key) return "";
  let k = key;
  if (k.includes('=')) k = k.split('=')[1];
  return k.trim().replace(/^["']|["']$/g, '');
};

const getAnthropicKey = () => {
  const vKey = (import.meta.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "");
  const clean = cleanKey(vKey);
  // Anthropic keys start with sk-ant- and are long
  if (clean && clean.startsWith('sk-ant-') && clean.length > 30) return clean;
  return "";
};

export const generateAnthropicResponse = async (
  prompt: string,
  systemInstruction: string,
  onChunk?: (text: string) => void
) => {
  const apiKey = getAnthropicKey();
  if (!apiKey) return null;

  try {
    const anthropic = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    const stream = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      system: systemInstruction,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && 'text' in chunk.delta) {
        const text = chunk.delta.text;
        fullText += text;
        if (onChunk) onChunk(text);
      }
    }

    return fullText;
  } catch (error) {
    console.error("Anthropic Error:", error);
    return null;
  }
};
