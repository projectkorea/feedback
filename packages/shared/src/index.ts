// Types
export type {
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
  SQLiteConfig,
  MongoDBConfig,
  EmailConfig,
} from './types.js';

// Database
export {
  DatabaseAdapter,
  createDatabaseAdapter,
  getDatabase,
  initializeDatabase,
} from './db/index.js';

// Services
export { EmailService } from './services/emailService.js';
