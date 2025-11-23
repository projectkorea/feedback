import { getDB } from '../db/index.js';

export async function authMiddleware(request, reply) {
  const publicKey = request.headers['x-public-key'];
  const projectId = request.headers['x-project-id'] || request.query.projectId;

  if (!publicKey || !projectId) {
    return reply.code(401).send({ error: 'Missing authentication headers' });
  }

  const db = getDB();
  const project = await db.getProjectByKey(projectId, publicKey);

  if (!project) {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  request.project = project;
}
