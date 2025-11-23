import { SQLiteAdapter } from './adapters/sqlite.js';
import { MongoDBAdapter } from './adapters/mongodb.js';

/**
 * Database Adapter 팩토리 함수
 * 환경 변수 DATABASE_TYPE에 따라 적절한 어댑터 생성
 *
 * @returns {DatabaseAdapter} SQLite 또는 MongoDB 어댑터
 */
export function createDatabaseAdapter() {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';

  console.log(`🔧 Database Type: ${dbType}`);

  switch (dbType.toLowerCase()) {
    case 'mongodb':
    case 'mongo':
      return new MongoDBAdapter({
        uri: process.env.MONGODB_URI,
        dbName: process.env.MONGODB_DB_NAME || 'feedback'
      });

    case 'sqlite':
    default:
      return new SQLiteAdapter({
        path: process.env.DATABASE_PATH || './feedback.db'
      });
  }
}

// 싱글톤 인스턴스 (선택적 사용)
let dbInstance = null;

/**
 * 데이터베이스 싱글톤 인스턴스 가져오기
 *
 * @returns {DatabaseAdapter}
 */
export function getDatabase() {
  if (!dbInstance) {
    dbInstance = createDatabaseAdapter();
  }
  return dbInstance;
}

/**
 * 데이터베이스 연결 초기화
 *
 * @returns {Promise<DatabaseAdapter>}
 */
export async function initializeDatabase() {
  const db = getDatabase();
  await db.connect();
  return db;
}

// Re-exports
export { DatabaseAdapter } from './adapters/base.js';
export { SQLiteAdapter } from './adapters/sqlite.js';
export { MongoDBAdapter } from './adapters/mongodb.js';
