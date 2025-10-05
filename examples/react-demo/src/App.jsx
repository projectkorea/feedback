import { FeedbackSDK } from '@feedback-sdk/react';
import './App.css';

const config = {
  publicKey: 'pk_demo_key', // 실제 public key로 변경
  projectId: 'demo_project_id', // 실제 project ID로 변경
  apiUrl: 'http://localhost:3000'
};

function App() {
  return (
    <>
      {/* SDK가 자동으로 Portal을 통해 플로팅 버튼과 모달을 렌더링 */}
      <FeedbackSDK config={config} />

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Feedback SDK Demo</h1>
        </header>

        <main className="app-main">
          <div className="app-card">
            <h2 className="app-card-title">💡 사용 방법</h2>
            <ol className="app-list">
              <li className="app-list-item">우측 하단의 💬 버튼을 클릭하세요</li>
              <li className="app-list-item">피드백 양식을 작성하세요</li>
              <li className="app-list-item">메시지를 확인해보세요</li>
            </ol>
          </div>
        </main>

        <footer className="app-footer">© 2025 Feedback SDK</footer>
      </div>
    </>
  );
}

export default App;
