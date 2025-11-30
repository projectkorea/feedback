import { IncomingWebhook } from '@slack/webhook';
import type { FeedbackNotificationData, FeedbackCategory } from '../types.js';

const CATEGORY_EMOJIS: Record<FeedbackCategory, string> = {
  bug: '🐛',
  feature: '✨',
  improvement: '🚀',
};

export class SlackService {
  webhook: IncomingWebhook | null;

  constructor(webhookUrl: string | undefined) {
    if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/services/')) {
      this.webhook = null;
      console.warn('⚠️  Slack webhook URL not configured. Slack notifications are disabled.');
    } else {
      this.webhook = new IncomingWebhook(webhookUrl);
    }
  }

  /**
   * 피드백 데이터를 슬랙 메시지로 전송
   */
  async sendFeedbackNotification(feedback: FeedbackNotificationData): Promise<void> {
    if (!this.webhook) {
      console.log('Slack webhook not configured, skipping notification');
      return;
    }

    try {
      const categoryEmoji =
        CATEGORY_EMOJIS[feedback.category as FeedbackCategory] || '📝';
      const ratingStars = feedback.rating ? '⭐'.repeat(feedback.rating) : '평점 없음';

      const message = {
        text: `${categoryEmoji} 새로운 피드백 도착!`,
        blocks: [
          {
            type: 'header' as const,
            text: {
              type: 'plain_text' as const,
              text: `${categoryEmoji} 새로운 피드백 도착!`,
              emoji: true,
            },
          },
          {
            type: 'section' as const,
            fields: [
              {
                type: 'mrkdwn' as const,
                text: `*카테고리:*\n${this.formatCategory(feedback.category)}`,
              },
              {
                type: 'mrkdwn' as const,
                text: `*평점:*\n${ratingStars}`,
              },
            ],
          },
          {
            type: 'section' as const,
            text: {
              type: 'mrkdwn' as const,
              text: `*메시지:*\n${feedback.message || '_메시지 없음_'}`,
            },
          },
          {
            type: 'section' as const,
            fields: [
              {
                type: 'mrkdwn' as const,
                text: `*이메일:*\n${feedback.user_email || '_제공되지 않음_'}`,
              },
              {
                type: 'mrkdwn' as const,
                text: `*페이지:*\n${feedback.page_url || '_알 수 없음_'}`,
              },
            ],
          },
          {
            type: 'context' as const,
            elements: [
              {
                type: 'mrkdwn' as const,
                text: `🕐 ${new Date(feedback.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} | 플랫폼: ${feedback.platform || 'N/A'}`,
              },
            ],
          },
          {
            type: 'divider' as const,
          },
        ],
      };

      await this.webhook.send(message);
      console.log('✅ Slack notification sent successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to send Slack notification:', message);
      // 슬랙 전송 실패해도 피드백 저장은 성공으로 처리
    }
  }

  formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      bug: '버그 신고',
      feature: '기능 요청',
      improvement: '개선 제안',
    };
    return categoryMap[category] || category;
  }
}

// Singleton instance
let slackService: SlackService | null = null;

export function getSlackService(): SlackService {
  if (!slackService) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    slackService = new SlackService(webhookUrl);
  }
  return slackService;
}
