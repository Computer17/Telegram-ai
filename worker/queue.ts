export interface TelegramJob {
  id: string;
  idempotencyKey: string;
  type: 'incoming_message' | 'send_reply' | 'scheduled_trigger' | 'status_sync';
  payload: {
    accountId: string;
    chatId: string;
    senderId: string;
    senderName: string;
    text: string;
    isFirstMessage?: boolean;
  };
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class JobQueue {
  private queue: TelegramJob[] = [];
  private processedKeys: Set<string> = new Set();
  private maxHistoryKeys = 10000;

  public enqueue(
    type: TelegramJob['type'],
    payload: TelegramJob['payload'],
    idempotencyKey: string
  ): TelegramJob | null {
    // Idempotency check: avoid duplicate message replies
    if (this.processedKeys.has(idempotencyKey)) {
      console.log(`[Queue] Duplicate job skipped by idempotency key: ${idempotencyKey}`);
      return null;
    }

    const job: TelegramJob = {
      id: 'job_' + Math.random().toString(36).substring(2, 10),
      idempotencyKey,
      type,
      payload,
      attempts: 0,
      maxAttempts: 3,
      createdAt: Date.now(),
      status: 'pending',
    };

    this.queue.push(job);
    this.processedKeys.add(idempotencyKey);

    // Limit memory usage of processed keys
    if (this.processedKeys.size > this.maxHistoryKeys) {
      const arr = Array.from(this.processedKeys);
      this.processedKeys = new Set(arr.slice(-5000));
    }

    return job;
  }

  public dequeue(): TelegramJob | undefined {
    return this.queue.shift();
  }

  public getPendingCount(): number {
    return this.queue.length;
  }
}

export const globalJobQueue = new JobQueue();
