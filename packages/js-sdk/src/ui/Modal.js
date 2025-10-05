import { FEEDBACK_TYPES, validateFeedback } from '@feedback-sdk/core';
import { Form } from './Form.js';

export class Modal {
  constructor(client, config, parentContainer) {
    this.client = client;
    this.config = config;
    this.parentContainer = parentContainer;
    this.container = null;
    this.form = null;
  }

  render() {
    this.container = document.createElement('div');
    this.container.id = 'feedback-modal';
    this.container.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 10000;
      align-items: center;
      justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      font-size: 32px;
      cursor: pointer;
      color: #666;
    `;
    closeBtn.addEventListener('click', () => this.close());

    this.form = new Form(async (data) => {
      try {
        await this.client.submitFeedback({
          ...data,
          type: FEEDBACK_TYPES.FLOATING,
          pageUrl: window.location.href,
          browserInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform
          }
        });
        this.showSuccess();
      } catch (error) {
        this.showError(error.message);
      }
    });

    content.appendChild(closeBtn);
    content.appendChild(this.form.render());
    this.container.appendChild(content);
    this.parentContainer.appendChild(this.container);

    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) this.close();
    });
  }

  open() {
    this.container.style.display = 'flex';
  }

  close() {
    this.container.style.display = 'none';
    this.form.reset();
  }

  showSuccess() {
    this.showToast('피드백이 전송되었습니다! 🎉', 'success');
    this.close();
  }

  showError(message) {
    this.showToast(`전송 중 오류가 발생했습니다: ${message}`, 'error');
  }

  showToast(message, type) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      z-index: 1000000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  destroy() {
    this.container?.remove();
  }
}
