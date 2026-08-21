import React from 'react';
import {
  X,
  Bot,
  Users,
  Bell,
  Lock,
  Radio,
  Clock,
  ShieldCheck,
  Zap,
  Power,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { TelegramChat } from '../../types';
import { useTelegram } from '../../context/TelegramContext';

interface ChatInfoPanelProps {
  chat: TelegramChat;
  onClose: () => void;
}

export const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({ chat, onClose }) => {
  const { activeAccount, resumeAiTakeover } = useTelegram();

  return (
    <div
      id="chat-info-drawer"
      className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full shrink-0 animate-in slide-in-from-right duration-200 transition-colors"
    >
      {/* Header */}
      <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Chat Info</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Avatar & Title */}
        <div className="text-center space-y-2">
          <img
            src={chat.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={chat.title}
            className="w-20 h-20 rounded-full mx-auto object-cover ring-2 ring-sky-500/20 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="font-bold text-base text-neutral-900 dark:text-white">{chat.title}</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {chat.username ? `@${chat.username}` : chat.type}
            </p>
          </div>
        </div>

        {/* AI & Automation Status Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/70 dark:border-neutral-700/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-sky-500" /> AI Auto-Reply
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeAccount?.autoReplyEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                  : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {activeAccount?.autoReplyEnabled ? 'ENABLED' : 'PAUSED'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            {activeAccount?.assignedAgentId ? 'Assigned Agent: Personal Assistant' : 'Using default system agent.'}
          </p>

          {activeAccount?.humanTakeoverPausedUntil &&
            new Date(activeAccount.humanTakeoverPausedUntil).getTime() > Date.now() && (
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Takeover Paused
                  </span>
                  <button
                    onClick={() => activeAccount && resumeAiTakeover(activeAccount.id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    Resume AI
                  </button>
                </div>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                  AI auto-replies paused until:{' '}
                  {new Date(activeAccount.humanTakeoverPausedUntil).toLocaleTimeString()}
                </p>
              </div>
            )}
        </div>

        {/* Chat Metadata & Details */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Details</div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Chat Type</span>
              <span className="font-semibold text-neutral-900 dark:text-white capitalize">{chat.type}</span>
            </div>
            {chat.memberCount && (
              <div className="py-2 flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">Members</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {chat.memberCount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="py-2 flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Encryption</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> MTProto 2.0
              </span>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Can Send Messages</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {chat.capabilities.canSendMessages ? 'Yes' : 'No (Channel view only)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
