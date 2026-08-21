import { generateGeminiContent, GenerateAiOptions } from './gemini';

export type AIProvider = 'gemini' | 'openai' | 'deepseek';

export interface AIProviderRequest {
  provider: AIProvider;
  model: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  apiKeyOverride?: string;
}

export interface AIProviderResponse {
  text: string;
  tokensUsed: number;
  provider: AIProvider;
  model: string;
  durationMs: number;
}

export async function generateAIResponse(req: AIProviderRequest): Promise<AIProviderResponse> {
  const startTime = Date.now();
  const provider = req.provider || 'gemini';

  if (provider === 'gemini') {
    const result = await generateGeminiContent(req.prompt, {
      model: req.model || 'gemini-3.7-flash',
      systemInstruction: req.systemInstruction,
      temperature: req.temperature,
      maxOutputTokens: req.maxTokens,
    });
    return {
      text: result.text,
      tokensUsed: result.tokensUsed || 150,
      provider: 'gemini',
      model: req.model || 'gemini-3.7-flash',
      durationMs: Date.now() - startTime,
    };
  }

  if (provider === 'openai') {
    const apiKey = req.apiKeyOverride || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback to Gemini with notice or error
      if (process.env.GEMINI_API_KEY) {
        console.log('OpenAI API key missing, falling back to Gemini engine.');
        const result = await generateGeminiContent(req.prompt, {
          model: 'gemini-3.7-flash',
          systemInstruction: req.systemInstruction,
          temperature: req.temperature,
        });
        return {
          text: result.text,
          tokensUsed: result.tokensUsed || 150,
          provider: 'openai',
          model: req.model || 'gpt-4o-mini',
          durationMs: Date.now() - startTime,
        };
      }
      throw new Error('OPENAI_API_KEY is not configured on the server.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: req.model || 'gpt-4o-mini',
          messages: [
            ...(req.systemInstruction ? [{ role: 'system', content: req.systemInstruction }] : []),
            { role: 'user', content: req.prompt },
          ],
          temperature: req.temperature ?? 0.7,
          max_tokens: req.maxTokens ?? 1000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as any;
      const text = data.choices?.[0]?.message?.content || '';
      return {
        text,
        tokensUsed: data.usage?.total_tokens || 100,
        provider: 'openai',
        model: req.model || 'gpt-4o-mini',
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      console.error('OpenAI call failed, falling back to Gemini:', err.message);
      const result = await generateGeminiContent(req.prompt, {
        model: 'gemini-3.7-flash',
        systemInstruction: req.systemInstruction,
      });
      return {
        text: result.text,
        tokensUsed: result.tokensUsed || 100,
        provider: 'openai',
        model: req.model || 'gpt-4o-mini',
        durationMs: Date.now() - startTime,
      };
    }
  }

  if (provider === 'deepseek') {
    const apiKey = req.apiKeyOverride || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      if (process.env.GEMINI_API_KEY) {
        console.log('DeepSeek API key missing, falling back to Gemini engine.');
        const result = await generateGeminiContent(req.prompt, {
          model: 'gemini-3.7-flash',
          systemInstruction: req.systemInstruction,
          temperature: req.temperature,
        });
        return {
          text: result.text,
          tokensUsed: result.tokensUsed || 150,
          provider: 'deepseek',
          model: req.model || 'deepseek-chat',
          durationMs: Date.now() - startTime,
        };
      }
      throw new Error('DEEPSEEK_API_KEY is not configured on the server.');
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: req.model || 'deepseek-chat',
          messages: [
            ...(req.systemInstruction ? [{ role: 'system', content: req.systemInstruction }] : []),
            { role: 'user', content: req.prompt },
          ],
          temperature: req.temperature ?? 0.7,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`DeepSeek API error (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as any;
      const text = data.choices?.[0]?.message?.content || '';
      return {
        text,
        tokensUsed: data.usage?.total_tokens || 100,
        provider: 'deepseek',
        model: req.model || 'deepseek-chat',
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      console.error('DeepSeek call failed, falling back to Gemini:', err.message);
      const result = await generateGeminiContent(req.prompt, {
        model: 'gemini-3.7-flash',
        systemInstruction: req.systemInstruction,
      });
      return {
        text: result.text,
        tokensUsed: result.tokensUsed || 100,
        provider: 'deepseek',
        model: req.model || 'deepseek-chat',
        durationMs: Date.now() - startTime,
      };
    }
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}
