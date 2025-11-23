import { getDB } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateFeedback } from '../middleware/validation.js';
import { getNotificationService } from '../services/notificationService.js';

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

      const db = getDB();
      await db.createFeedback({
        id,
        projectId: request.project.id,
        type,
        category,
        rating: rating || null,
        message,
        userEmail: userEmail || null,
        pageUrl: pageUrl || null,
        userAgent: browserInfo?.userAgent || null,
        language: browserInfo?.language || null,
        platform: browserInfo?.platform || null,
        timestamp,
        createdAt: Date.now()
      });

      // 모든 설정된 플랫폼으로 알림 전송 (비동기, 실패해도 피드백 저장 성공)
      const notificationService = getNotificationService();
      notificationService.sendFeedbackNotification({
        id,
        type,
        category,
        rating,
        message,
        user_email: userEmail,
        page_url: pageUrl,
        platform: browserInfo?.platform,
        timestamp
      }).catch(err => {
        request.log.error('Notification failed:', err);
      });

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

      const db = getDB();
      const result = await db.getFeedbackList(request.project.id, {
        page: Number(page),
        limit: Number(limit),
        category,
        minRating: minRating ? Number(minRating) : undefined
      });

      return {
        success: true,
        data: result.items,
        pagination: result.pagination
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
      const db = getDB();
      const stats = await db.getFeedbackStats(request.project.id);

      return { success: true, data: stats };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch stats' });
    }
  });
}
