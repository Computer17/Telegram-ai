import React, { useState } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Sparkles,
  Wand2,
  CheckCheck,
  Languages,
  ArrowRight,
  X,
  Bot,
  Minimize2,
  Maximize2,
  Briefcase,
  Coffee,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useTelegram } from '../../context/TelegramContext';
import { TelegramMessage } from '../../types';

interface MessageInputProps {
  replyingTo: TelegramMessage | null;
  onCancelReply: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  replyingTo,
  onCancelReply,
}) => {
  const { sendMessage, activeChat } = useTelegram();
  const [text, setText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiToolbar, setShowAiToolbar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('Bangla');

  const emojis = ['👍', '❤️', '🔥', '👏', '🎉', '😂', '🚀', '✨', '🙏', '💯', '🤔', '😊'];

  const handleSend = async () => {
    if (!text.trim()) return;
    const msgText = text;
    setText('');
    onCancelReply();
    await sendMessage(msgText, replyingTo?.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const applyAiQuickAction = async (action: any) => {
    if (!text.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await api.quickAssist({
        action,
        text,
        targetLanguage,
      });
      if (res.result) {
        setText(res.result);
      }
    } catch (e) {
      console.error('AI quick assist failed', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors relative">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="mb-2 p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border-l-4 border-sky-500 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
              Replying to {replyingTo.senderName}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
              {replyingTo.text}
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Quick Assistant Floating Toolbar */}
      {showAiToolbar && (
        <div className="mb-2 p-2 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 dark:from-sky-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-sky-200 dark:border-sky-800/60 flex flex-wrap items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1 mr-1">
            <Wand2 className="w-3.5 h-3.5" /> AI Assist:
          </span>

          <button
            disabled={isAiLoading || !text.trim()}
            onClick={() => applyAiQuickAction('rewrite')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            ✨ Rewrite
          </button>

          <button
            disabled={isAiLoading || !text.trim()}
            onClick={() => applyAiQuickAction('grammar')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            Fix Grammar
          </button>

          <button
            disabled={isAiLoading || !text.trim()}
            onClick={() => applyAiQuickAction('professional')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Briefcase className="w-3 h-3" /> Professional
          </button>

          <button
            disabled={isAiLoading || !text.trim()}
            onClick={() => applyAiQuickAction('casual')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <Coffee className="w-3 h-3" /> Casual
          </button>

          <button
            disabled={isAiLoading || !text.trim()}
            onClick={() => applyAiQuickAction('shorten')}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors"
          >
            Shorten
          </button>

          {/* Translation Dropdown */}
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 rounded-lg px-2 py-0.5 border border-neutral-200 dark:border-neutral-700">
            <Languages className="w-3 h-3 text-neutral-400" />
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="text-xs bg-transparent text-neutral-700 dark:text-neutral-300 focus:outline-none"
            >
              <option value="Bangla">Bangla (বাংলা)</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Arabic">Arabic</option>
              <option value="French">French</option>
            </select>
            <button
              disabled={isAiLoading || !text.trim()}
              onClick={() => applyAiQuickAction('translate')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline ml-1"
            >
              Translate
            </button>
          </div>

          {isAiLoading && (
            <span className="text-xs text-sky-600 dark:text-sky-400 animate-pulse font-medium ml-auto flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" /> Processing with Gemini...
            </span>
          )}
        </div>
      )}

      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        {/* AI Toolbar Toggle Button */}
        <button
          id="btn-toggle-ai-toolbar"
          onClick={() => setShowAiToolbar(!showAiToolbar)}
          title="Toggle Gemini AI Writing Assistant"
          className={`p-2.5 rounded-xl transition-all ${
            showAiToolbar
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
              : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Emoji Button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 flex gap-1 z-50">
              {emojis.map((em) => (
                <button
                  key={em}
                  onClick={() => insertEmoji(em)}
                  className="w-8 h-8 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-lg flex items-center justify-center transition-transform hover:scale-110"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Field */}
        <div className="flex-1 relative">
          <textarea
            id="message-textarea"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeChat?.capabilities.canSendMessages
                ? 'Write a message... (Press Enter to send)'
                : 'Posting not allowed in this channel'
            }
            disabled={!activeChat?.capabilities.canSendMessages}
            className="w-full max-h-32 bg-neutral-100 dark:bg-neutral-800/80 text-sm text-neutral-900 dark:text-white px-3.5 py-2.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-neutral-700/50 resize-none transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Voice Note Simulation */}
        <button
          onClick={() => {
            sendMessage('🎤 [Voice Note recorded]', undefined, {
              type: 'voice',
              url: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
              durationSeconds: 12,
            });
          }}
          title="Send simulated voice message"
          className="p-2.5 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Send Button */}
        <button
          id="btn-send-message"
          onClick={handleSend}
          disabled={!text.trim() || !activeChat?.capabilities.canSendMessages}
          className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:hover:bg-sky-500 text-white transition-all shadow-sm shadow-sky-500/20 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
