import { API_ENDPOINTS } from '../types/index.js';
import type {
  FeedbackConfig,
  FeedbackSubmission,
  FeedbackData,
  Settings,
  Project,
} from '../types/index.js';

export class APIClient {
  private apiUrl: string;
  private publicKey: string;
  private projectId: string;

  constructor(config: FeedbackConfig) {
    this.apiUrl = config.apiUrl;
    this.publicKey = config.publicKey;
    this.projectId = config.projectId;
  }

  async submitFeedback(data: FeedbackSubmission): Promise<FeedbackData> {
    const feedbackData: FeedbackData = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.SUBMIT_FEEDBACK}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey,
        'X-Project-Id': this.projectId,
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    return response.json() as Promise<FeedbackData>;
  }

  async getSettings(): Promise<Settings> {
    const response = await fetch(
      `${this.apiUrl}${API_ENDPOINTS.GET_SETTINGS}?projectId=${this.projectId}`,
      {
        headers: {
          'X-Public-Key': this.publicKey,
          'X-Project-Id': this.projectId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get settings: ${response.statusText}`);
    }

    return response.json() as Promise<Settings>;
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.UPDATE_SETTINGS}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey,
        'X-Project-Id': this.projectId,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update settings: ${response.statusText}`);
    }

    return response.json() as Promise<Settings>;
  }

  async getProject(): Promise<Project> {
    const response = await fetch(
      `${this.apiUrl}${API_ENDPOINTS.GET_PROJECT}/${this.projectId}`,
      {
        headers: {
          'X-Public-Key': this.publicKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get project: ${response.statusText}`);
    }

    return response.json() as Promise<Project>;
  }
}
