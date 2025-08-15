# Context

## 핵심 컨셉

피드백 수집을 위한 경량 SDK(바닐라 JS, React)와 Node.js API 서버, MongoDB로 구성된 PoC입니다. 클라이언트는 위젯(UI)을 통해 사용자 피드백을 전송하고, 서버는 검증/레이트 리밋/인증을 거쳐 안전하게 저장합니다. 대시보드(추후)에서 분석·조회·설정을 제공합니다.

- 목적: 앱에 빠르게 임베드 가능한 피드백 수집/설정 위젯 제공
- UX 철학: 빠른 임베드, 가벼운 의존성, 기본 제공 UI로 즉시 사용 가능
- 차별점: 모노레포로 SDK·API 일관 개발, 프로젝트/설정/커스텀 필드까지 한 번에

## 타겟 유저

1) 프론트엔드 개발자: 앱에 위젯을 빠르게 임베드하고 최소 설정으로 피드백 수집을 시작하려는 사용자
2) 프로덕트 매니저: 수집된 피드백을 분류·검색·통계로 확인하고 설정을 원격으로 제어하려는 사용자
3) 스타트업/프로덕트 팀: PoC 단계에서 가벼운 설치로 실제 사용자 의견을 조기에 모으려는 팀

## 핵심 기능

- SDK 제공: 바닐라 JS SDK와 React SDK, 플로팅/설정 위젯 및 기본 Modal/Form UI
- API 서버: 피드백 전송/조회, 프로젝트 키 기반 인증, 레이트 리밋, 검증, MongoDB 저장
- 설정 관리: 프로젝트별 위젯 설정(위치/테마/브랜딩/이메일 수집)과 커스텀 필드 지원

## 기술 스택

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

## 상태 관리 구조

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

## 아키텍처 설계

### 프로젝트 구조

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
