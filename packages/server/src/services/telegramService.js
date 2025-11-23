import fetch from 'node-fetch';

const CATEGORY_EMOJIS = {
  bug: '🐛',
  feature: '✨',
  improvement: '🚀'
};

export class TelegramService {
  constructor(botToken, chatId) {
    if (!botToken || botToken === 'YOUR_BOT_TOKEN' || !chatId || chatId === 'YOUR_CHAT_ID') {
      this.botToken = null;
      this.chatId = null;
      console.warn('⚠️  Telegram bot token or chat ID not configured. Telegram notifications are disabled.');
    } else {
      this.botToken = botToken;
      this.chatId = chatId;
      this.apiUrl = `https://api.telegram.org/bot${botToken}`;
    }
  }

  /**
   * 피드백 데이터를 Telegram 메시지로 전송
   */
  async sendFeedbackNotification(feedback) {
    if (!this.botToken || !this.chatId) {
      console.log('Telegram not configured, skipping notification');
      return;
    }

    try {
      const categoryEmoji = CATEGORY_EMOJIS[feedback.category] || '📝';
      const ratingStars = feedback.rating ? '⭐'.repeat(feedback.rating) : '평점 없음';

      // Telegram uses MarkdownV2 format
      const message = this.escapeMarkdown(`
${categoryEmoji} *새로운 피드백 도착!*

*카테고리:* ${this.formatCategory(feedback.category)}
*평점:* ${ratingStars}

*메시지:*
${feedback.message || '_메시지 없음_'}

*이메일:* ${feedback.user_email || '_제공되지 않음_'}
*페이지:* ${feedback.page_url || '_알 수 없음_'}

📅 ${new Date(feedback.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
💻 플랫폼: ${feedback.platform || 'N/A'}
      `);

      const payload = {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'MarkdownV2'
      };

      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
      }

      console.log('✅ Telegram notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error.message);
      // Telegram 전송 실패해도 피드백 저장은 성공으로 처리
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

  /**
   * Telegram MarkdownV2 특수문자 이스케이프
   */
  escapeMarkdown(text) {
    // MarkdownV2에서 이스케이프가 필요한 문자들
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    let escaped = text;

    specialChars.forEach(char => {
      escaped = escaped.split(char).join(`\\${char}`);
    });

    return escaped;
  }
}
