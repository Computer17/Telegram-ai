import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

interface LiveEventSimulatorProps {
  onClose?: () => void;
}

export const LiveEventSimulator: React.FC<LiveEventSimulatorProps> = ({ onClose }) => {
  const {
    chats,
    activeChat,
    setActiveChatId,
    activeAccount,
    simulateIncomingMessage,
    resumeAiTakeover,
  } = useTelegram();

  const [messageText, setMessageText] = useState('Can you please provide the pricing and feature roadmap for the platform?');
  const [senderName, setSenderName] = useState('Sarah Jenkins');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<{
    status: string;
    replyText?: string;
    timestamp: string;
  } | null>(null);

  const presets = [
    {
      label: 'Pricing Keyword (English)',
      text: 'What is the pricing and roadmap for team automation?',
    },
    {
      label: 'Bangla Query (বাংলা প্রশ্ন)',
      text: 'সালাম ভাই! এআই অটো রিপ্লাই সিস্টেমটা কিভাবে চালু করতে হবে একটু বলবেন?',
    },
    {
      label: 'Meeting Reschedule',
      text: 'Can we move our meeting to 4:30 PM today?',
    },
    {
      label: 'Customer Support Inquiry',
      text: 'I am getting an error with my bot token connection. How do I fix it?',
    },
  ];

  const handleSimulate = async () => {
    if (!messageText.trim()) return;
    setIsSimulating(true);
    setSimulationLog(null);

    const res = await simulateIncomingMessage(messageText, senderName);

    setSimulationLog({
      status: res.status,
      replyText: res.replyText,
      timestamp: new Date().toLocaleTimeString(),
    });
    setIsSimulating(false);
  };

  const isTakeoverActive =
    activeAccount?.humanTakeoverPausedUntil &&
    new Date(activeAccount.humanTakeoverPausedUntil).getTime() > Date.now();

  return (
    <div id="simulator-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Live Telegram Event Simulator
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-400">
              Interactive Testbed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Simulate incoming MTProto message updates to verify keyword triggers, Bangla/English understanding, and Human Takeover guardrails.
          </p>
        </div>

        {/* Current Context Status Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Active Account:</span>
              <span className="font-bold text-neutral-900 dark:text-white">
                {activeAccount?.firstName} {activeAccount?.lastName} ({activeAccount?.username || activeAccount?.phoneNumberMasked})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500">AI Auto-Reply:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full ${
                  activeAccount?.autoReplyEnabled
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {activeAccount?.autoReplyEnabled ? 'ENABLED' : 'PAUSED'}
              </span>
            </div>
          </div>

          {/* Takeover warning & resume button */}
          {isTakeoverActive && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Human Takeover active (Auto-reply temporarily paused until{' '}
                  {new Date(activeAccount.humanTakeoverPausedUntil!).toLocaleTimeString()})
                </span>
              </div>
              <button
                onClick={() => resumeAiTakeover(activeAccount.id)}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline shrink-0 ml-2"
              >
                Resume AI
              </button>
            </div>
          )}
        </div>

        {/* Simulation Controls Form */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Target Chat Thread
              </label>
              <select
                value={activeChat?.id || ''}
                onChange={(e) => setActiveChatId(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 font-medium"
              >
                {chats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Simulated Sender Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800 text-xs px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Quick Test Prompts
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessageText(p.text)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-neutral-700 dark:text-neutral-300 hover:text-violet-600 dark:hover:text-violet-400 border border-neutral-200/80 dark:border-neutral-700 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Incoming Message Textarea */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Incoming Telegram Message
            </label>
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white px-3.5 py-2.5 rounded-xl border border-transparent dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="btn-trigger-simulation"
              type="button"
              disabled={isSimulating || !messageText.trim()}
              onClick={handleSimulate}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Incoming Telegram Event with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Simulate Incoming Telegram Message & Trigger Auto-Reply</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Simulation Response Box */}
        {simulationLog && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  Simulation Result: {simulationLog.status}
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-400">{simulationLog.timestamp}</span>
            </div>

            {simulationLog.replyText ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" /> AI Generated Reply Dispatched:
                </div>
                <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-sm text-sky-950 dark:text-sky-100 leading-relaxed font-sans whitespace-pre-wrap">
                  {simulationLog.replyText}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                Auto-reply was skipped according to configured policy ({simulationLog.status}).
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
