import { APIClient, validateConfig, type FeedbackConfig, type FeedbackSubmission, type FeedbackData } from '@feedback-sdk/core';
import { FloatingWidget } from './widgets/FloatingWidget.js';

export class FeedbackSDK {
  private config: FeedbackConfig;
  private client: APIClient;
  private container: HTMLDivElement | null = null;
  private floatingWidget: FloatingWidget | null = null;

  constructor(config: FeedbackConfig) {
    validateConfig(config);
    this.config = config;
    this.client = new APIClient(config);

    this._createContainer();
    this._autoMount();
  }

  private _createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'feedback-sdk-root';
    document.body.appendChild(this.container);
  }

  private _autoMount(): void {
    if (!this.container) return;
    this.floatingWidget = new FloatingWidget(this.client, this.config, this.container);
    this.floatingWidget.render();
  }

  destroy(): void {
    this.floatingWidget?.destroy();
    if (this.container) {
      document.body.removeChild(this.container);
      this.container = null;
    }
  }

  async submitFeedback(data: FeedbackSubmission): Promise<FeedbackData> {
    return this.client.submitFeedback(data);
  }

  showFloating(): void {
    this.floatingWidget?.show();
  }

  hideFloating(): void {
    this.floatingWidget?.hide();
  }
}
