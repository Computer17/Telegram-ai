import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TelegramAccount, TelegramChat, TelegramMessage } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface TelegramContextType {
  accounts: TelegramAccount[];
  activeAccount: TelegramAccount | null;
  setActiveAccountId: (id: string) => void;
  chats: TelegramChat[];
  activeChat: TelegramChat | null;
  setActiveChatId: (id: string | null) => void;
  messages: TelegramMessage[];
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  sendMessage: (text: string, replyToMessageId?: string, media?: TelegramMessage['media']) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshChats: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  toggleAutoReply: (accountId: string, enabled: boolean) => Promise<void>;
  resumeAiTakeover: (accountId: string) => Promise<void>;
  simulateIncomingMessage: (text: string, senderName?: string) => Promise<{ replyText?: string; status: string }>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState<TelegramAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string>('');
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>('chat-001');
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('all');

  // Load Accounts
  const refreshAccounts = useCallback(async () => {
    try {
      const data = await api.getAccounts(currentUser.id);
      setAccounts(data.accounts || []);
      if (data.accounts?.length > 0 && !activeAccountId) {
        setActiveAccountId(data.accounts[0].id);
      }
    } catch (e) {
      console.error('Failed to load telegram accounts', e);
    }
  }, [currentUser.id, activeAccountId]);

  // Load Chats
  const refreshChats = useCallback(async () => {
    setIsLoadingChats(true);
    try {
      const data = await api.getChats(activeAccountId || undefined);
      setChats(data.chats || []);
      if (data.chats?.length > 0 && !activeChatId) {
        setActiveChatId(data.chats[0].id);
      }
    } catch (e) {
      console.error('Failed to load chats', e);
    } finally {
      setIsLoadingChats(false);
    }
  }, [activeAccountId, activeChatId]);

  // Load Messages
  const refreshMessages = useCallback(async () => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    setIsLoadingMessages(true);
    try {
      const data = await api.getMessages(activeChatId, activeAccountId || undefined);
      setMessages(data.messages || []);
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [activeChatId, activeAccountId]);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    refreshChats();
  }, [refreshChats]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  // Periodic polling for real-time Telegram updates
  useEffect(() => {
    if (!activeAccountId) return;
    const interval = setInterval(() => {
      if (activeChatId) {
        api.getMessages(activeChatId, activeAccountId).then((data) => {
          if (data.messages) setMessages(data.messages);
        }).catch(() => {});
      }
      api.getChats(activeAccountId).then((data) => {
        if (data.chats) setChats(data.chats);
      }).catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [activeAccountId, activeChatId]);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0] || null;
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0] || null;

  // Send Message
  const sendMessage = async (text: string, replyToMessageId?: string, media?: TelegramMessage['media']) => {
    if (!activeChatId || !activeAccount) return;
    try {
      const res = await api.sendMessage({
        chatId: activeChatId,
        accountId: activeAccount.id,
        text,
        replyToMessageId,
        media,
      });
      setMessages((prev) => [...prev, res.message]);
      await refreshChats();
      await refreshAccounts(); // updates human takeover timestamps
    } catch (e) {
      console.error('Send message failed', e);
    }
  };

  // Toggle Reaction
  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await api.toggleReaction(messageId, emoji, activeAccountId, activeChatId || undefined);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? res.message : m))
      );
    } catch (e) {
      console.error('Toggle reaction failed', e);
    }
  };

  // Delete Message
  const deleteMessage = async (messageId: string) => {
    try {
      await api.deleteMessage(messageId, activeAccountId, activeChatId || undefined);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (e) {
      console.error('Delete message failed', e);
    }
  };

  // Toggle Auto-Reply on account
  const toggleAutoReply = async (accountId: string, enabled: boolean) => {
    try {
      const res = await api.updateAccount(accountId, { autoReplyEnabled: enabled });
      setAccounts((prev) => prev.map((a) => (a.id === accountId ? res.account : a)));
    } catch (e) {
      console.error('Toggle auto-reply failed', e);
    }
  };

  // Resume AI Takeover manually
  const resumeAiTakeover = async (accountId: string) => {
    try {
      const res = await api.updateAccount(accountId, { humanTakeoverPausedUntil: undefined });
      setAccounts((prev) => prev.map((a) => (a.id === accountId ? res.account : a)));
      if (activeChatId) {
        setChats((prev) =>
          prev.map((c) => (c.id === activeChatId ? { ...c, aiAutoReplyPaused: false } : c))
        );
      }
    } catch (e) {
      console.error('Resume takeover failed', e);
    }
  };

  // Live Simulated incoming event
  const simulateIncomingMessage = async (text: string, senderName?: string) => {
    if (!activeAccount || !activeChatId) return { status: 'No active chat or account' };
    const chat = chats.find((c) => c.id === activeChatId);
    const resolvedSender = senderName || chat?.title || 'Telegram User';

    try {
      const res = await api.simulateIncomingEvent({
        accountId: activeAccount.id,
        chatId: activeChatId,
        senderId: 'sim-sender-' + Math.random().toString(36).substring(2, 6),
        senderName: resolvedSender,
        messageText: text,
      });

      await refreshMessages();
      await refreshChats();
      await refreshAccounts();

      return {
        replyText: res.autoReplyResult?.replyText,
        status: res.autoReplyResult?.handled ? 'AI Auto-Replied' : res.autoReplyResult?.reason || 'Processed',
      };
    } catch (e: any) {
      console.error('Simulation failed', e);
      return { status: 'Simulation Error: ' + e.message };
    }
  };

  return (
    <TelegramContext.Provider
      value={{
        accounts,
        activeAccount,
        setActiveAccountId,
        chats,
        activeChat,
        setActiveChatId,
        messages,
        isLoadingChats,
        isLoadingMessages,
        sendMessage,
        toggleReaction,
        deleteMessage,
        refreshAccounts,
        refreshChats,
        refreshMessages,
        toggleAutoReply,
        resumeAiTakeover,
        simulateIncomingMessage,
        searchQuery,
        setSearchQuery,
        activeFolder,
        setActiveFolder,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) throw new Error('useTelegram must be used within a TelegramProvider');
  return context;
}
