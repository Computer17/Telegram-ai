import React from 'react';
import {
  Search,
  Pin,
  Check,
  CheckCheck,
  Mic,
  Image,
  Users,
  Radio,
  Bot,
  MessageCircle,
} from 'lucide-react';
import { useTelegram } from '../../context/TelegramContext';
import { TelegramChat } from '../../types';

export const ChatList: React.FC = () => {
  const {
    chats,
    activeChat,
    setActiveChatId,
    searchQuery,
    setSearchQuery,
    activeFolder,
    setActiveFolder,
  } = useTelegram();

  const folders = [
    { id: 'all', label: 'All' },
    { id: 'personal', label: 'Personal' },
    { id: 'groups', label: 'Groups' },
    { id: 'channels', label: 'Channels' },
  ];

  // Filter chats by folder and search query
  const filteredChats = chats.filter((chat) => {
    if (activeFolder === 'personal' && chat.type !== 'private') return false;
    if (activeFolder === 'groups' && chat.type !== 'group' && chat.type !== 'supergroup') return false;
    if (activeFolder === 'channels' && chat.type !== 'channel') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        chat.title.toLowerCase().includes(q) ||
        (chat.username && chat.username.toLowerCase().includes(q)) ||
        (chat.lastMessage && chat.lastMessage.text.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sort pinned chats to top
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const formatChatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      id="telegram-chat-list"
      className="w-full md:w-80 lg:w-96 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full shrink-0 transition-colors"
    >
      {/* Search Header */}
      <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-chat-search"
            type="text"
            placeholder="Search chats, messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-900 dark:text-white pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 border border-transparent dark:border-neutral-700/50 transition-all placeholder:text-neutral-400"
          />
        </div>

        {/* Chat Folder Tabs */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-0.5 no-scrollbar">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFolder === folder.id
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {folder.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100/60 dark:divide-neutral-800/40">
        {sortedChats.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 dark:text-neutral-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No conversations found</p>
          </div>
        ) : (
          sortedChats.map((chat) => {
            const isSelected = chat.id === activeChat?.id;
            return (
              <div
                key={chat.id}
                id={`chat-item-${chat.id}`}
                onClick={() => setActiveChatId(chat.id)}
                className={`p-3 flex items-start gap-3 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/50'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                {/* Avatar with Status Indicator */}
                <div className="relative shrink-0">
                  <img
                    src={chat.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={chat.title}
                    className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                    referrerPolicy="no-referrer"
                  />
                  {chat.onlineStatus === 'online' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
                  )}
                  {chat.type === 'supergroup' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] shadow-sm">
                      <Users className="w-2.5 h-2.5" />
                    </span>
                  )}
                  {chat.type === 'channel' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-sm">
                      <Radio className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Info & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h3 className="font-semibold text-xs text-neutral-900 dark:text-white truncate flex items-center gap-1">
                      {chat.title}
                      {chat.type === 'channel' && (
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1 rounded">
                          Channel
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                      {formatChatTime(chat.lastMessage?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1">
                      {chat.lastMessage?.isOutgoing && (
                        <CheckCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      )}
                      {chat.lastMessage?.mediaType === 'voice' && (
                        <span className="text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                          <Mic className="w-3 h-3" /> Voice message
                        </span>
                      )}
                      {chat.lastMessage?.mediaType === 'photo' && (
                        <span className="text-sky-600 dark:text-sky-400 flex items-center gap-0.5">
                          <Image className="w-3 h-3" /> Photo
                        </span>
                      )}
                      {!chat.lastMessage?.mediaType && (
                        <span className="truncate">{chat.lastMessage?.text || 'No messages yet'}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.isPinned && (
                        <Pin className="w-3 h-3 text-neutral-400 fill-current rotate-45" />
                      )}
                      {chat.unreadCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
