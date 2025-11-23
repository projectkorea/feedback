/**
 * Database Adapter Base Class
 * 모든 데이터베이스 어댑터가 구현해야 하는 인터페이스
 */
export class DatabaseAdapter {
  constructor(config) {
    this.config = config;
  }

  // ==================== Lifecycle ====================

  /**
   * 데이터베이스 연결 및 초기화
   */
  async connect() {
    throw new Error('connect() must be implemented');
  }

  /**
   * 데이터베이스 연결 종료
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented');
  }

  // ==================== Projects ====================

  /**
   * 프로젝트 생성
   * @param {Object} data - { id, name, publicKey, isActive, createdAt }
   * @returns {Promise<Object>} 생성된 프로젝트
   */
  async createProject(data) {
    throw new Error('createProject() must be implemented');
  }

  /**
   * 프로젝트 조회 (인증용)
   * @param {string} projectId - 프로젝트 ID
   * @param {string} publicKey - Public Key
   * @returns {Promise<Object|null>} 프로젝트 또는 null
   */
  async getProjectByKey(projectId, publicKey) {
    throw new Error('getProjectByKey() must be implemented');
  }

  /**
   * 프로젝트 목록 조회
   * @returns {Promise<Array>} 프로젝트 배열
   */
  async getAllProjects() {
    throw new Error('getAllProjects() must be implemented');
  }

  // ==================== Feedback ====================

  /**
   * 피드백 생성
   * @param {Object} data - 피드백 데이터
   * @returns {Promise<Object>} 생성된 피드백
   */
  async createFeedback(data) {
    throw new Error('createFeedback() must be implemented');
  }

  /**
   * 피드백 목록 조회 (페이지네이션, 필터링)
   * @param {string} projectId - 프로젝트 ID
   * @param {Object} filters - { page, limit, category, minRating }
   * @returns {Promise<Object>} { items: Array, pagination: Object }
   */
  async getFeedbackList(projectId, filters) {
    throw new Error('getFeedbackList() must be implemented');
  }

  /**
   * 피드백 통계 조회
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<Array>} 카테고리별 통계
   */
  async getFeedbackStats(projectId) {
    throw new Error('getFeedbackStats() must be implemented');
  }

  // ==================== Settings ====================

  /**
   * 프로젝트 설정 조회
   * @param {string} projectId - 프로젝트 ID
   * @returns {Promise<Object|null>} 설정 또는 null
   */
  async getSettings(projectId) {
    throw new Error('getSettings() must be implemented');
  }

  /**
   * 프로젝트 설정 업데이트 (없으면 생성)
   * @param {string} projectId - 프로젝트 ID
   * @param {Object} data - 설정 데이터
   * @returns {Promise<Object>} 업데이트된 설정
   */
  async updateSettings(projectId, data) {
    throw new Error('updateSettings() must be implemented');
  }
}
