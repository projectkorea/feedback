import nodemailer from 'nodemailer';

const CATEGORY_EMOJIS = {
  bug: '🐛',
  feature: '✨',
  improvement: '🚀'
};

/**
 * Email 알림 서비스
 * Nodemailer를 사용한 SMTP 이메일 전송
 */
export class EmailService {
  constructor(config) {
    if (!config || !config.host || !config.user || !config.pass) {
      this.transporter = null;
      console.warn('⚠️  Email configuration incomplete. Email notifications are disabled.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port || 587,
        secure: config.secure || false,  // true for 465, false for other ports
        auth: {
          user: config.user,
          pass: config.pass
        }
      });

      this.from = config.from || config.user;
      this.to = config.to || config.user;

      console.log('✅ Email service initialized:', config.host);
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = null;
    }
  }

  /**
   * 피드백 데이터를 이메일로 전송
   */
  async sendFeedbackNotification(feedback) {
    if (!this.transporter) {
      console.log('Email not configured, skipping notification');
      return;
    }

    try {
      const categoryEmoji = CATEGORY_EMOJIS[feedback.category] || '📝';
      const ratingStars = feedback.rating ? '⭐'.repeat(feedback.rating) : '평점 없음';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #4b5563;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .field-value {
              background: #f3f4f6;
              padding: 12px;
              border-radius: 6px;
              font-size: 15px;
            }
            .message-box {
              background: #f9fafb;
              border-left: 4px solid #4f46e5;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
              font-size: 13px;
              color: #6b7280;
            }
            .meta-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${categoryEmoji} 새로운 피드백 도착!</h1>
          </div>

          <div class="content">
            <div class="field">
              <div class="field-label">카테고리</div>
              <div class="field-value">${this.formatCategory(feedback.category)}</div>
            </div>

            <div class="field">
              <div class="field-label">평점</div>
              <div class="field-value">${ratingStars}</div>
            </div>

            <div class="message-box">
              <div class="field-label">메시지</div>
              <div style="margin-top: 8px;">
                ${feedback.message ? feedback.message.replace(/\n/g, '<br>') : '<em style="color: #9ca3af;">메시지 없음</em>'}
              </div>
            </div>

            <div class="meta-info">
              <div class="field">
                <div class="field-label">이메일</div>
                <div class="field-value">${feedback.user_email || '<em>제공되지 않음</em>'}</div>
              </div>

              <div class="field">
                <div class="field-label">플랫폼</div>
                <div class="field-value">${feedback.platform || 'N/A'}</div>
              </div>
            </div>

            ${feedback.page_url ? `
            <div class="field" style="margin-top: 15px;">
              <div class="field-label">페이지 URL</div>
              <div class="field-value">
                <a href="${feedback.page_url}" style="color: #4f46e5; text-decoration: none;">
                  ${feedback.page_url}
                </a>
              </div>
            </div>
            ` : ''}
          </div>

          <div class="footer">
            <strong>🕐 시간:</strong> ${new Date(feedback.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
            <br>
            <strong>📋 피드백 ID:</strong> ${feedback.id || 'N/A'}
          </div>
        </body>
        </html>
      `;

      const info = await this.transporter.sendMail({
        from: this.from,
        to: this.to,
        subject: `${categoryEmoji} 새로운 피드백: ${this.formatCategory(feedback.category)}`,
        html,
        text: this.generatePlainText(feedback)  // 플레인 텍스트 버전
      });

      console.log('✅ Email notification sent successfully:', info.messageId);
    } catch (error) {
      console.error('❌ Failed to send email notification:', error.message);
    }
  }

  /**
   * 플레인 텍스트 이메일 생성 (HTML 미지원 클라이언트용)
   */
  generatePlainText(feedback) {
    const categoryEmoji = CATEGORY_EMOJIS[feedback.category] || '📝';
    const ratingStars = feedback.rating ? '⭐'.repeat(feedback.rating) : '평점 없음';

    return `
${categoryEmoji} 새로운 피드백 도착!

카테고리: ${this.formatCategory(feedback.category)}
평점: ${ratingStars}

메시지:
${feedback.message || '메시지 없음'}

---
이메일: ${feedback.user_email || '제공되지 않음'}
페이지: ${feedback.page_url || '알 수 없음'}
플랫폼: ${feedback.platform || 'N/A'}
시간: ${new Date(feedback.timestamp).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
피드백 ID: ${feedback.id || 'N/A'}
    `.trim();
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
   * 이메일 설정 테스트
   */
  async testConnection() {
    if (!this.transporter) {
      console.log('❌ Email not configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Email connection test failed:', error.message);
      return false;
    }
  }
}

// Singleton instance
let emailService = null;

/**
 * Email 서비스 싱글톤 인스턴스 가져오기
 */
export function getEmailService() {
  if (!emailService) {
    emailService = new EmailService({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO
    });
  }
  return emailService;
}
