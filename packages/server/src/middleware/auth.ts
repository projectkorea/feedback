import type { FastifyRequest, FastifyReply } from 'fastify';
import { getDB } from '../db/index.js';
import type { AuthenticatedRequest } from '../types.js';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const publicKey = request.headers['x-public-key'] as string | undefined;
  const projectId =
    (request.headers['x-project-id'] as string | undefined) ||
    (request.query as { projectId?: string }).projectId;

  if (!publicKey || !projectId) {
    reply.code(401).send({ error: 'Missing authentication headers' });
    return;
  }

  const db = getDB();
  const project = await db.getProjectByKey(projectId, publicKey);

  if (!project) {
    reply.code(401).send({ error: 'Invalid credentials' });
    return;
  }

  (request as AuthenticatedRequest).project = project;
}
