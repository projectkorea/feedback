import fetch from 'node-fetch';

const CATEGORY_EMOJIS = {
  bug: '🐛',
  feature: '✨',
  improvement: '🚀'
};

const CATEGORY_COLORS = {
  bug: 15158332,      // Red
  feature: 3447003,   // Blue
  improvement: 10181046  // Purple
};

export class DiscordService {
  constructor(webhookUrl) {
    if (!webhookUrl || webhookUrl === 'https://discord.com/api/webhooks/YOUR/WEBHOOK/URL') {
      this.webhookUrl = null;
      console.warn('⚠️  Discord webhook URL not configured. Discord notifications are disabled.');
    } else {
      this.webhookUrl = webhookUrl;
    }
  }

  /**
   * 피드백 데이터를 Discord 메시지로 전송
   */
  async sendFeedbackNotification(feedback) {
    if (!this.webhookUrl) {
      console.log('Discord webhook not configured, skipping notification');
      return;
    }

    try {
      const categoryEmoji = CATEGORY_EMOJIS[feedback.category] || '📝';
      const ratingStars = feedback.rating ? '⭐'.repeat(feedback.rating) : '평점 없음';
      const color = CATEGORY_COLORS[feedback.category] || 5793266;

      const embed = {
        title: `${categoryEmoji} 새로운 피드백 도착!`,
        color: color,
        fields: [
          {
            name: '카테고리',
            value: this.formatCategory(feedback.category),
            inline: true
          },
          {
            name: '평점',
            value: ratingStars,
            inline: true
          },
          {
            name: '메시지',
            value: feedback.message || '_메시지 없음_',
            inline: false
          },
          {
            name: '이메일',
            value: feedback.user_email || '_제공되지 않음_',
            inline: true
          },
          {
            name: '페이지',
            value: feedback.page_url || '_알 수 없음_',
            inline: true
          }
        ],
        footer: {
          text: `플랫폼: ${feedback.platform || 'N/A'} | ${new Date(feedback.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`
        },
        timestamp: feedback.timestamp
      };

      const payload = {
        username: 'Feedback Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/2593/2593635.png',
        embeds: [embed]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Discord notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Discord notification:', error.message);
      // Discord 전송 실패해도 피드백 저장은 성공으로 처리
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
