# Context

## CRITIC

- When unsure about implementation details, ALWAYS ask the developer.

## 아키텍처

### 개발 환경

- 모노레포(workspaces): `packages/`에 core, vanilla-sdk, react-sdk, api-server 구성
- Node.js + Express: REST API, 미들웨어(cors, json, rate limit) 구성
- MongoDB + Mongoose: `feedbacks`, `projects`, `settings` 컬렉션 스키마 기반 저장
- React: React SDK(Provider/Hooks/Components)로 앱 통합
- Docker Compose: 로컬 개발용 MongoDB·API 서비스 구성

### 핵심 라이브러리

- Express, cors: 서버 및 CORS 미들웨어
- Mongoose: 스키마/모델, 인덱스, 타임스탬프 관리
- React: Context/Hooks 패턴으로 SDK 상태/액션 노출
- (SDK 내부) 경량 DOM 조작 및 모달/폼 유틸

### 추가 라이브러리 (필요시)

- 요청 검증/속도 제한 미들웨어, 로깅, 모니터링 등 운영 도구

### 상태 관리 구조

```typescript
// React SDK의 Context 값 예시
interface FeedbackContextValue {
  config: {
    publicKey: string
    projectId: string
    apiUrl: string
  }
  isFloatingVisible: boolean
  setFloatingVisible: (visible: boolean) => void
  isModalOpen: boolean
  setModalOpen: (open: boolean) => void
  feedbackData: unknown
  setFeedbackData: (data: unknown) => void
  submitFeedback: (data: {
    type: 'floating' | 'settings'
    rating?: number
    message?: string
    userEmail?: string
    pageUrl?: string
    browserInfo?: Record<string, unknown>
    customFields?: Record<string, unknown>
  }) => Promise<void>
  isLoading: boolean
}
```

### 디렉토리 구조

```text
feedback-sdk-monorepo/
├── packages/
│   ├── core/                    # 공통 로직
│   │   ├── src/
│   │   │   ├── api/
│   │   │   │   └── client.js    # API 클라이언트
│   │   │   ├── utils/
│   │   │   │   ├── validation.js
│   │   │   │   └── storage.js
│   │   │   └── types/
│   │   │       └── index.js     # 공통 타입/상수
│   │   └── package.json
│   │
│   ├── vanilla-sdk/             # JavaScript SDK
│   │   ├── src/
│   │   │   ├── FeedbackSDK.js   # 메인 SDK 클래스
│   │   │   ├── widgets/
│   │   │   │   ├── FloatingWidget.js
│   │   │   │   └── SettingsWidget.js
│   │   │   ├── ui/
│   │   │   │   ├── Modal.js
│   │   │   │   └── Form.js
│   │   │   └── styles/
│   │   │       ├── widget.css
│   │   │       └── modal.css
│   │   ├── dist/
│   │   │   ├── feedback-sdk.min.js
│   │   │   └── feedback-sdk.css
│   │   └── package.json
│   │
│   ├── react-sdk/              # React SDK
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── FeedbackProvider.jsx
│   │   │   │   ├── FloatingButton.jsx
│   │   │   │   ├── FeedbackModal.jsx
│   │   │   │   └── SettingsPanel.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFeedback.js
│   │   │   │   └── useSettings.js
│   │   │   ├── context/
│   │   │   │   └── FeedbackContext.jsx
│   │   │   └── index.js         # 공개 API
│   │   └── package.json
│   │
│   └── api-server/             # Node.js API 서버
│       ├── src/
│       │   ├── routes/
│       │   │   ├── feedback.js
│       │   │   ├── projects.js
│       │   │   └── settings.js
│       │   ├── models/
│       │   │   ├── Feedback.js
│       │   │   ├── Project.js
│       │   │   └── Settings.js
│       │   ├── middleware/
│       │   │   ├── auth.js
│       │   │   ├── validation.js
│       │   │   └── rateLimit.js
│       │   ├── services/
│       │   │   └── feedbackService.js
│       │   └── app.js
│       └── package.json
│
├── examples/
│   ├── vanilla-demo/
│   ├── react-demo/
│   └── next-demo/
│
└── package.json
```
