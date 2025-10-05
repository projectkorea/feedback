import { db } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateFeedback } from '../middleware/validation.js';

export async function feedbackRoutes(fastify) {
  // 피드백 제출
  fastify.post('/api/feedback', {
    preHandler: [authMiddleware, validateFeedback]
  }, async (request, reply) => {
    try {
      const {
        id,
        type,
        category,
        rating,
        message,
        userEmail,
        pageUrl,
        browserInfo,
        timestamp
      } = request.body;

      const stmt = db.prepare(`
        INSERT INTO feedback (
          id, project_id, type, category, rating, message,
          user_email, page_url, user_agent, language, platform,
          timestamp, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        request.project.id,
        type,
        category,
        rating || null,
        message,
        userEmail || null,
        pageUrl || null,
        browserInfo?.userAgent || null,
        browserInfo?.language || null,
        browserInfo?.platform || null,
        timestamp,
        Date.now()
      );

      return { success: true, id };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to save feedback' });
    }
  });

  // 피드백 목록 조회
  fastify.get('/api/feedback', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        minRating
      } = request.query;

      const offset = (page - 1) * limit;
      let whereClause = 'WHERE project_id = ?';
      const params = [request.project.id];

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      if (minRating) {
        whereClause += ' AND rating >= ?';
        params.push(Number(minRating));
      }

      const stmt = db.prepare(`
        SELECT * FROM feedback
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `);

      const feedback = stmt.all(...params, Number(limit), offset);

      const countStmt = db.prepare(`
        SELECT COUNT(*) as count FROM feedback ${whereClause}
      `);
      const { count } = countStmt.get(...params);

      return {
        success: true,
        data: feedback,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch feedback' });
    }
  });

  // 피드백 통계
  fastify.get('/api/feedback/stats', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const stmt = db.prepare(`
        SELECT
          category,
          COUNT(*) as count,
          AVG(rating) as avg_rating
        FROM feedback
        WHERE project_id = ? AND rating IS NOT NULL
        GROUP BY category
      `);

      const stats = stmt.all(request.project.id);

      return { success: true, data: stats };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch stats' });
    }
  });
}
