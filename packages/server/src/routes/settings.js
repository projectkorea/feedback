import { getDB } from '../db/index.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateSettings, getDefaultSettings } from '../middleware/validateSettings.js';

export async function settingsRoutes(fastify) {
  // 설정 조회
  fastify.get('/api/settings', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      const db = getDB();
      const settings = await db.getSettings(request.project.id);

      // 설정이 없으면 기본값 반환
      if (!settings) {
        return {
          success: true,
          data: getDefaultSettings(request.project.id)
        };
      }

      return {
        success: true,
        data: settings
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch settings' });
    }
  });

  // 설정 업데이트
  fastify.put('/api/settings', {
    preHandler: [authMiddleware, validateSettings]
  }, async (request, reply) => {
    try {
      const db = getDB();
      const settings = await db.updateSettings(request.project.id, request.body);

      return {
        success: true,
        data: settings
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to update settings' });
    }
  });
}
