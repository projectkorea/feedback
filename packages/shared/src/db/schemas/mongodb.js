import mongoose from 'mongoose';

/**
 * Project Schema
 */
const ProjectSchema = new mongoose.Schema({
  _id: { type: String, required: true },  // 커스텀 ID (UUID)
  name: { type: String, required: true },
  publicKey: { type: String, required: true, unique: true, index: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Number, required: true }
}, {
  _id: false,  // 자동 ObjectId 생성 비활성화
  versionKey: false
});

/**
 * Feedback Schema
 */
const FeedbackSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  projectId: { type: String, required: true, index: true },
  type: { type: String, enum: ['floating', 'settings'], required: true },
  category: { type: String, enum: ['bug', 'feature', 'improvement'], required: true },
  rating: { type: Number, min: 1, max: 5 },
  message: { type: String, required: true },
  userEmail: String,
  pageUrl: String,
  userAgent: String,
  language: String,
  platform: String,
  timestamp: { type: String, required: true },
  createdAt: { type: Number, required: true, index: true }
}, {
  _id: false,
  versionKey: false
});

/**
 * Settings Schema
 */
const SettingsSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true, index: true },
  notifications: {
    enabled: { type: Boolean, default: true },
    platforms: {
      slack: { type: Boolean, default: false },
      discord: { type: Boolean, default: false },
      telegram: { type: Boolean, default: false },
      email: { type: Boolean, default: false }
    }
  },
  customization: {
    primaryColor: { type: String, default: '#4F46E5' },
    position: { type: String, enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'], default: 'bottom-right' },
    language: { type: String, default: 'ko' }
  },
  updatedAt: { type: Number, required: true }
}, {
  versionKey: false
});

// 모델 생성 함수 (중복 생성 방지)
export function getModels(connection) {
  const models = {};

  // Project 모델
  if (connection.models.Project) {
    models.Project = connection.models.Project;
  } else {
    models.Project = connection.model('Project', ProjectSchema);
  }

  // Feedback 모델
  if (connection.models.Feedback) {
    models.Feedback = connection.models.Feedback;
  } else {
    models.Feedback = connection.model('Feedback', FeedbackSchema);
  }

  // Settings 모델
  if (connection.models.Settings) {
    models.Settings = connection.models.Settings;
  } else {
    models.Settings = connection.model('Settings', SettingsSchema);
  }

  return models;
}
