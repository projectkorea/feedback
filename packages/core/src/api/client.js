import { API_ENDPOINTS } from '../types/index.js';

export class APIClient {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.publicKey = config.publicKey;
    this.projectId = config.projectId;
  }

  async submitFeedback(data) {
    const feedbackData = {
      ...data,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.SUBMIT_FEEDBACK}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey,
        'X-Project-Id': this.projectId
      },
      body: JSON.stringify(feedbackData)
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    return response.json();
  }

  async getSettings() {
    const response = await fetch(
      `${this.apiUrl}${API_ENDPOINTS.GET_SETTINGS}?projectId=${this.projectId}`,
      {
        headers: {
          'X-Public-Key': this.publicKey,
          'X-Project-Id': this.projectId
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get settings: ${response.statusText}`);
    }

    return response.json();
  }

  async updateSettings(settings) {
    const response = await fetch(`${this.apiUrl}${API_ENDPOINTS.UPDATE_SETTINGS}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Public-Key': this.publicKey,
        'X-Project-Id': this.projectId
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      throw new Error(`Failed to update settings: ${response.statusText}`);
    }

    return response.json();
  }

  async getProject() {
    const response = await fetch(
      `${this.apiUrl}${API_ENDPOINTS.GET_PROJECT}/${this.projectId}`,
      {
        headers: {
          'X-Public-Key': this.publicKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get project: ${response.statusText}`);
    }

    return response.json();
  }
}
