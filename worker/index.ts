import { globalJobQueue, TelegramJob } from './queue';
import { telegramListener } from './telegramListener';
import { AutoReplyEngine } from '../server/services/autoReplyEngine';

class WorkerService {
  private isShuttingDown = false;
  private workerId = 'worker-' + Math.random().toString(36).substring(2, 7);

  public async start() {
    console.log(`[Worker] AI Telegram Platform Worker daemon initialized (${this.workerId})`);
    telegramListener.start();

    // Event processing loop
    this.processQueueLoop();

    // Setup Process Handlers for graceful shutdown (Railway, Render, Fly.io, Cloud Run)
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }

  private async processQueueLoop() {
    while (!this.isShuttingDown) {
      const job = globalJobQueue.dequeue();
      if (job) {
        await this.handleJob(job);
      } else {
        // Sleep 300ms if queue is empty
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  private async handleJob(job: TelegramJob) {
    job.status = 'processing';
    job.attempts += 1;

    try {
      if (job.type === 'incoming_message') {
        await AutoReplyEngine.processIncomingTelegramMessage({
          accountId: job.payload.accountId,
          chatId: job.payload.chatId,
          senderId: job.payload.senderId,
          senderName: job.payload.senderName,
          messageText: job.payload.text,
          isFirstMessage: job.payload.isFirstMessage,
        });
      }
      job.status = 'completed';
    } catch (err: any) {
      console.error(`[Worker] Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}):`, err.message);
      if (job.attempts < job.maxAttempts) {
        job.status = 'pending';
        // Exponential backoff retry
        setTimeout(() => {
          globalJobQueue.enqueue(job.type, job.payload, job.idempotencyKey + `_retry_${job.attempts}`);
        }, job.attempts * 2000);
      } else {
        job.status = 'failed';
      }
    }
  }

  private shutdown(signal: string) {
    console.log(`[Worker] Received ${signal}. Gracefully shutting down worker ${this.workerId}...`);
    this.isShuttingDown = true;
    telegramListener.stop();
    setTimeout(() => {
      console.log('[Worker] Worker terminated cleanly.');
      process.exit(0);
    }, 1500);
  }
}

export const worker = new WorkerService();

if (process.env.RUN_STANDALONE_WORKER === 'true') {
  worker.start();
}
