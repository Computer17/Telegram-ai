import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { TelegramService } from './server/services/telegramService';
import { AutoReplyEngine } from './server/services/autoReplyEngine';
import { AdminService } from './server/services/adminService';
import { generateAIResponse } from './server/lib/aiProviders';
import { generateGeminiContent } from './server/lib/gemini';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AI Telegram Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // --- Telegram Account APIs ---
  app.get('/api/telegram/accounts', (req, res) => {
    const userId = (req.query.userId as string) || 'demo-user-1';
    const accounts = TelegramService.getAccounts(userId);
    res.json({ accounts });
  });

  app.post('/api/telegram/auth/send-code', async (req, res) => {
    try {
      const { phoneNumber, apiId, apiHash, connectionType } = req.body;
      const result = await TelegramService.sendAuthCode({
        phoneNumber,
        apiId,
        apiHash,
        connectionType: connectionType || 'user_mtproto',
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/telegram/auth/verify-code', async (req, res) => {
    try {
      const { sessionId, code, userId, password2FA, botToken } = req.body;
      const result = await TelegramService.verifyCode({
        sessionId,
        code,
        userId: userId || 'demo-user-1',
        password2FA,
        botToken,
      });
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/telegram/accounts/:id', (req, res) => {
    const account = TelegramService.updateAccount(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json({ account });
  });

  app.delete('/api/telegram/accounts/:id', (req, res) => {
    const success = TelegramService.deleteAccount(req.params.id);
    res.json({ success });
  });

  // --- Telegram Chat & Message APIs ---
  app.get('/api/telegram/chats', async (req, res) => {
    try {
      const accountId = req.query.accountId as string | undefined;
      const chats = await TelegramService.getChatsAsync(accountId);
      res.json({ chats });
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      res.json({ chats: TelegramService.getChats(req.query.accountId as string) });
    }
  });

  app.get('/api/telegram/chats/:chatId/messages', async (req, res) => {
    try {
      const accountId = req.query.accountId as string | undefined;
      const messages = await TelegramService.getMessagesAsync(req.params.chatId, accountId);
      res.json({ messages });
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      res.json({ messages: TelegramService.getMessages(req.params.chatId) });
    }
  });

  app.post('/api/telegram/messages/send', async (req, res) => {
    try {
      const { chatId, accountId, text, replyToMessageId, media } = req.body;
      const msg = await TelegramService.sendMessageAsync({
        chatId,
        accountId,
        text,
        replyToMessageId,
        media,
        isOutgoing: true,
      });
      res.json({ message: msg });
    } catch (err: any) {
      console.error('Error sending message:', err);
      res.status(400).json({ error: err.message || 'Failed to send message' });
    }
  });

  app.post('/api/telegram/messages/:id/react', async (req, res) => {
    const { emoji, accountId, chatId } = req.body;
    if (accountId && chatId) {
      await TelegramService.toggleReactionAsync(accountId, chatId, req.params.id, emoji);
    }
    const msg = TelegramService.toggleReaction(req.params.id, emoji);
    res.json({ message: msg || { id: req.params.id, reactions: [{ emoji, count: 1, hasReacted: true }] } });
  });

  app.delete('/api/telegram/messages/:id', async (req, res) => {
    const { accountId, chatId } = req.body || {};
    if (accountId && chatId) {
      await TelegramService.deleteMessageAsync(accountId, chatId, req.params.id);
    } else {
      TelegramService.deleteMessage(req.params.id);
    }
    res.json({ success: true });
  });

  // --- AI Smart Features & Toolbar ---
  app.post('/api/ai/quick-assist', async (req, res) => {
    try {
      const { action, text, targetLanguage, tone } = req.body;
      let prompt = '';

      switch (action) {
        case 'rewrite':
          prompt = `Rewrite the following message clearly, concisely, and naturally:\n\n"${text}"`;
          break;
        case 'grammar':
          prompt = `Fix all spelling, punctuation, and grammatical mistakes in the following message, maintaining its original meaning:\n\n"${text}"`;
          break;
        case 'shorten':
          prompt = `Condense and shorten the following message while keeping all core facts:\n\n"${text}"`;
          break;
        case 'lengthen':
          prompt = `Expand the following message with polite, thorough context and professional phrasing:\n\n"${text}"`;
          break;
        case 'professional':
          prompt = `Rewrite the following message in a refined, polished corporate executive tone:\n\n"${text}"`;
          break;
        case 'casual':
          prompt = `Rewrite the following message in a friendly, relaxed, casual tone with natural conversational phrasing:\n\n"${text}"`;
          break;
        case 'translate':
          prompt = `Translate the following message accurately into ${targetLanguage || 'English'}:\n\n"${text}"`;
          break;
        case 'summarize':
          prompt = `Provide a 1-sentence executive summary and 2-3 key takeaways for the following message:\n\n"${text}"`;
          break;
        case 'suggest_replies':
          prompt = `Based on the following incoming message, provide 3 short, distinct, high-quality suggested reply options (Option 1: Friendly/Accepting, Option 2: Professional inquiry, Option 3: Polite deferral). Format as numbered list:\n\n"${text}"`;
          break;
        default:
          prompt = `Refine and improve the following text:\n\n"${text}"`;
      }

      const result = await generateGeminiContent(prompt, {
        model: 'gemini-3.7-flash',
        systemInstruction: 'You are an elite communication assistant. Provide only the requested refined text without conversational filler or meta-commentary.',
      });

      res.json({ result: result.text.trim() });
    } catch (err: any) {
      console.error('Quick assist error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Direct AI generation endpoint
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { provider, model, prompt, systemInstruction, temperature, maxTokens } = req.body;
      const result = await generateAIResponse({
        provider: provider || 'gemini',
        model: model || 'gemini-3.7-flash',
        prompt,
        systemInstruction,
        temperature,
        maxTokens,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- AI Agent Builder APIs ---
  app.get('/api/ai/agents', (req, res) => {
    const userId = (req.query.userId as string) || 'demo-user-1';
    const agents = AutoReplyEngine.getAgents(userId);
    res.json({ agents });
  });

  app.post('/api/ai/agents', (req, res) => {
    const agent = AutoReplyEngine.createAgent(req.body);
    res.json({ agent });
  });

  app.patch('/api/ai/agents/:id', (req, res) => {
    const agent = AutoReplyEngine.updateAgent(req.params.id, req.body);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json({ agent });
  });

  app.delete('/api/ai/agents/:id', (req, res) => {
    const success = AutoReplyEngine.deleteAgent(req.params.id);
    res.json({ success });
  });

  // --- Prompts Library APIs ---
  app.get('/api/ai/prompts', (req, res) => {
    const userId = (req.query.userId as string) || 'demo-user-1';
    const prompts = AutoReplyEngine.getPrompts(userId);
    res.json({ prompts });
  });

  app.post('/api/ai/prompts', (req, res) => {
    const prompt = AutoReplyEngine.createPrompt(req.body);
    res.json({ prompt });
  });

  app.patch('/api/ai/prompts/:id', (req, res) => {
    const prompt = AutoReplyEngine.updatePrompt(req.params.id, req.body);
    if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
    res.json({ prompt });
  });

  app.delete('/api/ai/prompts/:id', (req, res) => {
    const success = AutoReplyEngine.deletePrompt(req.params.id);
    res.json({ success });
  });

  // --- Automations & Rules APIs ---
  app.get('/api/automations', (req, res) => {
    const userId = (req.query.userId as string) || 'demo-user-1';
    const automations = AutoReplyEngine.getAutomations(userId);
    res.json({ automations });
  });

  app.post('/api/automations', (req, res) => {
    const rule = AutoReplyEngine.createAutomation(req.body);
    res.json({ automation: rule });
  });

  app.patch('/api/automations/:id', (req, res) => {
    const rule = AutoReplyEngine.updateAutomation(req.params.id, req.body);
    if (!rule) return res.status(404).json({ error: 'Automation not found' });
    res.json({ automation: rule });
  });

  app.delete('/api/automations/:id', (req, res) => {
    const success = AutoReplyEngine.deleteAutomation(req.params.id);
    res.json({ success });
  });

  app.get('/api/automations/logs', (req, res) => {
    const userId = (req.query.userId as string) || 'demo-user-1';
    const logs = AutoReplyEngine.getLogs(userId);
    res.json({ logs });
  });

  // --- Live Telegram Event Simulator ---
  app.post('/api/simulator/incoming-event', async (req, res) => {
    try {
      const { accountId, chatId, senderId, senderName, messageText, isFirstMessage } = req.body;

      // 1. Post incoming message to the chat thread
      const incomingMsg = TelegramService.sendMessage({
        chatId,
        accountId,
        text: messageText,
        isOutgoing: false,
      });

      // 2. Trigger AutoReplyEngine processing
      const result = await AutoReplyEngine.processIncomingTelegramMessage({
        accountId,
        chatId,
        senderId: senderId || 'sim-user-101',
        senderName: senderName || 'Live Contact',
        messageText,
        isFirstMessage: isFirstMessage ?? false,
      });

      res.json({
        incomingMessage: incomingMsg,
        autoReplyResult: result,
      });
    } catch (err: any) {
      console.error('Simulator incoming event error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- Admin APIs ---
  app.get('/api/admin/settings', (req, res) => {
    res.json({ settings: AdminService.getSettings() });
  });

  app.patch('/api/admin/settings', (req, res) => {
    res.json({ settings: AdminService.updateSettings(req.body) });
  });

  app.get('/api/admin/feature-flags', (req, res) => {
    res.json({ featureFlags: AdminService.getFeatureFlags() });
  });

  app.patch('/api/admin/feature-flags', (req, res) => {
    res.json({ featureFlags: AdminService.updateFeatureFlags(req.body) });
  });

  app.get('/api/admin/users', (req, res) => {
    res.json({ users: AdminService.getUsers() });
  });

  app.patch('/api/admin/users/:id/role', (req, res) => {
    const user = AdminService.updateUserRole(req.params.id, req.body.role);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });

  app.patch('/api/admin/users/:id/status', (req, res) => {
    const user = AdminService.toggleUserStatus(req.params.id, req.body.status);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  });

  // --- Vite Dev & Prod Middleware Setup ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Telegram Platform running on http://localhost:${PORT}`);
  });
}

startServer();
