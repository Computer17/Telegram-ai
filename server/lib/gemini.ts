import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export interface GenerateAiOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export async function generateGeminiContent(
  prompt: string,
  options: GenerateAiOptions = {}
): Promise<{ text: string; tokensUsed?: number }> {
  try {
    const ai = getGeminiClient();
    const model = options.model || 'gemini-3.7-flash';

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.7,
      },
    });

    const outputText = response.text || '';
    return {
      text: outputText,
      tokensUsed: outputText.length > 0 ? Math.ceil((prompt.length + outputText.length) / 4) : 0,
    };
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}
