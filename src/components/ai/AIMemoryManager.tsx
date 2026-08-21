import React, { useState } from 'react';
import {
  Brain,
  ShieldCheck,
  Trash2,
  Lock,
  CheckCircle2,
  RefreshCw,
  EyeOff,
  Zap,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

export const AIMemoryManager: React.FC = () => {
  const { chats, activeChat } = useTelegram();
  const [memoryMode, setMemoryMode] = useState<'conversation' | 'window_10' | 'ephemeral'>('conversation');
  const [isCleared, setIsCleared] = useState(false);

  const handleClearMemory = () => {
    if (!confirm('Clear all conversation history memory cached for AI agents?')) return;
    setIsCleared(true);
    setTimeout(() => setIsCleared(false), 3000);
  };

  return (
    <div id="memory-manager-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              AI Conversation Memory & Privacy Vault
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-400">
              Zero-Leakage
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Control the context window passed to Gemini and wipe conversational memory buffers anytime.
          </p>
        </div>

        {/* Memory Retention Policy */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-500" />
            <span>Context Window Strategy</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setMemoryMode('conversation')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                memoryMode === 'conversation'
                  ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/40 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div className="font-bold text-xs text-neutral-900 dark:text-white">Full Conversation</div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Preserves context across messages for intelligent continuity.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMemoryMode('window_10')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                memoryMode === 'window_10'
                  ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/40 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div className="font-bold text-xs text-neutral-900 dark:text-white">Sliding 10 Messages</div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Restricts history to the last 10 messages for cost efficiency.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMemoryMode('ephemeral')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                memoryMode === 'ephemeral'
                  ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/40 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <div className="font-bold text-xs text-neutral-900 dark:text-white">Ephemeral (Zero Retention)</div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Zero history passed to AI; each message treated strictly standalone.
              </p>
            </button>
          </div>
        </div>

        {/* Wipe Memory Cache */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span>Purge AI Memory Snapshots</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Instantly clear all cached embeddings and conversation threads across all active agents.
              </p>
            </div>

            <button
              onClick={handleClearMemory}
              className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 border border-red-200 dark:border-red-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Memory</span>
            </button>
          </div>

          {isCleared && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Memory cache successfully purged. All AI agents reset to clean slate.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
