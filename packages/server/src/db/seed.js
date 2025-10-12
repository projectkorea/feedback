import { db } from './index.js';

/**
 * 테스트용 프로젝트 데이터 생성
 * React Demo에서 사용하는 기본 프로젝트를 자동으로 생성
 */
export function seedDatabase() {
  try {
    // 이미 demo 프로젝트가 있는지 확인
    const existingProject = db.prepare(
      'SELECT id FROM projects WHERE public_key = ?'
    ).get('pk_demo_key');

    if (existingProject) {
      console.log('✅ Demo project already exists (pk_demo_key)');
      return;
    }

    // Demo 프로젝트 생성
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, public_key, is_active, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      'demo_project_id',
      'Demo Project',
      'pk_demo_key',
      1,
      Date.now()
    );

    console.log('✅ Demo project created successfully!');
    console.log('   Project ID: demo_project_id');
    console.log('   Public Key: pk_demo_key');
  } catch (error) {
    console.error('❌ Failed to seed database:', error.message);
  }
}
