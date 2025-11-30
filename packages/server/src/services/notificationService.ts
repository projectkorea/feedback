import { SlackService } from './slackService.js';
import { DiscordService } from './discordService.js';
import { TelegramService } from './telegramService.js';
import { EmailService } from '@feedback-sdk/shared';
import type { FeedbackNotificationData, NotificationAdapter } from '../types.js';

/**
 * 통합 알림 서비스
 * 여러 플랫폼으로 동시에 알림 전송
 */
export class NotificationService {
  adapters: NotificationAdapter[];

  constructor() {
    this.adapters = [];

    // Slack 어댑터
    if (process.env.SLACK_WEBHOOK_URL) {
      const slackService = new SlackService(process.env.SLACK_WEBHOOK_URL);
      if (slackService.webhook) {
        this.adapters.push({
          name: 'Slack',
          service: slackService,
        });
      }
    }

    // Discord 어댑터
    if (process.env.DISCORD_WEBHOOK_URL) {
      const discordService = new DiscordService(process.env.DISCORD_WEBHOOK_URL);
      if (discordService.webhookUrl) {
        this.adapters.push({
          name: 'Discord',
          service: discordService,
        });
      }
    }

    // Telegram 어댑터
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const telegramService = new TelegramService(
        process.env.TELEGRAM_BOT_TOKEN,
        process.env.TELEGRAM_CHAT_ID
      );
      if (telegramService.botToken) {
        this.adapters.push({
          name: 'Telegram',
          service: telegramService,
        });
      }
    }

    // Email 어댑터
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const emailService = new EmailService({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
      });
      if (emailService.transporter) {
        this.adapters.push({
          name: 'Email',
          service: emailService,
        });
      }
    }

    // 활성화된 플랫폼 로그
    if (this.adapters.length > 0) {
      const platforms = this.adapters.map((a) => a.name).join(', ');
      console.log(`✅ Notification platforms enabled: ${platforms}`);
    } else {
      console.log('⚠️  No notification platforms configured');
    }
  }

  /**
   * 모든 설정된 플랫폼으로 피드백 알림 전송
   */
  async sendFeedbackNotification(feedback: FeedbackNotificationData): Promise<void> {
    if (this.adapters.length === 0) {
      console.log('No notification adapters configured, skipping notifications');
      return;
    }

    // 모든 어댑터에 병렬로 전송
    const results = await Promise.allSettled(
      this.adapters.map((adapter) =>
        adapter.service
          .sendFeedbackNotification(feedback)
          .then(() => ({ adapter: adapter.name, success: true, error: undefined }))
          .catch((error: Error) => ({
            adapter: adapter.name,
            success: false,
            error: error.message,
          }))
      )
    );

    // 결과 로깅
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { adapter, success, error } = result.value;
        if (success) {
          console.log(`✅ ${adapter} notification sent`);
        } else {
          console.error(`❌ ${adapter} notification failed:`, error);
        }
      }
    });
  }

  /**
   * 활성화된 플랫폼 목록 반환
   */
  getEnabledPlatforms(): string[] {
    return this.adapters.map((a) => a.name);
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
}
