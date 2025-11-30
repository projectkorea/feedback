# Feedback SDK

사용자 피드백을 수집하고 Slack/Discord/Telegram/Email로 알림받는 SDK

## Quick Start

### 방법 1: 가장 심플 - 백엔드에서 직접 Slack 전송

```bash
npm install @slack/webhook
```

```js
import { IncomingWebhook } from '@slack/webhook';

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

// 액션 핸들러에서 호출
await webhook.send({ text: `새 문의: ${userMessage}` });
```

**.env**
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/xxxx
```

---

### 방법 2: React 피드백 위젯

플로팅 버튼 + 모달 UI가 포함된 풀스택 솔루션

**프론트엔드**
```bash
npm install @feedback-sdk/react
```

```jsx
import { FeedbackSDK } from '@feedback-sdk/react';

function App() {
  return (
    <>
      <FeedbackSDK config={{
        apiUrl: 'http://localhost:3001',
        projectId: 'my_project',
        publicKey: 'pk_xxx'
      }} />
      {/* 앱 컨텐츠 */}
    </>
  );
}
```

**백엔드 (별도 서버)**
```bash
npm install @feedback-sdk/api-server
```

**.env**
```
DATABASE_TYPE=sqlite
DATABASE_PATH=./feedback.db
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/xxxx
```

---

### 방법 3: Vanilla JS (CDN)

```html
<script src="https://unpkg.com/@feedback-sdk/js"></script>
<script>
  window.FeedbackSDK.init({
    apiUrl: 'http://localhost:3001',
    projectId: 'my_project',
    publicKey: 'pk_xxx'
  });
</script>
```

---

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `SLACK_WEBHOOK_URL` | ✅ | Slack Incoming Webhook URL |
| `DATABASE_TYPE` | 서버용 | `sqlite` 또는 `mongodb` |
| `DATABASE_PATH` | SQLite | DB 파일 경로 (기본: `./feedback.db`) |
| `DISCORD_WEBHOOK_URL` | 선택 | Discord 웹훅 |
| `TELEGRAM_BOT_TOKEN` | 선택 | Telegram Bot Token |
| `TELEGRAM_CHAT_ID` | 선택 | Telegram Chat ID |

## 패키지 구조

```
@feedback-sdk/react     # React 컴포넌트 (FeedbackSDK, useFeedback)
@feedback-sdk/core      # API 클라이언트
@feedback-sdk/js        # Vanilla JS SDK
@feedback-sdk/api-server # Fastify 백엔드 서버
@feedback-sdk/shared    # DB 어댑터, 서비스
```

## 라이선스

MIT
