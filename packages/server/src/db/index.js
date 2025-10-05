import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '../../feedback.db');

export const db = new Database(dbPath);

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    public_key TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    rating INTEGER,
    message TEXT NOT NULL,
    user_email TEXT,
    page_url TEXT,
    user_agent TEXT,
    language TEXT,
    platform TEXT,
    timestamp TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE INDEX IF NOT EXISTS idx_feedback_project ON feedback(project_id);
  CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);
  CREATE INDEX IF NOT EXISTS idx_projects_key ON projects(public_key);
`);
