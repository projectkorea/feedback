import { IncomingWebhook } from '@slack/webhook';

const CATEGORY_EMOJIS = {
  bug: '🐛',
  feature: '✨',
  improvement: '🚀'
};

export class SlackService {
  constructor(webhookUrl) {
    if (!webhookUrl || webhookUrl === 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL') {
      this.webhook = null;
      console.warn('⚠️  Slack webhook URL not configured. Slack notifications are disabled.');
    } else {
      this.webhook = new IncomingWebhook(webhookUrl);
    }
  }

  /**
   * 피드백 데이터를 슬랙 메시지로 전송
   */
  async sendFeedbackNotification(feedback) {
    if (!this.webhook) {
      console.log('Slack webhook not configured, skipping notification');
      return;
    }

    try {
      const categoryEmoji = CATEGORY_EMOJIS[feedback.category] || '📝';
      const ratingStars = feedback.rating ? '⭐'.repeat(feedback.rating) : '평점 없음';

      const message = {
        text: `${categoryEmoji} 새로운 피드백 도착!`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${categoryEmoji} 새로운 피드백 도착!`,
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*카테고리:*\n${this.formatCategory(feedback.category)}`
              },
              {
                type: 'mrkdwn',
                text: `*평점:*\n${ratingStars}`
              }
            ]
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*메시지:*\n${feedback.message || '_메시지 없음_'}`
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*이메일:*\n${feedback.user_email || '_제공되지 않음_'}`
              },
              {
                type: 'mrkdwn',
                text: `*페이지:*\n${feedback.page_url || '_알 수 없음_'}`
              }
            ]
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🕐 ${new Date(feedback.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} | 플랫폼: ${feedback.platform || 'N/A'}`
              }
            ]
          },
          {
            type: 'divider'
          }
        ]
      };

      await this.webhook.send(message);
      console.log('✅ Slack notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
      // 슬랙 전송 실패해도 피드백 저장은 성공으로 처리
    }
  }

  formatCategory(category) {
    const categoryMap = {
      bug: '버그 신고',
      feature: '기능 요청',
      improvement: '개선 제안'
    };
    return categoryMap[category] || category;
  }
}

// Singleton instance
let slackService = null;

export function getSlackService() {
  if (!slackService) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    slackService = new SlackService(webhookUrl);
  }
  return slackService;
}
