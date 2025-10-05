import { authMiddleware } from '../middleware/auth.js';

export async function settingsRoutes(fastify) {
  // 설정 조회 (현재는 프로젝트 정보 반환)
  fastify.get('/api/settings', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      return {
        success: true,
        data: {
          projectId: request.project.id,
          projectName: request.project.name
        }
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch settings' });
    }
  });
}
