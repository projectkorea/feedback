import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDB } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateFeedback } from '../middleware/validation.js';
import { getNotificationService } from '../services/notificationService.js';
import type { AuthenticatedRequest, FeedbackBody, FeedbackListQuery } from '../types.js';

export async function feedbackRoutes(fastify: FastifyInstance): Promise<void> {
  // 피드백 제출
  fastify.post<{ Body: FeedbackBody }>(
    '/api/feedback',
    {
      preHandler: [authMiddleware, validateFeedback],
    },
    async (request, reply) => {
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
          timestamp,
        } = request.body;

        const authenticatedRequest = request as unknown as AuthenticatedRequest;

        const db = getDB();
        await db.createFeedback({
          id,
          projectId: authenticatedRequest.project.id,
          type: type as 'floating' | 'settings',
          category: category as 'bug' | 'feature' | 'improvement',
          rating: rating || undefined,
          message,
          userEmail: userEmail || undefined,
          pageUrl: pageUrl || undefined,
          userAgent: browserInfo?.userAgent || undefined,
          language: browserInfo?.language || undefined,
          platform: browserInfo?.platform || undefined,
          timestamp: String(timestamp),
          createdAt: Date.now(),
        });

        // 모든 설정된 플랫폼으로 알림 전송 (비동기, 실패해도 피드백 저장 성공)
        const notificationService = getNotificationService();
        notificationService
          .sendFeedbackNotification({
            id,
            type: type as 'floating' | 'settings',
            category,
            rating: rating || undefined,
            message,
            user_email: userEmail || undefined,
            page_url: pageUrl || undefined,
            platform: browserInfo?.platform || undefined,
            timestamp: String(timestamp),
          })
          .catch((err) => {
            request.log.error('Notification failed:', err);
          });

        return { success: true, id };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to save feedback' });
      }
    }
  );

  // 피드백 목록 조회
  fastify.get<{ Querystring: FeedbackListQuery }>(
    '/api/feedback',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const { page = '1', limit = '20', category, minRating } = request.query;

        const authenticatedRequest = request as unknown as AuthenticatedRequest;

        const db = getDB();
        const result = await db.getFeedbackList(authenticatedRequest.project.id, {
          page: Number(page),
          limit: Number(limit),
          category,
          minRating: minRating ? Number(minRating) : undefined,
        });

        return {
          success: true,
          data: result.items,
          pagination: result.pagination,
        };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch feedback' });
      }
    }
  );

  // 피드백 통계
  fastify.get(
    '/api/feedback/stats',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const authenticatedRequest = request as unknown as AuthenticatedRequest;

        const db = getDB();
        const stats = await db.getFeedbackStats(authenticatedRequest.project.id);

        return { success: true, data: stats };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch stats' });
      }
    }
  );
}
