import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Bot,
  Sparkles,
  Trash2,
  Reply,
  Smile,
  Clock,
  Zap,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { TelegramMessage } from '../../types';
import { MessageInput } from './MessageInput';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { ChatInfoPanel } from './ChatInfoPanel';

export const ChatWindow: React.FC = () => {
  const {
    activeChat,
    messages,
    toggleReaction,
    deleteMessage,
    activeAccount,
    resumeAiTakeover,
  } = useTelegram();

  const [replyingTo, setReplyingTo] = useState<TelegramMessage | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-950/60 flex items-center justify-center text-sky-500 mb-3">
          <Bot className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-base text-neutral-800 dark:text-neutral-200">Select a Conversation</h3>
        <p className="text-xs text-neutral-500 max-w-sm mt-1">
          Pick a chat from the sidebar or simulate an incoming Telegram message to test real-time AI auto-reply.
        </p>
      </div>
    );
  }

  const quickReactions = ['👍', '❤️', '🔥', '😂', '🎉', '🚀'];

  const isTakeoverActive =
    activeAccount?.humanTakeoverPausedUntil &&
    new Date(activeAccount.humanTakeoverPausedUntil).getTime() > Date.now();

  const formatMsgTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="telegram-chat-window" className="flex-1 flex h-full min-w-0 bg-[#efeae2]/40 dark:bg-neutral-950 transition-colors relative">
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Chat Header */}
        <div className="h-16 px-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between z-10 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <img
                src={activeChat.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={activeChat.title}
                className="w-10 h-10 rounded-full object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              {activeChat.onlineStatus === 'online' && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-sm text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                {activeChat.title}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1.5">
                {activeChat.onlineStatus === 'online' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">online</span>
                ) : activeChat.memberCount ? (
                  `${activeChat.memberCount.toLocaleString()} members`
                ) : (
                  'last seen recently'
                )}
              </p>
            </div>
          </div>

          {/* Action Icons & Takeover Status */}
          <div className="flex items-center gap-2">
            {isTakeoverActive && (
              <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-800">
                <Clock className="w-3 h-3" />
                <span>Takeover Mode</span>
                <button
                  onClick={() => activeAccount && resumeAiTakeover(activeAccount.id)}
                  className="text-[10px] font-bold uppercase underline ml-1 text-sky-600 dark:text-sky-400"
                >
                  Resume
                </button>
              </div>
            )}

            <button
              onClick={() => setShowInfoPanel(!showInfoPanel)}
              className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Chat Details"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div
          id="message-stream"
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-dot-grid dark:bg-dot-grid-dark"
        >
          {/* Top Encrypted Notice */}
          <div className="text-center my-2">
            <span className="inline-block px-3 py-1 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm text-[11px] text-neutral-700 dark:text-neutral-300 font-medium">
              🔒 End-to-end encrypted Telegram session • Gemini AI enabled
            </span>
          </div>

          {messages.map((msg) => {
            const isOutgoing = msg.isOutgoing;
            return (
              <div
                key={msg.id}
                id={`message-bubble-${msg.id}`}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => {
                  setHoveredMessageId(null);
                  if (reactionPickerMsgId === msg.id) setReactionPickerMsgId(null);
                }}
                className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} group relative`}
              >
                {/* Floating Quick Action Buttons on Hover */}
                {hoveredMessageId === msg.id && (
                  <div
                    className={`absolute -top-7 ${
                      isOutgoing ? 'right-0' : 'left-0'
                    } flex items-center gap-0.5 bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 rounded-lg p-0.5 z-20 animate-in fade-in duration-100`}
                  >
                    <button
                      onClick={() => setReactionPickerMsgId(reactionPickerMsgId === msg.id ? null : msg.id)}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500"
                      title="React"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded text-neutral-500"
                      title="Reply"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/50 rounded text-red-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Reaction Picker Popover */}
                {reactionPickerMsgId === msg.id && (
                  <div
                    className={`absolute -top-12 ${
                      isOutgoing ? 'right-0' : 'left-0'
                    } flex items-center gap-1 bg-white dark:bg-neutral-800 shadow-xl border border-neutral-200 dark:border-neutral-700 rounded-full px-2 py-1 z-30 animate-in zoom-in-95 duration-100`}
                  >
                    {quickReactions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          toggleReaction(msg.id, emoji);
                          setReactionPickerMsgId(null);
                        }}
                        className="text-base hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sender Name in group chats for incoming */}
                {!isOutgoing && activeChat.type !== 'private' && (
                  <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 ml-3 mb-0.5">
                    {msg.senderName}
                  </span>
                )}

                {/* Speech Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-md lg:max-w-lg px-3.5 py-2 rounded-2xl shadow-sm relative ${
                    isOutgoing
                      ? 'bg-sky-500 text-white rounded-br-xs'
                      : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-xs border border-black/5 dark:border-white/5'
                  }`}
                >
                  {/* AI Agent Badge indicator */}
                  {msg.aiGenerated && (
                    <div className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-white/20 dark:bg-sky-950/60 text-white dark:text-sky-300 px-2 py-0.5 rounded-md w-fit">
                      <Sparkles className="w-3 h-3" />
                      <span>{msg.aiAgentName || 'AI Auto-Reply'}</span>
                    </div>
                  )}

                  {/* Audio / Voice message */}
                  {msg.media?.type === 'voice' ? (
                    <VoiceMessagePlayer
                      durationSeconds={msg.media.durationSeconds || 15}
                      isOutgoing={isOutgoing}
                    />
                  ) : msg.media?.type === 'photo' ? (
                    <div className="space-y-1">
                      <img
                        src={msg.media.url}
                        alt="Photo attachment"
                        className="rounded-xl max-h-60 w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {msg.text && <p className="text-xs">{msg.text}</p>}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap select-text break-words">
                      {msg.text}
                    </p>
                  )}

                  {/* Timestamp & Status footer */}
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                      isOutgoing ? 'text-sky-100' : 'text-neutral-400 dark:text-neutral-500'
                    }`}
                  >
                    <span>{formatMsgTime(msg.timestamp)}</span>
                    {isOutgoing && (
                      <span title={msg.status}>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-white" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 opacity-70" />
                        ) : (
                          <Check className="w-3.5 h-3.5 opacity-70" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reaction Badges Container */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 px-1">
                    {msg.reactions.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => toggleReaction(msg.id, r.emoji)}
                        className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                          r.hasReacted
                            ? 'bg-sky-100 dark:bg-sky-950/80 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 font-bold'
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <span>{r.emoji}</span>
                        <span className="text-[10px] font-mono">{r.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box with AI Assistant Toolbar */}
        <MessageInput
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>

      {/* Chat Info Slide-over Drawer */}
      {showInfoPanel && (
        <ChatInfoPanel chat={activeChat} onClose={() => setShowInfoPanel(false)} />
      )}
    </div>
  );
};
