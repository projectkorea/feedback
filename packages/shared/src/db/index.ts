import { SQLiteAdapter } from './adapters/sqlite.js';
import { MongoDBAdapter } from './adapters/mongodb.js';
import type { DatabaseAdapter } from './adapters/base.js';

export function createDatabaseAdapter(): DatabaseAdapter {
  const dbType = process.env.DATABASE_TYPE || 'sqlite';

  console.log(`🔧 Database Type: ${dbType}`);

  switch (dbType.toLowerCase()) {
    case 'mongodb':
    case 'mongo':
      return new MongoDBAdapter({
        uri: process.env.MONGODB_URI,
        dbName: process.env.MONGODB_DB_NAME || 'feedback',
      });

    case 'sqlite':
    default:
      return new SQLiteAdapter({
        path: process.env.DATABASE_PATH || './feedback.db',
      });
  }
}

let dbInstance: DatabaseAdapter | null = null;

export function getDatabase(): DatabaseAdapter {
  if (!dbInstance) {
    dbInstance = createDatabaseAdapter();
  }
  return dbInstance;
}

export async function initializeDatabase(): Promise<DatabaseAdapter> {
  const db = getDatabase();
  await db.connect();
  return db;
}

export { DatabaseAdapter } from './adapters/base.js';
export { SQLiteAdapter } from './adapters/sqlite.js';
export { MongoDBAdapter } from './adapters/mongodb.js';

export type * from '../types.js';
