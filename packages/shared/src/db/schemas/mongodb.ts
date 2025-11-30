import mongoose, { type Connection, type Model, type Document } from 'mongoose';

interface ProjectDocument extends Document {
  _id: string;
  name: string;
  publicKey: string;
  isActive: boolean;
  createdAt: number;
}

interface FeedbackDocument extends Document {
  _id: string;
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

interface SettingsDocument extends Document {
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
    position: string;
    language: string;
  };
  updatedAt: number;
}

export interface Models {
  Project: Model<ProjectDocument>;
  Feedback: Model<FeedbackDocument>;
  Settings: Model<SettingsDocument>;
}

const ProjectSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    publicKey: { type: String, required: true, unique: true, index: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Number, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const FeedbackSchema = new mongoose.Schema(
  {
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
    createdAt: { type: Number, required: true, index: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const SettingsSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    notifications: {
      enabled: { type: Boolean, default: true },
      platforms: {
        slack: { type: Boolean, default: false },
        discord: { type: Boolean, default: false },
        telegram: { type: Boolean, default: false },
        email: { type: Boolean, default: false },
      },
    },
    customization: {
      primaryColor: { type: String, default: '#4F46E5' },
      position: {
        type: String,
        enum: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
        default: 'bottom-right',
      },
      language: { type: String, default: 'ko' },
    },
    updatedAt: { type: Number, required: true },
  },
  {
    versionKey: false,
  }
);

export function getModels(connection: Connection): Models {
  const models: Models = {} as Models;

  if (connection.models.Project) {
    models.Project = connection.models.Project as Model<ProjectDocument>;
  } else {
    models.Project = connection.model<ProjectDocument>('Project', ProjectSchema);
  }

  if (connection.models.Feedback) {
    models.Feedback = connection.models.Feedback as Model<FeedbackDocument>;
  } else {
    models.Feedback = connection.model<FeedbackDocument>('Feedback', FeedbackSchema);
  }

  if (connection.models.Settings) {
    models.Settings = connection.models.Settings as Model<SettingsDocument>;
  } else {
    models.Settings = connection.model<SettingsDocument>('Settings', SettingsSchema);
  }

  return models;
}
