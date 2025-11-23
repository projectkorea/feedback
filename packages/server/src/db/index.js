import { createDatabaseAdapter, initializeDatabase } from '@feedback-sdk/shared/db/index.js';

// Database Adapter 인스턴스
export let db = null;

/**
 * 데이터베이스 초기화
 * 서버 시작 시 호출
 */
export async function initDB() {
  db = await initializeDatabase();
  console.log('📊 Database initialized');
  return db;
}

/**
 * 데이터베이스 어댑터 가져오기
 */
export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}
