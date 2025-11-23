export function validateFeedback(request, reply, done) {
  const { type, category, message } = request.body;

  if (!type || !['floating', 'settings'].includes(type)) {
    return reply.code(400).send({ error: 'Invalid or missing type' });
  }

  if (!category || !['bug', 'feature', 'improvement'].includes(category)) {
    return reply.code(400).send({ error: 'Invalid or missing category' });
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return reply.code(400).send({ error: 'Message is required' });
  }

  if (request.body.rating) {
    const rating = Number(request.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return reply.code(400).send({ error: 'Rating must be between 1 and 5' });
    }
  }

  done();
}
