import type { FastifyInstance } from 'fastify';
import { getDB } from '../db/index.js';
import { randomBytes } from 'crypto';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest, CreateProjectBody } from '../types.js';

export async function projectRoutes(fastify: FastifyInstance): Promise<void> {
  // 프로젝트 생성 (데모용 - 인증 없음)
  fastify.post<{ Body: CreateProjectBody }>('/api/projects', async (request, reply) => {
    try {
      const { name } = request.body;

      if (!name || name.trim().length === 0) {
        return reply.code(400).send({ error: 'Project name is required' });
      }

      const id = randomBytes(16).toString('hex');
      const publicKey = randomBytes(32).toString('hex');

      const db = getDB();
      await db.createProject({
        id,
        name,
        publicKey,
        isActive: true,
        createdAt: Date.now(),
      });

      return {
        success: true,
        data: { id, name, publicKey },
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to create project' });
    }
  });

  // 프로젝트 조회
  fastify.get(
    '/api/projects/:id',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      try {
        const authenticatedRequest = request as unknown as AuthenticatedRequest;

        return {
          success: true,
          data: authenticatedRequest.project,
        };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch project' });
      }
    }
  );
}
