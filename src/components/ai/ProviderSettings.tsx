import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Server,
  Key,
  ExternalLink,
  Activity,
  Send,
  Loader2,
} from 'lucide-react';
import { api } from '../../lib/api';

export const ProviderSettings: React.FC = () => {
  const [testPrompt, setTestPrompt] = useState('Explain AI Telegram Platform in 2 sentences.');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai' | 'deepseek'>('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestProvider = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.generateAI({
        provider: selectedProvider,
        model: selectedModel,
        prompt: testPrompt,
        systemInstruction: 'You are a technical AI assistant testing API response latency.',
      });
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ error: e.message || 'API request failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div id="providers-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              AI Providers & Model Engines
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400">
              Server-Side Proxy
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Configure Google Gemini SDK (`@google/genai`), OpenAI, and DeepSeek backends. All API keys remain securely guarded on the server.
          </p>
        </div>

        {/* Security Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/40 dark:via-blue-950/40 dark:to-indigo-950/40 border border-sky-200 dark:border-sky-800/60 flex items-start gap-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-sky-900 dark:text-sky-200">
              Zero Client-Side Secret Exposure
            </h3>
            <p className="text-xs text-sky-800/80 dark:text-sky-300/80 leading-relaxed">
              In accordance with AI Studio architecture mandates, your <code className="font-mono bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded">process.env.GEMINI_API_KEY</code> is executed purely on the Express server backend. No keys are ever transmitted into the browser runtime or DevTools logs.
            </p>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gemini */}
          <div className="bg-white dark:bg-neutral-900 border-2 border-sky-500 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Google Gemini</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Official Google Gen AI TypeScript SDK client with native Gemini 3.7 & 2.5 Flash models.
            </p>
            <div className="text-[11px] font-mono bg-neutral-50 dark:bg-neutral-800 p-2 rounded-xl text-neutral-700 dark:text-neutral-300 space-y-1">
              <div>• gemini-3.7-flash (Default)</div>
              <div>• gemini-2.5-flash</div>
            </div>
          </div>

          {/* OpenAI */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>OpenAI</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                READY
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              GPT-4o and GPT-4o-mini models with auto-fallback to Gemini when quota exhausted.
            </p>
            <div className="text-[11px] font-mono bg-neutral-50 dark:bg-neutral-800 p-2 rounded-xl text-neutral-700 dark:text-neutral-300 space-y-1">
              <div>• gpt-4o</div>
              <div>• gpt-4o-mini</div>
            </div>
          </div>

          {/* DeepSeek */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
                <Server className="w-4 h-4 text-violet-500" />
                <span>DeepSeek</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                READY
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              DeepSeek-V3 high throughput reasoning engine with fallback resiliency.
            </p>
            <div className="text-[11px] font-mono bg-neutral-50 dark:bg-neutral-800 p-2 rounded-xl text-neutral-700 dark:text-neutral-300 space-y-1">
              <div>• deepseek-v3</div>
              <div>• deepseek-r1</div>
            </div>
          </div>
        </div>

        {/* Test Provider Console */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
            <Activity className="w-4 h-4 text-sky-500" />
            <span>Real-time Model Diagnostic & Benchmark</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Select Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  const p = e.target.value as any;
                  setSelectedProvider(p);
                  if (p === 'gemini') setSelectedModel('gemini-3.7-flash');
                  else if (p === 'openai') setSelectedModel('gpt-4o');
                  else setSelectedModel('deepseek-v3');
                }}
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3 py-2 rounded-xl border border-transparent dark:border-neutral-700"
              >
                <option value="gemini">Google Gemini (Default)</option>
                <option value="openai">OpenAI</option>
                <option value="deepseek">DeepSeek</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3 py-2 rounded-xl border border-transparent dark:border-neutral-700"
              >
                {selectedProvider === 'gemini' && (
                  <>
                    <option value="gemini-3.7-flash">gemini-3.7-flash (Recommended)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  </>
                )}
                {selectedProvider === 'openai' && (
                  <>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                  </>
                )}
                {selectedProvider === 'deepseek' && (
                  <>
                    <option value="deepseek-v3">deepseek-v3</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Benchmark Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
              <button
                disabled={isTesting}
                onClick={handleTestProvider}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all"
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send Benchmark</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 space-y-2">
              {testResult.error ? (
                <div className="text-xs text-red-500 font-semibold">{testResult.error}</div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="font-semibold text-neutral-900 dark:text-white uppercase">
                      {testResult.provider} ({testResult.model})
                    </span>
                    <div className="flex gap-3 font-mono text-[11px]">
                      <span>Latency: {testResult.durationMs}ms</span>
                      <span>Tokens: {testResult.tokensUsed}</span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {testResult.text}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
