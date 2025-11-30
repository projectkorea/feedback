import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

import { initDB, getDB } from './db/index.js';
import { seedDatabase } from './db/seed.js';
import { feedbackRoutes } from './routes/feedback.js';
import { projectRoutes } from './routes/projects.js';
import { settingsRoutes } from './routes/settings.js';

dotenv.config();

// 데이터베이스 초기화
await initDB();

// 테스트용 데이터 초기화 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  await seedDatabase();
}

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: { colorize: true },
          }
        : undefined,
  },
});

// CORS
await fastify.register(cors, {
  origin: true,
  credentials: true,
});

// Rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// 데이터베이스 초기화 확인
const dbType = process.env.DATABASE_TYPE || 'sqlite';
fastify.log.info(`Database initialized (${dbType})`);

// 라우트 등록
await fastify.register(feedbackRoutes);
await fastify.register(projectRoutes);
await fastify.register(settingsRoutes);

// Health check
fastify.get('/health', async () => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
}));

// 서버 시작
const start = async (): Promise<void> => {
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
  const db = getDB();
  await db.disconnect();
  process.exit(0);
});

start();
