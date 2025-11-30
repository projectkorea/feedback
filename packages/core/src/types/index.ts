export interface FeedbackConfig {
  publicKey: string;
  projectId: string;
  apiUrl: string;
}

export interface FeedbackSubmission {
  type: 'floating' | 'settings';
  category?: 'bug' | 'feature' | 'improvement';
  rating?: number;
  message?: string;
  userEmail?: string;
  pageUrl?: string;
  browserInfo?: Record<string, unknown>;
  customFields?: Record<string, unknown>;
}

export interface FeedbackData extends FeedbackSubmission {
  id: string;
  timestamp: string;
}

export interface Settings {
  projectId: string;
  notifications: {
    enabled: boolean;
    platforms: {
      slack: boolean;
      discord: boolean;
      telegram: boolean;
      email: boolean;
    };
  };
  customization: {
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    language: string;
  };
}

export interface Project {
  id: string;
  name: string;
  publicKey: string;
  isActive: boolean;
  createdAt: number;
}

export const FEEDBACK_TYPES = {
  FLOATING: 'floating',
  SETTINGS: 'settings',
} as const;

export const FEEDBACK_CATEGORIES = {
  BUG: 'bug',
  FEATURE: 'feature',
  IMPROVEMENT: 'improvement',
} as const;

export const API_ENDPOINTS = {
  SUBMIT_FEEDBACK: '/api/feedback',
  GET_SETTINGS: '/api/settings',
  UPDATE_SETTINGS: '/api/settings',
  GET_PROJECT: '/api/projects',
} as const;
