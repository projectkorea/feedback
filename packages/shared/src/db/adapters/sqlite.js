import Database from 'better-sqlite3';
import { DatabaseAdapter } from './base.js';

/**
 * SQLite Database Adapter
 * better-sqlite3를 사용한 SQLite 구현
 */
export class SQLiteAdapter extends DatabaseAdapter {
  constructor(config) {
    super(config);
    this.db = null;
  }

  // ==================== Lifecycle ====================

  async connect() {
    const dbPath = this.config.path || './feedback.db';
    this.db = new Database(dbPath);

    // 테이블 생성
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        public_key TEXT UNIQUE NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        rating INTEGER,
        message TEXT NOT NULL,
        user_email TEXT,
        page_url TEXT,
        user_agent TEXT,
        language TEXT,
        platform TEXT,
        timestamp TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT UNIQUE NOT NULL,
        notifications_enabled INTEGER DEFAULT 1,
        notifications_slack INTEGER DEFAULT 0,
        notifications_discord INTEGER DEFAULT 0,
        notifications_telegram INTEGER DEFAULT 0,
        notifications_email INTEGER DEFAULT 0,
        custom_primary_color TEXT DEFAULT '#4F46E5',
        custom_position TEXT DEFAULT 'bottom-right',
        custom_language TEXT DEFAULT 'ko',
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      );

      CREATE INDEX IF NOT EXISTS idx_feedback_project ON feedback(project_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
      CREATE INDEX IF NOT EXISTS idx_projects_key ON projects(public_key);
    `);

    console.log('✅ SQLite database connected:', dbPath);
    return this;
  }

  async disconnect() {
    if (this.db) {
      this.db.close();
      console.log('✅ SQLite database disconnected');
    }
  }

  // ==================== Projects ====================

  async createProject(data) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, name, public_key, is_active, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.id,
      data.name,
      data.publicKey,
      data.isActive ? 1 : 0,
      data.createdAt || Date.now()
    );

    return this.db.prepare('SELECT * FROM projects WHERE id = ?').get(data.id);
  }

  async getProjectByKey(projectId, publicKey) {
    const stmt = this.db.prepare(`
      SELECT * FROM projects
      WHERE id = ? AND public_key = ? AND is_active = 1
    `);

    const project = stmt.get(projectId, publicKey);

    if (!project) {
      return null;
    }

    // 응답 형식 변환 (snake_case -> camelCase)
    return {
      id: project.id,
      name: project.name,
      publicKey: project.public_key,
      isActive: project.is_active === 1,
      createdAt: project.created_at
    };
  }

  async getAllProjects() {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY created_at DESC');
    const projects = stmt.all();

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      publicKey: project.public_key,
      isActive: project.is_active === 1,
      createdAt: project.created_at
    }));
  }

  // ==================== Feedback ====================

  async createFeedback(data) {
    const stmt = this.db.prepare(`
      INSERT INTO feedback (
        id, project_id, type, category, rating, message,
        user_email, page_url, user_agent, language, platform,
        timestamp, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.id,
      data.projectId,
      data.type,
      data.category,
      data.rating || null,
      data.message,
      data.userEmail || null,
      data.pageUrl || null,
      data.userAgent || null,
      data.language || null,
      data.platform || null,
      data.timestamp,
      data.createdAt || Date.now()
    );

    return { success: true, id: data.id };
  }

  async getFeedbackList(projectId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      minRating
    } = filters;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE project_id = ?';
    const params = [projectId];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (minRating) {
      whereClause += ' AND rating >= ?';
      params.push(Number(minRating));
    }

    // 데이터 조회
    const stmt = this.db.prepare(`
      SELECT * FROM feedback
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);

    const items = stmt.all(...params, Number(limit), offset);

    // 카운트 조회
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM feedback ${whereClause}
    `);
    const { count } = countStmt.get(...params);

    return {
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    };
  }

  async getFeedbackStats(projectId) {
    const stmt = this.db.prepare(`
      SELECT
        category,
        COUNT(*) as count,
        AVG(rating) as avg_rating
      FROM feedback
      WHERE project_id = ? AND rating IS NOT NULL
      GROUP BY category
    `);

    return stmt.all(projectId);
  }

  // ==================== Settings ====================

  async getSettings(projectId) {
    const stmt = this.db.prepare(`
      SELECT * FROM settings WHERE project_id = ?
    `);

    const settings = stmt.get(projectId);

    if (!settings) {
      return null;
    }

    // SQLite INTEGER to Boolean 변환 및 구조 변환
    return {
      projectId: settings.project_id,
      notifications: {
        enabled: settings.notifications_enabled === 1,
        platforms: {
          slack: settings.notifications_slack === 1,
          discord: settings.notifications_discord === 1,
          telegram: settings.notifications_telegram === 1,
          email: settings.notifications_email === 1
        }
      },
      customization: {
        primaryColor: settings.custom_primary_color,
        position: settings.custom_position,
        language: settings.custom_language
      },
      updatedAt: settings.updated_at
    };
  }

  async updateSettings(projectId, data) {
    const now = Date.now();

    // UPSERT: INSERT OR REPLACE
    const stmt = this.db.prepare(`
      INSERT INTO settings (
        project_id,
        notifications_enabled,
        notifications_slack,
        notifications_discord,
        notifications_telegram,
        notifications_email,
        custom_primary_color,
        custom_position,
        custom_language,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(project_id) DO UPDATE SET
        notifications_enabled = excluded.notifications_enabled,
        notifications_slack = excluded.notifications_slack,
        notifications_discord = excluded.notifications_discord,
        notifications_telegram = excluded.notifications_telegram,
        notifications_email = excluded.notifications_email,
        custom_primary_color = excluded.custom_primary_color,
        custom_position = excluded.custom_position,
        custom_language = excluded.custom_language,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      projectId,
      data.notifications?.enabled ? 1 : 0,
      data.notifications?.platforms?.slack ? 1 : 0,
      data.notifications?.platforms?.discord ? 1 : 0,
      data.notifications?.platforms?.telegram ? 1 : 0,
      data.notifications?.platforms?.email ? 1 : 0,
      data.customization?.primaryColor || '#4F46E5',
      data.customization?.position || 'bottom-right',
      data.customization?.language || 'ko',
      now
    );

    return this.getSettings(projectId);
  }
}
