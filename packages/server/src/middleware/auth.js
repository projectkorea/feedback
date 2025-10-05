import { db } from '../db/index.js';

export function authMiddleware(request, reply) {
  const publicKey = request.headers['x-public-key'];
  const projectId = request.headers['x-project-id'] || request.query.projectId;

  if (!publicKey || !projectId) {
    return reply.code(401).send({ error: 'Missing authentication headers' });
  }

  const stmt = db.prepare(`
    SELECT * FROM projects
    WHERE id = ? AND public_key = ? AND is_active = 1
  `);

  const project = stmt.get(projectId, publicKey);

  if (!project) {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  request.project = project;
}
