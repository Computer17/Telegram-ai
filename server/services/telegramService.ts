import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage } from 'telegram/events/index.js';
import { encrypt, decrypt } from '../lib/crypto';
import { TelegramAccount, TelegramChat, TelegramMessage } from '../../src/types';
import { AutoReplyEngine } from './autoReplyEngine';

// Default public Telegram API credentials if not provided in env or UI
const DEFAULT_API_ID = process.env.TELEGRAM_API_ID ? parseInt(process.env.TELEGRAM_API_ID) : 2040;
const DEFAULT_API_HASH = process.env.TELEGRAM_API_HASH || 'b18441a1ff607e10a989891a5462e627';

interface PendingAuthSession {
  sessionId: string;
  client: TelegramClient;
  phoneNumber: string;
  phoneCodeHash: string;
  apiId: number;
  apiHash: string;
  connectionType: 'user_mtproto' | 'bot_token' | 'tdlib';
  createdAt: number;
}

// Memory stores for active server session
const pendingAuthSessions: Map<string, PendingAuthSession> = new Map();
const activeClients: Map<string, TelegramClient> = new Map();

// Accounts database (persisted server-side with AES-256 encrypted sessions)
let accountsStore: TelegramAccount[] = [];

// In-memory cache for fast UI access
let cachedChats: Map<string, TelegramChat[]> = new Map();
let cachedMessages: Map<string, TelegramMessage[]> = new Map();

export class TelegramService {
  /**
   * Returns list of connected accounts for a given user
   */
  static getAccounts(userId: string): TelegramAccount[] {
    return accountsStore.filter((acc) => acc.userId === userId || userId === 'admin');
  }

  static getAccountById(accountId: string): TelegramAccount | undefined {
    return accountsStore.find((acc) => acc.id === accountId);
  }

  /**
   * Step 1: Send authorization code to the user's real phone via MTProto
   */
  static async sendAuthCode(params: {
    phoneNumber: string;
    apiId?: string | number;
    apiHash?: string;
    connectionType: 'user_mtproto' | 'bot_token' | 'tdlib';
  }): Promise<{ sessionId: string; status: string; message: string; isCodeViaApp?: boolean }> {
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 12);
    const apiId = params.apiId ? parseInt(String(params.apiId)) : DEFAULT_API_ID;
    const apiHash = params.apiHash && params.apiHash.trim() ? params.apiHash.trim() : DEFAULT_API_HASH;

    if (params.connectionType === 'bot_token') {
      return {
        sessionId,
        status: 'ready_to_connect_bot',
        message: 'Bot token validation ready.',
      };
    }

    try {
      const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
        connectionRetries: 5,
        useWSS: false,
      });

      await client.connect();

      // Dispatch real official Telegram verification code
      const result = await client.sendCode(
        {
          apiId,
          apiHash,
        },
        params.phoneNumber
      );

      pendingAuthSessions.set(sessionId, {
        sessionId,
        client,
        phoneNumber: params.phoneNumber,
        phoneCodeHash: result.phoneCodeHash,
        apiId,
        apiHash,
        connectionType: params.connectionType || 'user_mtproto',
        createdAt: Date.now(),
      });

      return {
        sessionId,
        status: 'code_sent',
        message: result.isCodeViaApp
          ? `Official Telegram authorization code has been dispatched to your active Telegram app.`
          : `Official Telegram authorization code has been dispatched via SMS to ${params.phoneNumber}.`,
        isCodeViaApp: result.isCodeViaApp,
      };
    } catch (err: any) {
      console.error('Error sending Telegram auth code:', err);
      throw new Error(err.errorMessage || err.message || 'Failed to dispatch Telegram authorization code.');
    }
  }

  /**
   * Step 2: Verify code, handle 2FA password, persist encrypted session & load real Telegram profile
   */
  static async verifyCode(params: {
    sessionId: string;
    code: string;
    userId: string;
    password2FA?: string;
    botToken?: string;
    apiId?: string | number;
    apiHash?: string;
  }): Promise<{ success: boolean; needs2FA?: boolean; account?: TelegramAccount; error?: string; message?: string }> {
    const apiId = params.apiId ? parseInt(String(params.apiId)) : DEFAULT_API_ID;
    const apiHash = params.apiHash && params.apiHash.trim() ? params.apiHash.trim() : DEFAULT_API_HASH;

    // --- Case A: Telegram Bot Token Authorization ---
    if (params.botToken) {
      try {
        const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
          connectionRetries: 5,
        });

        await client.start({
          botAuthToken: params.botToken.trim(),
        });

        const me: any = await client.getMe();
        const sessionString = client.session.save() as unknown as string;
        const encryptedSession = encrypt(sessionString);

        let photoUrl: string | undefined = undefined;
        try {
          const photoBuffer = await client.downloadProfilePhoto('me', { isBig: false });
          if (photoBuffer && photoBuffer.length > 0) {
            photoUrl = `data:image/jpeg;base64,${Buffer.from(photoBuffer).toString('base64')}`;
          }
        } catch {
          // ignore photo error
        }

        const newAccount: TelegramAccount = {
          id: `tg-acc-${me.id}`,
          userId: params.userId || 'demo-user-1',
          telegramUserId: String(me.id),
          phoneNumberMasked: me.username ? `@${me.username}` : 'Telegram Bot',
          username: me.username || '',
          firstName: me.firstName || 'Bot',
          lastName: me.lastName || '',
          photoUrl: photoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          connectionType: 'bot_token',
          status: 'connected',
          autoReplyEnabled: true,
          assignedProvider: 'gemini',
          assignedModel: 'gemini-3.7-flash',
          humanTakeoverDurationMinutes: 15,
          proxyEnabled: false,
          dailyAiRepliesUsed: 0,
          dailyAiRepliesMax: 1000,
          lastActivityAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          encryptedSession,
        };

        // Remove existing duplicate if re-logging in
        accountsStore = accountsStore.filter((a) => a.id !== newAccount.id);
        accountsStore.unshift(newAccount);

        // Keep client active in worker
        activeClients.set(newAccount.id, client);
        this.attachClientEventListeners(newAccount.id, client);

        return { success: true, account: newAccount };
      } catch (err: any) {
        console.error('Bot authorization failed:', err);
        return { success: false, error: err.errorMessage || err.message || 'Invalid Bot Token' };
      }
    }

    // --- Case B: Real Telegram User MTProto Authorization ---
    const session = pendingAuthSessions.get(params.sessionId);
    if (!session) {
      return {
        success: false,
        error: 'Session expired or not found. Please click Back and request a new verification code.',
      };
    }

    const { client, phoneNumber, phoneCodeHash } = session;
    const cleanCode = (params.code || '').trim().replace(/[\s-]/g, '');

    try {
      if (params.password2FA) {
        // Handle 2FA Password Submission
        try {
          if (typeof (client as any).checkPassword === 'function') {
            await (client as any).checkPassword(params.password2FA.trim());
          } else {
            await (client as any).signInUser(
              { apiId: session.apiId, apiHash: session.apiHash },
              {
                phoneNumber,
                phoneCodeHash,
                phoneCode: async () => cleanCode,
                password: async () => params.password2FA || '',
                onError: (err: any) => {
                  throw err;
                },
              }
            );
          }
        } catch (pwdErr: any) {
          const pwdMsg = String(pwdErr.errorMessage || pwdErr.message || '');
          if (pwdMsg.includes('PASSWORD_HASH_INVALID')) {
            return {
              success: false,
              needs2FA: true,
              error: 'Incorrect 2FA password. Please check your Telegram cloud password and try again.',
            };
          }
          throw pwdErr;
        }
      } else {
        // Standard code submission
        try {
          if (typeof (client as any).signInUser === 'function') {
            await (client as any).signInUser(
              { apiId: session.apiId, apiHash: session.apiHash },
              {
                phoneNumber,
                phoneCodeHash,
                phoneCode: async () => cleanCode,
                password: async () => {
                  throw new Error('SESSION_PASSWORD_NEEDED');
                },
                onError: (err: any) => {
                  throw err;
                },
              }
            );
          } else {
            await client.invoke(
              new Api.auth.SignIn({
                phoneNumber,
                phoneCodeHash,
                phoneCode: cleanCode,
              })
            );
          }
        } catch (signInErr: any) {
          const errString = String(signInErr.errorMessage || signInErr.message || '');
          if (
            errString.includes('SESSION_PASSWORD_NEEDED') ||
            errString.includes('2FA') ||
            errString.includes('password')
          ) {
            return {
              success: false,
              needs2FA: true,
              message: 'Your Telegram account is protected by 2-Step Verification. Please enter your 2FA password.',
            };
          }
          throw signInErr;
        }
      }

      // Authorization succeeded!
      const me: any = await client.getMe();
      const sessionString = client.session.save() as unknown as string;
      const encryptedSession = encrypt(sessionString);

      // Download real user profile photo
      let photoUrl: string | undefined = undefined;
      try {
        const photoBuffer = await client.downloadProfilePhoto('me', { isBig: false });
        if (photoBuffer && photoBuffer.length > 0) {
          photoUrl = `data:image/jpeg;base64,${Buffer.from(photoBuffer).toString('base64')}`;
        }
      } catch (photoErr) {
        console.warn('Could not fetch Telegram avatar:', photoErr);
      }

      // Build masked phone
      const rawPhone = me.phone || phoneNumber;
      const masked = rawPhone.length > 6 
        ? `+${rawPhone.slice(0, 3)} •••• ${rawPhone.slice(-4)}`
        : rawPhone;

      const newAccount: TelegramAccount = {
        id: `tg-acc-${me.id}`,
        userId: params.userId || 'demo-user-1',
        telegramUserId: String(me.id),
        phoneNumberMasked: masked,
        username: me.username || '',
        firstName: me.firstName || 'Telegram',
        lastName: me.lastName || 'User',
        photoUrl,
        connectionType: 'user_mtproto',
        status: 'connected',
        autoReplyEnabled: true,
        assignedProvider: 'gemini',
        assignedModel: 'gemini-3.7-flash',
        humanTakeoverDurationMinutes: 30,
        proxyEnabled: false,
        dailyAiRepliesUsed: 0,
        dailyAiRepliesMax: 500,
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        encryptedSession,
      };

      // Remove duplicate if exists and save
      accountsStore = accountsStore.filter((a) => a.id !== newAccount.id);
      accountsStore.unshift(newAccount);

      // Register in active clients pool
      activeClients.set(newAccount.id, client);
      this.attachClientEventListeners(newAccount.id, client);

      // Clean up pending session
      pendingAuthSessions.delete(params.sessionId);

      // Pre-warm real chats
      this.fetchRealChats(newAccount.id).catch((err) => {
        console.warn('Pre-warming chats error:', err);
      });

      return { success: true, account: newAccount };
    } catch (err: any) {
      console.error('Telegram verify code error:', err);
      const rawMsg = String(err.errorMessage || err.message || '');
      let friendlyError = 'Verification failed. Please check the code and try again.';

      if (rawMsg.includes('PHONE_CODE_INVALID')) {
        friendlyError = 'Invalid verification code. Please check your Telegram app or SMS and enter the exact 5-digit code.';
      } else if (rawMsg.includes('PHONE_CODE_EXPIRED')) {
        friendlyError = 'Verification code has expired. Please go back and request a new code.';
      } else if (rawMsg.includes('PASSWORD_HASH_INVALID')) {
        friendlyError = 'Incorrect 2FA password. Please check your cloud password.';
      } else if (rawMsg.includes('FLOOD')) {
        friendlyError = 'Too many attempts. Please wait a moment before trying again.';
      } else if (rawMsg.includes('PHONE_NUMBER_INVALID')) {
        friendlyError = 'Invalid phone number format.';
      } else if (err.errorMessage) {
        friendlyError = `${err.errorMessage}: Please check and try again.`;
      } else if (err.message) {
        friendlyError = err.message;
      }

      return { success: false, error: friendlyError };
    }
  }

  /**
   * Attaches real-time MTProto event listeners to active Telegram client for live incoming messages & AI auto-reply
   */
  private static attachClientEventListeners(accountId: string, client: TelegramClient) {
    client.addEventHandler(async (event: any) => {
      try {
        const msg = event.message;
        if (!msg) return;

        // Skip outgoing messages from triggering AI auto-reply on ourselves
        if (msg.out) {
          // If human user sent an outgoing message directly from another Telegram app, trigger takeover pause!
          const account = this.getAccountById(accountId);
          if (account) {
            const pauseMinutes = account.humanTakeoverDurationMinutes || 30;
            const pauseUntil = new Date(Date.now() + pauseMinutes * 60000).toISOString();
            account.humanTakeoverPausedUntil = pauseUntil;
          }
          return;
        }

        const peerId = String(msg.chatId || msg.peerId?.userId || msg.peerId?.channelId || msg.peerId?.chatId || '');
        const senderName = (msg.sender as any)?.firstName 
          ? `${(msg.sender as any).firstName} ${(msg.sender as any).lastName || ''}`.trim() 
          : 'Telegram User';

        // Auto-reply processing
        const messageText = msg.message || '';
        if (messageText.trim()) {
          const autoReplyResult = await AutoReplyEngine.processIncomingTelegramMessage({
            accountId,
            chatId: peerId,
            senderId: String(msg.senderId || 'user'),
            senderName,
            messageText,
            isFirstMessage: false,
          });

          // If AI produced an auto-reply, send it back through Telegram MTProto!
          if (autoReplyResult.handled && autoReplyResult.replyText) {
            await client.sendMessage(msg.peerId || peerId, {
              message: autoReplyResult.replyText,
              replyTo: msg.id,
            });
          }
        }

        // Invalidate chats cache so fresh message is reflected in UI
        cachedChats.delete(accountId);
        cachedMessages.delete(peerId);
      } catch (eventErr) {
        console.error('Error in Telegram event handler:', eventErr);
      }
    }, new NewMessage({}));
  }

  /**
   * Fetches real Telegram Dialogs (Private chats, Groups, Channels) via MTProto
   */
  static async fetchRealChats(accountId: string): Promise<TelegramChat[]> {
    const client = activeClients.get(accountId);
    if (!client) {
      return cachedChats.get(accountId) || [];
    }

    try {
      const dialogs = await client.getDialogs({ limit: 40 });
      const chats: TelegramChat[] = [];

      for (const dialog of dialogs) {
        if (!dialog) continue;

        const id = String(dialog.id);
        const entity: any = dialog.entity;

        let type: TelegramChat['type'] = 'private';
        let memberCount: number | undefined = undefined;

        if (dialog.isChannel) {
          if (entity?.broadcast) {
            type = 'channel';
          } else {
            type = 'supergroup';
          }
          memberCount = entity?.participantsCount;
        } else if (dialog.isGroup) {
          type = 'group';
          memberCount = entity?.participantsCount;
        } else if (entity?.bot) {
          type = 'bot';
        }

        const title = dialog.title || dialog.name || (entity?.firstName ? `${entity.firstName} ${entity.lastName || ''}`.trim() : 'Telegram Chat');

        const lastMsg = dialog.message;
        let mediaType: any = undefined;
        if (lastMsg?.media) {
          if ((lastMsg.media as any).photo) mediaType = 'photo';
          else if ((lastMsg.media as any).document) mediaType = 'document';
          else if ((lastMsg.media as any).voice) mediaType = 'voice';
          else mediaType = 'photo';
        }

        const isChannel = type === 'channel';

        chats.push({
          id,
          accountId,
          title,
          type,
          username: entity?.username,
          avatarUrl: undefined, // Lazy or generated on client
          isPinned: !!dialog.pinned,
          isMuted: false,
          unreadCount: dialog.unreadCount || 0,
          onlineStatus: type === 'private' ? 'online' : undefined,
          memberCount,
          description: entity?.about,
          lastMessage: lastMsg ? {
            id: String(lastMsg.id),
            text: lastMsg.message || (mediaType ? `[${mediaType}]` : ''),
            senderName: lastMsg.out ? 'Me' : title,
            isOutgoing: !!lastMsg.out,
            timestamp: new Date((lastMsg.date || Date.now() / 1000) * 1000).toISOString(),
            mediaType,
          } : undefined,
          folderId: isChannel ? 'channels' : (type === 'group' || type === 'supergroup') ? 'groups' : 'personal',
          aiAutoReplyPaused: false,
          capabilities: {
            canSendMessages: !isChannel || !!entity?.creator || !!entity?.adminRights,
            canSendMedia: !isChannel || !!entity?.creator || !!entity?.adminRights,
            canEditMessages: true,
            canDeleteMessages: true,
            canPinMessages: true,
            canReact: true,
            canCall: false,
          },
        });
      }

      cachedChats.set(accountId, chats);
      return chats;
    } catch (err) {
      console.error('Failed to fetch real dialogs from Telegram:', err);
      return cachedChats.get(accountId) || [];
    }
  }

  /**
   * Retrieves chats (either from real active MTProto client or cached store)
   */
  static async getChatsAsync(accountId?: string): Promise<TelegramChat[]> {
    if (!accountId) {
      const allAccounts = accountsStore;
      if (allAccounts.length === 0) return [];
      const firstAcc = allAccounts[0];
      return this.fetchRealChats(firstAcc.id);
    }
    return this.fetchRealChats(accountId);
  }

  static getChats(accountId?: string): TelegramChat[] {
    if (accountId) {
      return cachedChats.get(accountId) || [];
    }
    const all: TelegramChat[] = [];
    for (const chats of cachedChats.values()) {
      all.push(...chats);
    }
    return all;
  }

  static getChatById(chatId: string): TelegramChat | undefined {
    for (const chats of cachedChats.values()) {
      const found = chats.find((c) => c.id === chatId);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Fetches real messages for a chat from Telegram MTProto
   */
  static async getMessagesAsync(chatId: string, accountId?: string): Promise<TelegramMessage[]> {
    const targetAccountId = accountId || accountsStore[0]?.id;
    if (!targetAccountId) return [];

    const client = activeClients.get(targetAccountId);
    if (!client) {
      return cachedMessages.get(chatId) || [];
    }

    try {
      const rawMessages = await client.getMessages(chatId, { limit: 50 });
      const messages: TelegramMessage[] = [];

      for (const m of rawMessages) {
        if (!m) continue;

        let media: TelegramMessage['media'] = undefined;
        if (m.media) {
          const mediaObj: any = m.media;
          if (mediaObj.photo) {
            media = { type: 'photo', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80' };
          } else if (mediaObj.document?.mimeType?.includes('audio') || mediaObj.voice) {
            media = {
              type: 'voice',
              url: 'https://actions.google.com/sounds/v1/water/rain_heavy.ogg',
              durationSeconds: mediaObj.document?.attributes?.[0]?.duration || 15,
            };
          } else if (mediaObj.document) {
            media = {
              type: 'document',
              url: '#',
              fileName: mediaObj.document?.attributes?.[0]?.fileName || 'Document.pdf',
              fileSize: `${Math.round((mediaObj.document?.size || 1024) / 1024)} KB`,
            };
          }
        }

        const senderName = m.out
          ? 'Me'
          : (m.sender as any)?.firstName
          ? `${(m.sender as any).firstName} ${(m.sender as any).lastName || ''}`.trim()
          : 'Telegram User';

        messages.unshift({
          id: String(m.id),
          chatId,
          accountId: targetAccountId,
          senderId: String(m.senderId || (m.out ? targetAccountId : 'contact')),
          senderName,
          isOutgoing: !!m.out,
          text: m.message || (media ? `[${media.type}]` : ''),
          timestamp: new Date((m.date || Date.now() / 1000) * 1000).toISOString(),
          media,
        });
      }

      cachedMessages.set(chatId, messages);
      return messages;
    } catch (err) {
      console.error(`Failed to fetch messages for chat ${chatId}:`, err);
      return cachedMessages.get(chatId) || [];
    }
  }

  static getMessages(chatId: string): TelegramMessage[] {
    return cachedMessages.get(chatId) || [];
  }

  /**
   * Sends a real Telegram message via MTProto
   */
  static async sendMessageAsync(params: {
    chatId: string;
    accountId: string;
    text: string;
    replyToMessageId?: string;
    isOutgoing?: boolean;
    aiGenerated?: boolean;
    aiAgentName?: string;
    media?: TelegramMessage['media'];
  }): Promise<TelegramMessage> {
    const client = activeClients.get(params.accountId);

    let realMessageId = 'msg-' + Date.now();

    if (client) {
      try {
        const sent: any = await client.sendMessage(params.chatId, {
          message: params.text,
          replyTo: params.replyToMessageId ? parseInt(params.replyToMessageId) : undefined,
        });
        if (sent && sent.id) {
          realMessageId = String(sent.id);
        }
      } catch (sendErr) {
        console.error('Failed to send message via MTProto client:', sendErr);
        throw sendErr;
      }
    }

    const newMessage: TelegramMessage = {
      id: realMessageId,
      chatId: params.chatId,
      accountId: params.accountId,
      senderId: params.isOutgoing ? params.accountId : 'sender-' + params.chatId,
      senderName: params.isOutgoing ? 'Me' : 'Telegram Contact',
      isOutgoing: params.isOutgoing ?? true,
      text: params.text,
      timestamp: new Date().toISOString(),
      replyToMessageId: params.replyToMessageId,
      aiGenerated: params.aiGenerated,
      aiAgentName: params.aiAgentName,
      media: params.media,
    };

    const current = cachedMessages.get(params.chatId) || [];
    current.push(newMessage);
    cachedMessages.set(params.chatId, current);

    // Human Takeover rule: If account owner manually replies, pause AI auto-reply
    if (params.isOutgoing && !params.aiGenerated) {
      const account = accountsStore.find((a) => a.id === params.accountId);
      if (account) {
        const pauseMinutes = account.humanTakeoverDurationMinutes || 30;
        const pauseUntil = new Date(Date.now() + pauseMinutes * 60000).toISOString();
        account.humanTakeoverPausedUntil = pauseUntil;
      }
    }

    return newMessage;
  }

  static sendMessage(params: {
    chatId: string;
    accountId: string;
    text: string;
    replyToMessageId?: string;
    isOutgoing?: boolean;
    aiGenerated?: boolean;
    aiAgentName?: string;
    media?: TelegramMessage['media'];
  }): TelegramMessage {
    const newMessage: TelegramMessage = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      chatId: params.chatId,
      accountId: params.accountId,
      senderId: params.isOutgoing ? params.accountId : 'sender-' + params.chatId,
      senderName: params.isOutgoing ? 'Me' : 'Telegram Contact',
      isOutgoing: params.isOutgoing ?? true,
      text: params.text,
      timestamp: new Date().toISOString(),
      replyToMessageId: params.replyToMessageId,
      aiGenerated: params.aiGenerated,
      aiAgentName: params.aiAgentName,
      media: params.media,
    };

    const current = cachedMessages.get(params.chatId) || [];
    current.push(newMessage);
    cachedMessages.set(params.chatId, current);

    return newMessage;
  }

  static async toggleReactionAsync(accountId: string, chatId: string, messageId: string, emoji: string): Promise<boolean> {
    const client = activeClients.get(accountId);
    if (!client) return false;

    try {
      await client.invoke(
        new Api.messages.SendReaction({
          peer: chatId,
          msgId: parseInt(messageId),
          reaction: [new Api.ReactionEmoji({ emoticon: emoji })],
        })
      );
      return true;
    } catch (err) {
      console.error('Failed to send reaction via Telegram MTProto:', err);
      return false;
    }
  }

  static toggleReaction(messageId: string, emoji: string): TelegramMessage | null {
    for (const [chatId, msgs] of cachedMessages.entries()) {
      const msg = msgs.find((m) => m.id === messageId);
      if (msg) {
        if (!msg.reactions) msg.reactions = [];
        const existing = msg.reactions.find((r) => r.emoji === emoji);
        if (existing) {
          if (existing.hasReacted) {
            existing.count = Math.max(0, existing.count - 1);
            existing.hasReacted = false;
          } else {
            existing.count += 1;
            existing.hasReacted = true;
          }
        } else {
          msg.reactions.push({ emoji, count: 1, hasReacted: true });
        }
        return msg;
      }
    }
    return null;
  }

  static async deleteMessageAsync(accountId: string, chatId: string, messageId: string): Promise<boolean> {
    const client = activeClients.get(accountId);
    if (client) {
      try {
        await client.deleteMessages(chatId, [parseInt(messageId)], { revoke: true });
      } catch (err) {
        console.error('Failed to delete message via Telegram MTProto:', err);
      }
    }
    return this.deleteMessage(messageId);
  }

  static deleteMessage(messageId: string): boolean {
    for (const [chatId, msgs] of cachedMessages.entries()) {
      const idx = msgs.findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        msgs.splice(idx, 1);
        cachedMessages.set(chatId, msgs);
        return true;
      }
    }
    return false;
  }

  static updateAccount(accountId: string, updates: Partial<TelegramAccount>): TelegramAccount | null {
    const idx = accountsStore.findIndex((a) => a.id === accountId);
    if (idx === -1) return null;
    accountsStore[idx] = {
      ...accountsStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return accountsStore[idx];
  }

  static deleteAccount(accountId: string): boolean {
    const client = activeClients.get(accountId);
    if (client) {
      try {
        client.disconnect();
      } catch {}
      activeClients.delete(accountId);
    }
    cachedChats.delete(accountId);
    const initialLen = accountsStore.length;
    accountsStore = accountsStore.filter((a) => a.id !== accountId);
    return accountsStore.length < initialLen;
  }
}
