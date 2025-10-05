import { db } from '../db/index.js';
import { randomBytes } from 'crypto';
import { authMiddleware } from '../middleware/auth.js';

export async function projectRoutes(fastify) {
  // 프로젝트 생성 (데모용 - 인증 없음)
  fastify.post('/api/projects', async (request, reply) => {
    try {
      const { name } = request.body;

      if (!name || name.trim().length === 0) {
        return reply.code(400).send({ error: 'Project name is required' });
      }

      const id = randomBytes(16).toString('hex');
      const publicKey = randomBytes(32).toString('hex');

      const stmt = db.prepare(`
        INSERT INTO projects (id, name, public_key, created_at)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run(id, name, publicKey, Date.now());

      return {
        success: true,
        data: { id, name, publicKey }
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to create project' });
    }
  });

  // 프로젝트 조회
  fastify.get('/api/projects/:id', {
    preHandler: [authMiddleware]
  }, async (request, reply) => {
    try {
      return {
        success: true,
        data: request.project
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch project' });
    }
  });
}
