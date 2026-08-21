import {
  AiAgent,
  AutomationLog,
  AutomationRule,
  FeatureFlags,
  PromptTemplate,
  SystemSetting,
  TelegramAccount,
  TelegramChat,
  TelegramMessage,
  UserProfile,
} from '../types';

export const api = {
  // Accounts
  getAccounts: async (userId?: string): Promise<{ accounts: TelegramAccount[] }> => {
    const res = await fetch(`/api/telegram/accounts?userId=${userId || 'demo-user-1'}`);
    return res.json();
  },

  sendAuthCode: async (params: {
    phoneNumber: string;
    apiId?: string;
    apiHash?: string;
    connectionType: 'user_mtproto' | 'bot_token' | 'tdlib';
  }): Promise<{ sessionId: string; status: string; message: string }> => {
    const res = await fetch('/api/telegram/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  verifyAuthCode: async (params: {
    sessionId: string;
    code: string;
    userId?: string;
    password2FA?: string;
    botToken?: string;
    apiId?: string;
    apiHash?: string;
  }): Promise<{ success: boolean; needs2FA?: boolean; account?: TelegramAccount; error?: string }> => {
    const res = await fetch('/api/telegram/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  updateAccount: async (id: string, updates: Partial<TelegramAccount>): Promise<{ account: TelegramAccount }> => {
    const res = await fetch(`/api/telegram/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteAccount: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/telegram/accounts/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Chats
  getChats: async (accountId?: string): Promise<{ chats: TelegramChat[] }> => {
    const url = accountId ? `/api/telegram/chats?accountId=${accountId}` : '/api/telegram/chats';
    const res = await fetch(url);
    return res.json();
  },

  getMessages: async (chatId: string, accountId?: string): Promise<{ messages: TelegramMessage[] }> => {
    const url = accountId ? `/api/telegram/chats/${chatId}/messages?accountId=${accountId}` : `/api/telegram/chats/${chatId}/messages`;
    const res = await fetch(url);
    return res.json();
  },

  sendMessage: async (params: {
    chatId: string;
    accountId: string;
    text: string;
    replyToMessageId?: string;
    media?: TelegramMessage['media'];
  }): Promise<{ message: TelegramMessage }> => {
    const res = await fetch('/api/telegram/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  toggleReaction: async (messageId: string, emoji: string, accountId?: string, chatId?: string): Promise<{ message: TelegramMessage }> => {
    const res = await fetch(`/api/telegram/messages/${messageId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, accountId, chatId }),
    });
    return res.json();
  },

  deleteMessage: async (messageId: string, accountId?: string, chatId?: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/telegram/messages/${messageId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, chatId }),
    });
    return res.json();
  },

  // AI Toolbar & Assistant
  quickAssist: async (params: {
    action: 'rewrite' | 'grammar' | 'shorten' | 'lengthen' | 'professional' | 'casual' | 'translate' | 'summarize' | 'suggest_replies';
    text: string;
    targetLanguage?: string;
    tone?: string;
  }): Promise<{ result: string }> => {
    const res = await fetch('/api/ai/quick-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  generateAI: async (params: {
    provider?: string;
    model?: string;
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ text: string; tokensUsed: number; provider: string; model: string; durationMs: number }> => {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Agents
  getAgents: async (userId?: string): Promise<{ agents: AiAgent[] }> => {
    const res = await fetch(`/api/ai/agents?userId=${userId || 'demo-user-1'}`);
    return res.json();
  },

  createAgent: async (agent: Omit<AiAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ agent: AiAgent }> => {
    const res = await fetch('/api/ai/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    return res.json();
  },

  updateAgent: async (id: string, updates: Partial<AiAgent>): Promise<{ agent: AiAgent }> => {
    const res = await fetch(`/api/ai/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteAgent: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/ai/agents/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Prompts
  getPrompts: async (userId?: string): Promise<{ prompts: PromptTemplate[] }> => {
    const res = await fetch(`/api/ai/prompts?userId=${userId || 'demo-user-1'}`);
    return res.json();
  },

  createPrompt: async (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ prompt: PromptTemplate }> => {
    const res = await fetch('/api/ai/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    });
    return res.json();
  },

  updatePrompt: async (id: string, updates: Partial<PromptTemplate>): Promise<{ prompt: PromptTemplate }> => {
    const res = await fetch(`/api/ai/prompts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deletePrompt: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/ai/prompts/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Automations
  getAutomations: async (userId?: string): Promise<{ automations: AutomationRule[] }> => {
    const res = await fetch(`/api/automations?userId=${userId || 'demo-user-1'}`);
    return res.json();
  },

  createAutomation: async (rule: Omit<AutomationRule, 'id' | 'runCount' | 'createdAt' | 'updatedAt'>): Promise<{ automation: AutomationRule }> => {
    const res = await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    return res.json();
  },

  updateAutomation: async (id: string, updates: Partial<AutomationRule>): Promise<{ automation: AutomationRule }> => {
    const res = await fetch(`/api/automations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  deleteAutomation: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`/api/automations/${id}`, { method: 'DELETE' });
    return res.json();
  },

  getAutomationLogs: async (userId?: string): Promise<{ logs: AutomationLog[] }> => {
    const res = await fetch(`/api/automations/logs?userId=${userId || 'demo-user-1'}`);
    return res.json();
  },

  // Simulator
  simulateIncomingEvent: async (params: {
    accountId: string;
    chatId: string;
    senderId?: string;
    senderName?: string;
    messageText: string;
    isFirstMessage?: boolean;
  }): Promise<{ incomingMessage: TelegramMessage; autoReplyResult: any }> => {
    const res = await fetch('/api/simulator/incoming-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Admin
  getAdminSettings: async (): Promise<{ settings: SystemSetting }> => {
    const res = await fetch('/api/admin/settings');
    return res.json();
  },

  updateAdminSettings: async (updates: Partial<SystemSetting>): Promise<{ settings: SystemSetting }> => {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  getFeatureFlags: async (): Promise<{ featureFlags: FeatureFlags }> => {
    const res = await fetch('/api/admin/feature-flags');
    return res.json();
  },

  updateFeatureFlags: async (flags: Partial<FeatureFlags>): Promise<{ featureFlags: FeatureFlags }> => {
    const res = await fetch('/api/admin/feature-flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flags),
    });
    return res.json();
  },

  getAdminUsers: async (): Promise<{ users: UserProfile[] }> => {
    const res = await fetch('/api/admin/users');
    return res.json();
  },

  updateUserRole: async (userId: string, role: string): Promise<{ user: UserProfile }> => {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  updateUserStatus: async (userId: string, status: string): Promise<{ user: UserProfile }> => {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
};
