import { globalJobQueue } from './queue';

export interface TelegramRawUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: 'private' | 'group' | 'supergroup' | 'channel';
      title?: string;
    };
    date: number;
    text?: string;
  };
}

export class TelegramListener {
  private isRunning: boolean = false;
  private pollIntervalMs: number = 2000;
  private intervalRef: NodeJS.Timeout | null = null;

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Worker Listener] Telegram long-polling & MTProto event listener started.');

    this.intervalRef = setInterval(() => {
      // In production, this pulls updates via MTProto getUpdates or Telegram Bot API long-polling
    }, this.pollIntervalMs);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    console.log('[Worker Listener] Telegram listener gracefully stopped.');
  }

  public handleIncomingUpdate(accountId: string, update: TelegramRawUpdate) {
    if (!update.message || !update.message.text) return;

    const msg = update.message;
    const idempotencyKey = `tg_${accountId}_${msg.chat.id}_${msg.message_id}`;

    globalJobQueue.enqueue(
      'incoming_message',
      {
        accountId,
        chatId: String(msg.chat.id),
        senderId: String(msg.from.id),
        senderName: msg.from.username ? `@${msg.from.username}` : msg.from.first_name,
        text: msg.text,
      },
      idempotencyKey
    );
  }
}

export const telegramListener = new TelegramListener();
