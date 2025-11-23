import mongoose from 'mongoose';
import { DatabaseAdapter } from './base.js';
import { getModels } from '../schemas/mongodb.js';

/**
 * MongoDB Database Adapter
 * Mongoose를 사용한 MongoDB 구현
 */
export class MongoDBAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.connection = null;
    this.models = null;
  }

  // ==================== Lifecycle ====================

  async connect() {
    const uri = this.config.uri || process.env.MONGODB_URI;
    const dbName = this.config.dbName || process.env.MONGODB_DB_NAME || 'feedback';

    if (!uri) {
      throw new Error('MongoDB URI is required');
    }

    // Connection pooling을 위한 재사용 (Serverless 환경 최적화)
    if (this.connection && this.connection.readyState === 1) {
      console.log('♻️  Reusing existing MongoDB connection');
      return this;
    }

    try {
      this.connection = await mongoose.createConnection(uri, {
        dbName,
        maxPoolSize: 10,  // Connection pool size
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.models = getModels(this.connection);

      console.log('✅ MongoDB connected:', dbName);
      return this;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.models = null;
      console.log('✅ MongoDB disconnected');
    }
  }

  // ==================== Projects ====================

  async createProject(data) {
    const project = new this.models.Project({
      _id: data.id,
      name: data.name,
      publicKey: data.publicKey,
      isActive: data.isActive !== false,
      createdAt: data.createdAt || Date.now()
    });

    await project.save();

    return {
      id: project._id,
      name: project.name,
      publicKey: project.publicKey,
      isActive: project.isActive,
      createdAt: project.createdAt
    };
  }

  async getProjectByKey(projectId, publicKey) {
    const project = await this.models.Project.findOne({
      _id: projectId,
      publicKey,
      isActive: true
    }).lean();

    if (!project) {
      return null;
    }

    return {
      id: project._id,
      name: project.name,
      publicKey: project.publicKey,
      isActive: project.isActive,
      createdAt: project.createdAt
    };
  }

  async getAllProjects() {
    const projects = await this.models.Project.find()
      .sort({ createdAt: -1 })
      .lean();

    return projects.map(project => ({
      id: project._id,
      name: project.name,
      publicKey: project.publicKey,
      isActive: project.isActive,
      createdAt: project.createdAt
    }));
  }

  // ==================== Feedback ====================

  async createFeedback(data) {
    const feedback = new this.models.Feedback({
      _id: data.id,
      projectId: data.projectId,
      type: data.type,
      category: data.category,
      rating: data.rating || undefined,
      message: data.message,
      userEmail: data.userEmail || undefined,
      pageUrl: data.pageUrl || undefined,
      userAgent: data.userAgent || undefined,
      language: data.language || undefined,
      platform: data.platform || undefined,
      timestamp: data.timestamp,
      createdAt: data.createdAt || Date.now()
    });

    await feedback.save();

    return { success: true, id: feedback._id };
  }

  async getFeedbackList(projectId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      minRating
    } = filters;

    const skip = (page - 1) * limit;

    // 필터 쿼리 구성
    const query = { projectId };

    if (category) {
      query.category = category;
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // 데이터 조회 및 카운트 병렬 실행
    const [items, total] = await Promise.all([
      this.models.Feedback.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      this.models.Feedback.countDocuments(query)
    ]);

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getFeedbackStats(projectId) {
    const stats = await this.models.Feedback.aggregate([
      {
        $match: {
          projectId,
          rating: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avg_rating: { $avg: '$rating' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          avg_rating: 1
        }
      }
    ]);

    return stats;
  }

  // ==================== Settings ====================

  async getSettings(projectId) {
    const settings = await this.models.Settings.findOne({ projectId }).lean();

    if (!settings) {
      return null;
    }

    return {
      projectId: settings.projectId,
      notifications: settings.notifications,
      customization: settings.customization,
      updatedAt: settings.updatedAt
    };
  }

  async updateSettings(projectId, data) {
    const now = Date.now();

    const settingsData = {
      projectId,
      notifications: {
        enabled: data.notifications?.enabled !== false,
        platforms: {
          slack: data.notifications?.platforms?.slack || false,
          discord: data.notifications?.platforms?.discord || false,
          telegram: data.notifications?.platforms?.telegram || false,
          email: data.notifications?.platforms?.email || false
        }
      },
      customization: {
        primaryColor: data.customization?.primaryColor || '#4F46E5',
        position: data.customization?.position || 'bottom-right',
        language: data.customization?.language || 'ko'
      },
      updatedAt: now
    };

    // UPSERT: findOneAndUpdate with upsert option
    const settings = await this.models.Settings.findOneAndUpdate(
      { projectId },
      settingsData,
      {
        new: true,        // 업데이트된 문서 반환
        upsert: true,     // 없으면 생성
        lean: true
      }
    );

    return {
      projectId: settings.projectId,
      notifications: settings.notifications,
      customization: settings.customization,
      updatedAt: settings.updatedAt
    };
  }
}
