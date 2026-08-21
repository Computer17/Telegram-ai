export type UserRole = 'user' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'disabled' | 'suspended';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type TelegramConnectionType = 'user_mtproto' | 'bot_token' | 'tdlib';
export type TelegramAccountStatus = 'connected' | 'disconnected' | 'needs_2fa' | 'connecting' | 'error';
export type AIProviderType = 'gemini' | 'openai' | 'deepseek';

export interface TelegramAccount {
  id: string;
  userId: string;
  telegramUserId: string;
  phoneNumberMasked: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  connectionType: TelegramConnectionType;
  status: TelegramAccountStatus;
  autoReplyEnabled: boolean;
  assignedAgentId?: string;
  assignedProvider: AIProviderType;
  assignedModel: string;
  humanTakeoverPausedUntil?: string;
  humanTakeoverDurationMinutes: number;
  proxyEnabled: boolean;
  proxyId?: string;
  dailyAiRepliesUsed: number;
  dailyAiRepliesMax: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  encryptedSession?: string;
}

export type ChatType = 'private' | 'group' | 'supergroup' | 'channel' | 'bot';

export interface TelegramChat {
  id: string;
  accountId: string;
  title: string;
  type: ChatType;
  username?: string;
  avatarUrl?: string;
  isPinned: boolean;
  isMuted: boolean;
  unreadCount: number;
  onlineStatus?: 'online' | 'offline' | 'last_seen_recently';
  lastMessage?: {
    id: string;
    text: string;
    senderName: string;
    isOutgoing: boolean;
    timestamp: string;
    mediaType?: 'photo' | 'video' | 'voice' | 'document' | 'sticker' | 'audio';
  };
  folderId?: string;
  aiAutoReplyPaused?: boolean;
  aiAutoReplyPauseExpiresAt?: string;
  memberCount?: number;
  description?: string;
  capabilities: {
    canSendMessages: boolean;
    canSendMedia: boolean;
    canEditMessages: boolean;
    canDeleteMessages: boolean;
    canPinMessages: boolean;
    canReact: boolean;
    canCall: boolean;
  };
}

export interface TelegramReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export interface TelegramMessage {
  id: string;
  chatId: string;
  accountId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isOutgoing: boolean;
  text: string;
  timestamp: string;
  isEdited?: boolean;
  replyToMessageId?: string;
  replyToMessage?: {
    id: string;
    senderName: string;
    text: string;
  };
  forwardedFrom?: {
    name: string;
    channelTitle?: string;
  };
  media?: {
    type: 'photo' | 'video' | 'voice' | 'document' | 'audio' | 'sticker';
    url: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: string;
    durationSeconds?: number;
    mimeType?: string;
  };
  reactions?: TelegramReaction[];
  isPinned?: boolean;
  aiGenerated?: boolean;
  aiAgentName?: string;
}

export type LanguageMode = 'multilingual' | 'bangla' | 'english' | 'auto';
export type ResponseStyle = 'friendly' | 'professional' | 'concise' | 'detailed' | 'casual' | 'humorous';
export type MemoryMode = 'disabled' | 'conversation' | 'persistent' | 'window_10';

export interface AiAgent {
  id: string;
  userId: string;
  name: string;
  description: string;
  avatar: string;
  systemInstruction: string;
  personality: string;
  languageMode: LanguageMode;
  responseStyle: ResponseStyle;
  maxResponseTokens: number;
  temperature: number;
  provider: AIProviderType;
  model: string;
  memoryMode: MemoryMode;
  replyDelaySeconds: number;
  simulateTyping: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  content: string;
  variables: string[];
  isFavorite: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TriggerType = 'new_message' | 'keyword_match' | 'first_message' | 'schedule' | 'takeover_ended';
export type ActionType = 'ai_reply' | 'predefined_reply' | 'forward_alert' | 'pause_ai' | 'tag_chat';
export type ChatTypeFilter = 'all' | 'private_only' | 'group_only' | 'channel_only';

export interface AutomationRule {
  id: string;
  userId: string;
  telegramAccountId?: string;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  triggerKeywords: string[];
  chatTypeFilter: ChatTypeFilter;
  allowlist: string[];
  blocklist: string[];
  actionType: ActionType;
  actionPayload?: string;
  agentId?: string;
  cooldownSeconds: number;
  maxRunsPerUser: number;
  lastRunAt?: string;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export type AutomationLogStatus = 'success' | 'failed' | 'skipped_takeover' | 'rate_limited' | 'filtered';

export interface AutomationLog {
  id: string;
  userId: string;
  accountId: string;
  ruleId?: string;
  chatId: string;
  senderName: string;
  incomingMessage: string;
  aiResponse?: string;
  provider?: string;
  model?: string;
  tokensUsed?: number;
  status: AutomationLogStatus;
  durationMs: number;
  errorMessage?: string;
  createdAt: string;
}

export interface ProxyConfig {
  id: string;
  userId: string;
  name: string;
  protocol: 'socks5' | 'mtproto' | 'http';
  host: string;
  port: number;
  username?: string;
  password?: string;
  secret?: string;
  status: 'active' | 'offline' | 'untested';
  pingMs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSetting {
  id: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  maxAccountsPerUser: number;
  maxDailyAiRepliesPerUser: number;
  enabledProviders: {
    gemini: boolean;
    openai: boolean;
    deepseek: boolean;
  };
  geminiDefaultModel: string;
  workerHeartbeatMinutes: number;
  updatedAt: string;
}

export interface FeatureFlags {
  enableAiFeatures: boolean;
  enableAutoReply: boolean;
  enableMultiAccount: boolean;
  enableAutomations: boolean;
  enableVoicePlayer: boolean;
  enableProxyRouting: boolean;
  enableSimulatedHarness: boolean;
}

export interface AIProviderConfig {
  provider: AIProviderType;
  name: string;
  status: 'configured' | 'missing_key' | 'disabled';
  availableModels: string[];
  defaultModel: string;
  hasCustomKey: boolean;
}
