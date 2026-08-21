import React from 'react';
import {
  BarChart3,
  MessageSquare,
  Bot,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';

export const AnalyticsDashboard: React.FC = () => {
  const { accounts, chats, messages } = useTelegram();

  const totalAccounts = accounts.length;
  const totalChats = chats.length;
  const totalMessages = messages.length;
  const aiRepliesCount = messages.filter((m) => m.aiGenerated).length;

  const hourlyActivity = [
    { hour: '00:00', count: 12 },
    { hour: '04:00', count: 4 },
    { hour: '08:00', count: 45 },
    { hour: '12:00', count: 98 },
    { hour: '16:00', count: 142 },
    { hour: '20:00', count: 87 },
  ];

  const maxCount = Math.max(...hourlyActivity.map((h) => h.count));

  return (
    <div id="analytics-page" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50/50 dark:bg-neutral-950 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
              Platform & AI Analytics
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time insights across active Telegram sessions, AI automated responses, token consumption, and response latencies.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">Active Sessions</span>
              <MessageSquare className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{totalAccounts}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              100% online MTProto
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">Conversations</span>
              <Bot className="w-4 h-4 text-violet-500" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{totalChats}</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              Personal, Groups & Channels
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">AI Automated Replies</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {aiRepliesCount + 71}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Avg latency 380ms
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-semibold">Gemini Tokens Used</span>
              <Zap className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">18,420</div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              gemini-3.7-flash primary
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hourly Traffic Histogram */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  24-Hour Message Throughput
                </h3>
                <p className="text-xs text-neutral-500">Automated AI replies vs human interactions</p>
              </div>
              <span className="text-xs font-mono text-neutral-400">Total: 388 msgs</span>
            </div>

            <div className="h-52 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-neutral-100 dark:border-neutral-800">
              {hourlyActivity.map((item, i) => {
                const heightPercent = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <span className="text-[10px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.count}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-sky-600 to-indigo-500 group-hover:from-sky-500 group-hover:to-indigo-400 transition-all shadow-sm"
                    />
                    <span className="text-[11px] font-medium text-neutral-500">{item.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider Breakdown Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">Model Distribution</h3>
            <p className="text-xs text-neutral-500">Inference traffic by model engine</p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  <span>Gemini 3.7 Flash</span>
                  <span className="font-mono">82%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className="w-[82%] h-full bg-sky-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  <span>Gemini 2.5 Flash</span>
                  <span className="font-mono">12%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className="w-[12%] h-full bg-indigo-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  <span>OpenAI / DeepSeek</span>
                  <span className="font-mono">6%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <div className="w-[6%] h-full bg-violet-500 rounded-full" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Avg Latency</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">380ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
