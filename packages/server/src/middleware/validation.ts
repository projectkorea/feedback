import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import type { FeedbackBody } from '../types.js';

export function validateFeedback(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  const body = request.body as FeedbackBody;
  const { type, category, message } = body;

  if (!type || !['floating', 'settings'].includes(type)) {
    reply.code(400).send({ error: 'Invalid or missing type' });
    return;
  }

  if (!category || !['bug', 'feature', 'improvement'].includes(category)) {
    reply.code(400).send({ error: 'Invalid or missing category' });
    return;
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    reply.code(400).send({ error: 'Message is required' });
    return;
  }

  if (body.rating) {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      reply.code(400).send({ error: 'Rating must be between 1 and 5' });
      return;
    }
  }

  done();
}
