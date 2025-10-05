import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

import { db } from './db/index.js';
import { feedbackRoutes } from './routes/feedback.js';
import { projectRoutes } from './routes/projects.js';
import { settingsRoutes } from './routes/settings.js';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: { colorize: true }
    } : undefined
  }
});

// CORS
await fastify.register(cors, {
  origin: true,
  credentials: true
});

// Rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// 데이터베이스 초기화 확인
fastify.log.info('SQLite database initialized');

// 라우트 등록
await fastify.register(feedbackRoutes);
await fastify.register(projectRoutes);
await fastify.register(settingsRoutes);

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
}));

// 서버 시작
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`🚀 Server running on http://localhost:${port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await fastify.close();
  db.close();
  process.exit(0);
});

start();
