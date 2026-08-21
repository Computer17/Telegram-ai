import { generateAIResponse } from '../lib/aiProviders';
import { TelegramService } from './telegramService';
import { AiAgent, AutomationLog, AutomationRule, PromptTemplate } from '../../src/types';

// Pre-seeded AI Agents
let agentsStore: AiAgent[] = [
  {
    id: 'agent-001',
    userId: 'demo-user-1',
    name: 'Personal Assistant (Shakil)',
    description: 'Polite, intelligent executive assistant capable of handling schedules, queries, and natural conversations in English and Bangla.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    systemInstruction: 'You are a warm, highly professional personal AI assistant representing Shakil. Be polite, concise, and helpful. If the user writes in Bangla, reply in fluent Bangla. If they write in English, reply in English. Keep answers succinct unless detail is asked.',
    personality: 'Warm, respectful, adaptive, highly articulate executive assistant.',
    languageMode: 'multilingual',
    responseStyle: 'friendly',
    maxResponseTokens: 400,
    temperature: 0.7,
    provider: 'gemini',
    model: 'gemini-3.7-flash',
    memoryMode: 'conversation',
    replyDelaySeconds: 1,
    simulateTyping: true,
    isDefault: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'agent-002',
    userId: 'demo-user-1',
    name: 'Support & Sales Agent',
    description: '24/7 automated customer service and technical support specialist.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    systemInstruction: 'You are an official customer support representative for the AI Telegram Platform. Provide clear, step-by-step guidance on how to connect accounts, set up Gemini API keys, configure auto-replies, and run background worker queues.',
    personality: 'Professional, empathetic, structured problem solver.',
    languageMode: 'auto',
    responseStyle: 'professional',
    maxResponseTokens: 600,
    temperature: 0.5,
    provider: 'gemini',
    model: 'gemini-3.7-flash',
    memoryMode: 'window_10',
    replyDelaySeconds: 2,
    simulateTyping: true,
    isDefault: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'agent-003',
    userId: 'demo-user-1',
    name: 'Bangla Smart Concierge (বাংলা সহকারী)',
    description: 'Dedicated Bengali language assistant for authentic localized interaction.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    systemInstruction: 'আপনি একজন দক্ষ ও অমায়িক ভার্চুয়াল সহকারী। সর্বদা স্পষ্ট, মার্জিত ও শুদ্ধ বাংলা ভাষায় উত্তর প্রদান করুন। প্রযুক্তির বিভিন্ন প্রশ্নের সহজ সমাধান দিন।',
    personality: 'অমায়িক, শ্রদ্ধাশীল, প্রজ্ঞাবান ও স্পষ্টভাষী।',
    languageMode: 'bangla',
    responseStyle: 'friendly',
    maxResponseTokens: 500,
    temperature: 0.6,
    provider: 'gemini',
    model: 'gemini-3.7-flash',
    memoryMode: 'conversation',
    replyDelaySeconds: 1,
    simulateTyping: true,
    isDefault: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Pre-seeded Prompt Library
let promptsStore: PromptTemplate[] = [
  {
    id: 'prompt-001',
    userId: 'demo-user-1',
    title: 'Professional Executive Reply',
    category: 'Business',
    description: 'Draft a polite, concise business response acknowledging receipt and proposing next steps.',
    content: 'Thank you for reaching out regarding {topic}. I have reviewed your notes and will follow up with the requested details shortly.',
    variables: ['topic'],
    isFavorite: true,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-002',
    userId: 'demo-user-1',
    title: 'Instant Support & FAQ Escalation',
    category: 'Customer Support',
    description: 'Provide quick solutions to technical queries and log ticket references.',
    content: 'Hi {name}! Thanks for contacting support. Regarding your question on {feature}, here is how you can resolve it immediately:\n1. Open Settings > Account Manager\n2. Verify worker connectivity\n3. Retry operation.',
    variables: ['name', 'feature'],
    isFavorite: true,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-003',
    userId: 'demo-user-1',
    title: 'বাংলা সৌজন্যমূলক উত্তর (Bangla Courteous Reply)',
    category: 'Bangla Assistant',
    description: 'সুন্দর ও মার্জিত বাংলা বার্তা উত্তর।',
    content: 'সালাম {name} ভাই! আপনার বার্তার জন্য ধন্যবাদ। আমি বিষয়টি দেখছি এবং দ্রুত আপনাকে আপডেট জানাচ্ছি।',
    variables: ['name'],
    isFavorite: true,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-004',
    userId: 'demo-user-1',
    title: 'Meeting Schedule Confirmation',
    category: 'Productivity',
    description: 'Confirm calendar invite time and timezone.',
    content: 'Confirmed! I have locked in our discussion for {time} ({timezone}). Looking forward to connecting.',
    variables: ['time', 'timezone'],
    isFavorite: false,
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Pre-seeded Automations
let automationsStore: AutomationRule[] = [
  {
    id: 'auto-001',
    userId: 'demo-user-1',
    telegramAccountId: 'tg-acc-001',
    name: 'Pricing & Roadmap Keyword Trigger',
    enabled: true,
    triggerType: 'keyword_match',
    triggerKeywords: ['price', 'pricing', 'cost', 'roadmap', 'features', 'কোর্স', 'ফি'],
    chatTypeFilter: 'all',
    allowlist: [],
    blocklist: ['spam_bot', 'ad_channel'],
    actionType: 'ai_reply',
    agentId: 'agent-001',
    cooldownSeconds: 30,
    maxRunsPerUser: 10,
    runCount: 28,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'auto-002',
    userId: 'demo-user-1',
    telegramAccountId: 'tg-acc-001',
    name: 'First-time Contact Auto-Welcome',
    enabled: true,
    triggerType: 'first_message',
    triggerKeywords: [],
    chatTypeFilter: 'private_only',
    allowlist: [],
    blocklist: [],
    actionType: 'ai_reply',
    agentId: 'agent-001',
    cooldownSeconds: 600,
    maxRunsPerUser: 1,
    runCount: 43,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Execution Logs Store
let logsStore: AutomationLog[] = [
  {
    id: 'log-001',
    userId: 'demo-user-1',
    accountId: 'tg-acc-001',
    ruleId: 'auto-001',
    chatId: 'chat-001',
    senderName: 'Sarah Jenkins',
    incomingMessage: 'Can you confirm the review time today at 3 PM?',
    aiResponse: 'Yes absolutely! The deck is ready and the AI Telegram architecture is fully documented.',
    provider: 'gemini',
    model: 'gemini-3.7-flash',
    tokensUsed: 142,
    status: 'success',
    durationMs: 380,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    id: 'log-002',
    userId: 'demo-user-1',
    accountId: 'tg-acc-001',
    ruleId: 'auto-001',
    chatId: 'chat-003',
    senderName: 'Tariqul Islam',
    incomingMessage: 'ভাই, এআই অটো-রিপ্লাই সিস্টেমটা কিভাবে চালু করব একটু বলবেন?',
    aiResponse: 'সালাম তারিকুল ভাই! এআই অটো-রিপ্লাই চালু করতে Accounts সেকশন থেকে আপনার টেলিগ্রাম অ্যাকাউন্ট সিলেক্ট করে Auto Reply টগলটি অন করুন।',
    provider: 'gemini',
    model: 'gemini-3.7-flash',
    tokensUsed: 198,
    status: 'success',
    durationMs: 410,
    createdAt: new Date(Date.now() - 44 * 60000).toISOString(),
  },
];

export class AutoReplyEngine {
  // Agent CRUD
  static getAgents(userId: string): AiAgent[] {
    return agentsStore.filter((a) => a.userId === userId || userId === 'admin');
  }

  static getAgentById(agentId: string): AiAgent | undefined {
    return agentsStore.find((a) => a.id === agentId);
  }

  static createAgent(agent: Omit<AiAgent, 'id' | 'createdAt' | 'updatedAt'>): AiAgent {
    const newAgent: AiAgent = {
      ...agent,
      id: 'agent-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    agentsStore.push(newAgent);
    return newAgent;
  }

  static updateAgent(agentId: string, updates: Partial<AiAgent>): AiAgent | null {
    const idx = agentsStore.findIndex((a) => a.id === agentId);
    if (idx === -1) return null;
    agentsStore[idx] = {
      ...agentsStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return agentsStore[idx];
  }

  static deleteAgent(agentId: string): boolean {
    const prev = agentsStore.length;
    agentsStore = agentsStore.filter((a) => a.id !== agentId);
    return agentsStore.length < prev;
  }

  // Prompts CRUD
  static getPrompts(userId: string): PromptTemplate[] {
    return promptsStore.filter((p) => p.userId === userId || p.isPublic || userId === 'admin');
  }

  static createPrompt(prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): PromptTemplate {
    const newPrompt: PromptTemplate = {
      ...prompt,
      id: 'prompt-' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    promptsStore.unshift(newPrompt);
    return newPrompt;
  }

  static updatePrompt(promptId: string, updates: Partial<PromptTemplate>): PromptTemplate | null {
    const idx = promptsStore.findIndex((p) => p.id === promptId);
    if (idx === -1) return null;
    promptsStore[idx] = {
      ...promptsStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return promptsStore[idx];
  }

  static deletePrompt(promptId: string): boolean {
    const prev = promptsStore.length;
    promptsStore = promptsStore.filter((p) => p.id !== promptId);
    return promptsStore.length < prev;
  }

  // Automations CRUD
  static getAutomations(userId: string): AutomationRule[] {
    return automationsStore.filter((a) => a.userId === userId || userId === 'admin');
  }

  static createAutomation(rule: Omit<AutomationRule, 'id' | 'runCount' | 'createdAt' | 'updatedAt'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: 'auto-' + Math.random().toString(36).substring(2, 9),
      runCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    automationsStore.push(newRule);
    return newRule;
  }

  static updateAutomation(ruleId: string, updates: Partial<AutomationRule>): AutomationRule | null {
    const idx = automationsStore.findIndex((a) => a.id === ruleId);
    if (idx === -1) return null;
    automationsStore[idx] = {
      ...automationsStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return automationsStore[idx];
  }

  static deleteAutomation(ruleId: string): boolean {
    const prev = automationsStore.length;
    automationsStore = automationsStore.filter((a) => a.id !== ruleId);
    return automationsStore.length < prev;
  }

  // Logs
  static getLogs(userId: string): AutomationLog[] {
    return logsStore.filter((l) => l.userId === userId || userId === 'admin');
  }

  // Core Auto-Reply Pipeline
  static async processIncomingTelegramMessage(params: {
    accountId: string;
    chatId: string;
    senderId: string;
    senderName: string;
    messageText: string;
    isFirstMessage?: boolean;
  }): Promise<{
    handled: boolean;
    reason?: string;
    replyText?: string;
    log?: AutomationLog;
  }> {
    const account = TelegramService.getAccountById(params.accountId);
    if (!account) {
      return { handled: false, reason: 'Account not found' };
    }

    if (!account.autoReplyEnabled) {
      return { handled: false, reason: 'Auto-reply is disabled for this account' };
    }

    // Check Human Takeover pause on account
    const now = Date.now();
    if (account.humanTakeoverPausedUntil) {
      const pauseEnd = new Date(account.humanTakeoverPausedUntil).getTime();
      if (now < pauseEnd) {
        const remainingMin = Math.ceil((pauseEnd - now) / 60000);
        const log: AutomationLog = {
          id: 'log-' + Math.random().toString(36).substring(2, 9),
          userId: account.userId,
          accountId: account.id,
          chatId: params.chatId,
          senderName: params.senderName,
          incomingMessage: params.messageText,
          status: 'skipped_takeover',
          durationMs: 5,
          errorMessage: `Human Takeover active (${remainingMin}m remaining)`,
          createdAt: new Date().toISOString(),
        };
        logsStore.unshift(log);
        return { handled: false, reason: `Human Takeover active (${remainingMin}m remaining)`, log };
      } else {
        // Pause has expired, clear it
        account.humanTakeoverPausedUntil = undefined;
      }
    }

    // Check Chat level pause
    const chat = TelegramService.getChatById(params.chatId);
    if (chat?.aiAutoReplyPaused && chat.aiAutoReplyPauseExpiresAt) {
      const pauseEnd = new Date(chat.aiAutoReplyPauseExpiresAt).getTime();
      if (now < pauseEnd) {
        return { handled: false, reason: 'Auto-reply paused for this specific chat.' };
      } else {
        chat.aiAutoReplyPaused = false;
        chat.aiAutoReplyPauseExpiresAt = undefined;
      }
    }

    // Daily Limit Check
    if (account.dailyAiRepliesUsed >= account.dailyAiRepliesMax) {
      const log: AutomationLog = {
        id: 'log-' + Math.random().toString(36).substring(2, 9),
        userId: account.userId,
        accountId: account.id,
        chatId: params.chatId,
        senderName: params.senderName,
        incomingMessage: params.messageText,
        status: 'rate_limited',
        durationMs: 2,
        errorMessage: 'Daily AI reply quota limit reached.',
        createdAt: new Date().toISOString(),
      };
      logsStore.unshift(log);
      return { handled: false, reason: 'Daily AI reply limit reached', log };
    }

    // Match rules or fallback to default agent
    const matchingRule = automationsStore.find((rule) => {
      if (!rule.enabled) return false;
      if (rule.telegramAccountId && rule.telegramAccountId !== account.id) return false;

      // Filter by keywords
      if (rule.triggerType === 'keyword_match' && rule.triggerKeywords.length > 0) {
        const lowerMsg = params.messageText.toLowerCase();
        return rule.triggerKeywords.some((kw) => lowerMsg.includes(kw.toLowerCase()));
      }

      if (rule.triggerType === 'first_message' && params.isFirstMessage) {
        return true;
      }

      if (rule.triggerType === 'new_message') {
        return true;
      }

      return false;
    });

    // Determine AI Agent to use
    const agentId = matchingRule?.agentId || account.assignedAgentId || 'agent-001';
    const agent = agentsStore.find((a) => a.id === agentId) || agentsStore[0];

    // Build context with recent conversation memory
    const recentMessages = TelegramService.getMessages(params.chatId).slice(-6);
    const conversationHistory = recentMessages
      .map((m) => `${m.senderName} (${m.isOutgoing ? 'AI/Me' : 'User'}): ${m.text}`)
      .join('\n');

    const promptContext = `
${conversationHistory ? `RECENT CONVERSATION HISTORY:\n${conversationHistory}\n` : ''}
LATEST INCOMING MESSAGE:
From: ${params.senderName}
Message: "${params.messageText}"

Please formulate a helpful, authentic, polite reply. Language requirement: ${agent.languageMode}. Style: ${agent.responseStyle}.
`;

    try {
      const aiResult = await generateAIResponse({
        provider: agent.provider || account.assignedProvider || 'gemini',
        model: agent.model || account.assignedModel || 'gemini-3.7-flash',
        prompt: promptContext,
        systemInstruction: agent.systemInstruction,
        temperature: agent.temperature,
        maxTokens: agent.maxResponseTokens,
      });

      // Dispatch reply
      const replyMsg = TelegramService.sendMessage({
        chatId: params.chatId,
        accountId: account.id,
        text: aiResult.text,
        isOutgoing: true,
        aiGenerated: true,
        aiAgentName: `${agent.name} (${aiResult.provider.toUpperCase()})`,
      });

      // Increment daily quota & rule run count
      account.dailyAiRepliesUsed += 1;
      if (matchingRule) {
        matchingRule.runCount += 1;
        matchingRule.lastRunAt = new Date().toISOString();
      }

      const log: AutomationLog = {
        id: 'log-' + Math.random().toString(36).substring(2, 9),
        userId: account.userId,
        accountId: account.id,
        ruleId: matchingRule?.id,
        chatId: params.chatId,
        senderName: params.senderName,
        incomingMessage: params.messageText,
        aiResponse: aiResult.text,
        provider: aiResult.provider,
        model: aiResult.model,
        tokensUsed: aiResult.tokensUsed,
        status: 'success',
        durationMs: aiResult.durationMs,
        createdAt: new Date().toISOString(),
      };
      logsStore.unshift(log);

      return {
        handled: true,
        replyText: aiResult.text,
        log,
      };
    } catch (err: any) {
      console.error('Auto-reply generation failed:', err);
      const log: AutomationLog = {
        id: 'log-' + Math.random().toString(36).substring(2, 9),
        userId: account.userId,
        accountId: account.id,
        ruleId: matchingRule?.id,
        chatId: params.chatId,
        senderName: params.senderName,
        incomingMessage: params.messageText,
        status: 'failed',
        durationMs: 50,
        errorMessage: err.message || 'AI generation failed',
        createdAt: new Date().toISOString(),
      };
      logsStore.unshift(log);
      return { handled: false, reason: err.message, log };
    }
  }
}
