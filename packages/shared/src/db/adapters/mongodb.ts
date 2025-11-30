import mongoose, { type Connection } from 'mongoose';
import { DatabaseAdapter } from './base.js';
import { getModels, type Models } from '../schemas/mongodb.js';
import type {
  Project,
  ProjectCreateData,
  Settings,
  SettingsUpdateData,
  FeedbackCreateData,
  FeedbackListFilters,
  FeedbackListResult,
  FeedbackStats,
  MongoDBConfig,
} from '../../types.js';

export class MongoDBAdapter extends DatabaseAdapter {
  private connection: Connection | null = null;
  private models: Models | null = null;

  constructor(config: MongoDBConfig) {
    super(config);
  }

  // ==================== Lifecycle ====================

  async connect(): Promise<this> {
    const uri = this.config.uri || process.env.MONGODB_URI;
    const dbName = this.config.dbName || process.env.MONGODB_DB_NAME || 'feedback';

    if (!uri) {
      throw new Error('MongoDB URI is required');
    }

    if (this.connection && this.connection.readyState === 1) {
      console.log('♻️  Reusing existing MongoDB connection');
      return this;
    }

    try {
      this.connection = await mongoose.createConnection(uri, {
        dbName,
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.models = getModels(this.connection);

      console.log('✅ MongoDB connected:', dbName);
      return this;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ MongoDB connection failed:', message);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.models = null;
      console.log('✅ MongoDB disconnected');
    }
  }

  // ==================== Projects ====================

  async createProject(data: ProjectCreateData): Promise<Project> {
    const project = new this.models!.Project({
      _id: data.id,
      name: data.name,
      publicKey: data.publicKey,
      isActive: data.isActive !== false,
      createdAt: data.createdAt || Date.now(),
    });

    await project.save();

    return {
      id: project._id as string,
      name: project.name,
      publicKey: project.publicKey,
      isActive: project.isActive,
      createdAt: project.createdAt,
    };
  }

  async getProjectByKey(projectId: string, publicKey: string): Promise<Project | null> {
    const project = await this.models!.Project.findOne({
      _id: projectId,
      publicKey,
      isActive: true,
    }).lean();

    if (!project) {
      return null;
    }

    return {
      id: project._id as string,
      name: project.name,
      publicKey: project.publicKey,
      isActive: project.isActive,
      createdAt: project.createdAt,
    };
  }

  async getAllProjects(): Promise<Project[]> {
    const projects = await this.models!.Project.find().sort({ createdAt: -1 }).lean();

    return projects.map((project) => ({
      id: project._id as string,
      name: project.name,
      publicKey: project.publicKey,
      isActive: project.isActive,
      createdAt: project.createdAt,
    }));
  }

  // ==================== Feedback ====================

  async createFeedback(data: FeedbackCreateData): Promise<{ success: boolean; id: string }> {
    const feedback = new this.models!.Feedback({
      _id: data.id,
      projectId: data.projectId,
      type: data.type,
      category: data.category,
      rating: data.rating,
      message: data.message,
      userEmail: data.userEmail,
      pageUrl: data.pageUrl,
      userAgent: data.userAgent,
      language: data.language,
      platform: data.platform,
      timestamp: data.timestamp,
      createdAt: data.createdAt || Date.now(),
    });

    await feedback.save();

    return { success: true, id: feedback._id as string };
  }

  async getFeedbackList(projectId: string, filters: FeedbackListFilters = {}): Promise<FeedbackListResult> {
    const { page = 1, limit = 20, category, minRating } = filters;

    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { projectId };

    if (category) {
      query.category = category;
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const [items, total] = await Promise.all([
      this.models!.Feedback.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      this.models!.Feedback.countDocuments(query),
    ]);

    return {
      items: items as FeedbackListResult['items'],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getFeedbackStats(projectId: string): Promise<FeedbackStats[]> {
    const stats = await this.models!.Feedback.aggregate([
      {
        $match: {
          projectId,
          rating: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avg_rating: { $avg: '$rating' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          avg_rating: 1,
        },
      },
    ]);

    return stats;
  }

  // ==================== Settings ====================

  async getSettings(projectId: string): Promise<Settings | null> {
    const settings = await this.models!.Settings.findOne({ projectId }).lean();

    if (!settings) {
      return null;
    }

    return {
      projectId: settings.projectId,
      notifications: settings.notifications,
      customization: settings.customization as Settings['customization'],
      updatedAt: settings.updatedAt,
    };
  }

  async updateSettings(projectId: string, data: SettingsUpdateData): Promise<Settings | null> {
    const now = Date.now();

    const settingsData = {
      projectId,
      notifications: {
        enabled: data.notifications?.enabled !== false,
        platforms: {
          slack: data.notifications?.platforms?.slack || false,
          discord: data.notifications?.platforms?.discord || false,
          telegram: data.notifications?.platforms?.telegram || false,
          email: data.notifications?.platforms?.email || false,
        },
      },
      customization: {
        primaryColor: data.customization?.primaryColor || '#4F46E5',
        position: data.customization?.position || 'bottom-right',
        language: data.customization?.language || 'ko',
      },
      updatedAt: now,
    };

    const settings = await this.models!.Settings.findOneAndUpdate({ projectId }, settingsData, {
      new: true,
      upsert: true,
      lean: true,
    });

    if (!settings) {
      return null;
    }

    return {
      projectId: settings.projectId,
      notifications: settings.notifications,
      customization: settings.customization as Settings['customization'],
      updatedAt: settings.updatedAt,
    };
  }
}
