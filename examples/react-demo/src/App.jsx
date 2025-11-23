import { FeedbackSDK } from '@feedback-sdk/react';
import './App.css';

const config = {
  publicKey: 'pk_demo_key',
  projectId: 'demo_project_id',
  apiUrl: 'http://localhost:3001'
};

function App() {
  return (
    <>
      {/* SDK가 자동으로 Portal을 통해 플로팅 버튼과 모달을 렌더링 */}
      <FeedbackSDK config={config} />

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">⚡ Feedback SDK Demo</h1>
          <p className="app-subtitle">Multi-platform notification system</p>
        </header>

        <main className="app-main">
          {/* Platform Cards */}
          <div className="platform-grid">
            <div className="platform-card slack">
              <div className="platform-icon">💬</div>
              <h3 className="platform-name">Slack</h3>
              <p className="platform-desc">실시간 팀 협업 알림</p>
              <div className="platform-status">
                <span className="status-dot"></span>
                <span className="status-text">연동 가능</span>
              </div>
            </div>

            <div className="platform-card discord">
              <div className="platform-icon">🎮</div>
              <h3 className="platform-name">Discord</h3>
              <p className="platform-desc">커뮤니티 피드백 수집</p>
              <div className="platform-status">
                <span className="status-dot"></span>
                <span className="status-text">연동 가능</span>
              </div>
            </div>

            <div className="platform-card telegram">
              <div className="platform-icon">✈️</div>
              <h3 className="platform-name">Telegram</h3>
              <p className="platform-desc">모바일 즉시 알림</p>
              <div className="platform-status">
                <span className="status-dot"></span>
                <span className="status-text">연동 가능</span>
              </div>
            </div>
          </div>

          {/* How to use */}
          <div className="app-card how-to">
            <h2 className="section-title">🚀 사용 방법</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>플랫폼 설정</h4>
                  <p><code>.env</code> 파일에서 원하는 플랫폼의 Webhook URL 설정</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>피드백 전송</h4>
                  <p>우측 하단 💬 버튼을 클릭하고 피드백 작성</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>알림 확인</h4>
                  <p>설정한 플랫폼에서 실시간으로 알림 받기! 🎉</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="app-card features">
            <h2 className="section-title">✨ 주요 기능</h2>
            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <span className="feature-text">카테고리별 분류</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⭐</span>
                <span className="feature-text">별점 평가</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📧</span>
                <span className="feature-text">이메일 수집</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <span className="feature-text">멀티 플랫폼</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">실시간 알림</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span className="feature-text">안전한 API</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="app-footer">
          <p>© 2025 Feedback SDK • Open Source Project</p>
          <p className="footer-links">
            <a href="#" className="footer-link">Documentation</a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">GitHub</a>
            <span className="separator">•</span>
            <a href="#" className="footer-link">Demo</a>
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
