import { getDB } from './index.js';

/**
 * 테스트용 프로젝트 데이터 생성
 * React Demo에서 사용하는 기본 프로젝트를 자동으로 생성
 */
export async function seedDatabase(): Promise<void> {
  try {
    const db = getDB();

    // 이미 demo 프로젝트가 있는지 확인
    const existingProject = await db.getProjectByKey('demo_project_id', 'pk_demo_key');

    if (existingProject) {
      console.log('✅ Demo project already exists (pk_demo_key)');
      return;
    }

    // Demo 프로젝트 생성
    await db.createProject({
      id: 'demo_project_id',
      name: 'Demo Project',
      publicKey: 'pk_demo_key',
      isActive: true,
      createdAt: Date.now(),
    });

    console.log('✅ Demo project created successfully!');
    console.log('   Project ID: demo_project_id');
    console.log('   Public Key: pk_demo_key');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to seed database:', message);
  }
}
