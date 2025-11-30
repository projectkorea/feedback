export interface Project {
  id: string;
  name: string;
  publicKey: string;
  isActive: boolean;
  createdAt: number;
}

export interface ProjectCreateData {
  id: string;
  name: string;
  publicKey: string;
  isActive?: boolean;
  createdAt?: number;
}

export interface Feedback {
  id: string;
  projectId: string;
  type: 'floating' | 'settings';
  category: 'bug' | 'feature' | 'improvement';
  rating?: number;
  message: string;
  userEmail?: string;
  pageUrl?: string;
  userAgent?: string;
  language?: string;
  platform?: string;
  timestamp: string;
  createdAt: number;
}

export interface FeedbackCreateData {
  id: string;
  projectId: string;
  type: 'floating' | 'settings';
  category: 'bug' | 'feature' | 'improvement';
  rating?: number;
  message: string;
  userEmail?: string;
  pageUrl?: string;
  userAgent?: string;
  language?: string;
  platform?: string;
  timestamp: string;
  createdAt?: number;
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
  updatedAt: number;
}

export interface SettingsUpdateData {
  notifications?: {
    enabled?: boolean;
    platforms?: {
      slack?: boolean;
      discord?: boolean;
      telegram?: boolean;
      email?: boolean;
    };
  };
  customization?: {
    primaryColor?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    language?: string;
  };
}

export interface FeedbackListFilters {
  page?: number;
  limit?: number;
  category?: string;
  minRating?: number;
}

export interface FeedbackListResult {
  items: Feedback[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FeedbackStats {
  category: string;
  count: number;
  avg_rating: number | null;
}

export interface DatabaseConfig {
  type?: 'sqlite' | 'mongodb';
  path?: string;
  uri?: string;
  dbName?: string;
}

export interface SQLiteConfig {
  path?: string;
}

export interface MongoDBConfig {
  uri?: string;
  dbName?: string;
}

export interface EmailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
  to?: string;
}
