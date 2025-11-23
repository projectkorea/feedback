# Next.js Demo - Feedback SDK

Next.js App Router를 사용한 Feedback SDK 데모 애플리케이션입니다.

## 기능

- ✅ Next.js 14 App Router
- ✅ Feedback SDK React 통합
- ✅ 서버 컴포넌트 + 클라이언트 컴포넌트 혼합
- ✅ 멀티 플랫폼 알림 (Slack, Discord, Telegram, Email)
- ✅ 반응형 디자인

## 실행 방법

### 1. 의존성 설치

```bash
# 루트 디렉토리에서
pnpm install
```

### 2. API 서버 실행

```bash
# 다른 터미널에서 API 서버 실행
pnpm --filter @feedback-sdk/api-server dev
```

### 3. Next.js 앱 실행

```bash
pnpm --filter next-demo dev
```

앱이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 환경 변수

API 서버의 `.env` 파일에서 알림 플랫폼을 설정할 수 있습니다:

```bash
# Slack
SLACK_WEBHOOK_URL=

# Discord
DISCORD_WEBHOOK_URL=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
```

## 프로젝트 구조

```
next-demo/
├── app/
│   ├── layout.js          # 루트 레이아웃
│   ├── page.js            # 메인 페이지 (클라이언트 컴포넌트)
│   └── globals.css        # 글로벌 스타일
├── package.json
├── next.config.mjs
└── README.md
```

## 주요 특징

### App Router 사용

Next.js 13+의 App Router를 사용하여 최신 Next.js 패턴을 따릅니다.

### 클라이언트 컴포넌트

Feedback SDK는 React hooks를 사용하므로 `'use client'` 지시어가 필요합니다.

### Monorepo 통합

pnpm workspaces를 사용하여 로컬 패키지를 참조합니다:

```json
{
  "dependencies": {
    "@feedback-sdk/react": "workspace:*"
  }
}
```

## 개발

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```
