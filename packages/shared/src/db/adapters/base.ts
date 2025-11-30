import type {
  Project,
  ProjectCreateData,
  Feedback,
  FeedbackCreateData,
  Settings,
  SettingsUpdateData,
  FeedbackListFilters,
  FeedbackListResult,
  FeedbackStats,
  DatabaseConfig,
} from '../../types.js';

export abstract class DatabaseAdapter {
  protected config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  // ==================== Lifecycle ====================

  abstract connect(): Promise<this>;
  abstract disconnect(): Promise<void>;

  // ==================== Projects ====================

  abstract createProject(data: ProjectCreateData): Promise<Project>;
  abstract getProjectByKey(projectId: string, publicKey: string): Promise<Project | null>;
  abstract getAllProjects(): Promise<Project[]>;

  // ==================== Feedback ====================

  abstract createFeedback(data: FeedbackCreateData): Promise<{ success: boolean; id: string }>;
  abstract getFeedbackList(projectId: string, filters?: FeedbackListFilters): Promise<FeedbackListResult>;
  abstract getFeedbackStats(projectId: string): Promise<FeedbackStats[]>;

  // ==================== Settings ====================

  abstract getSettings(projectId: string): Promise<Settings | null>;
  abstract updateSettings(projectId: string, data: SettingsUpdateData): Promise<Settings | null>;
}

export type { Project, ProjectCreateData, Feedback, FeedbackCreateData, Settings, SettingsUpdateData, FeedbackListFilters, FeedbackListResult, FeedbackStats };
