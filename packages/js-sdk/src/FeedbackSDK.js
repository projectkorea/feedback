import { APIClient, validateConfig } from '@feedback-sdk/core';
import { FloatingWidget } from './widgets/FloatingWidget.js';

export class FeedbackSDK {
  constructor(config) {
    validateConfig(config);
    this.config = config;
    this.client = new APIClient(config);
    this.container = null;
    this.floatingWidget = null;

    // 자동으로 Portal 컨테이너 생성 및 마운트
    this._createContainer();
    this._autoMount();
  }

  _createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'feedback-sdk-root';
    document.body.appendChild(this.container);
  }

  _autoMount() {
    this.floatingWidget = new FloatingWidget(this.client, this.config, this.container);
    this.floatingWidget.render();
  }

  destroy() {
    this.floatingWidget?.destroy();
    if (this.container) {
      document.body.removeChild(this.container);
      this.container = null;
    }
  }

  async submitFeedback(data) {
    return this.client.submitFeedback(data);
  }

  showFloating() {
    this.floatingWidget?.show();
  }

  hideFloating() {
    this.floatingWidget?.hide();
  }
}
