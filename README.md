# Feedback SDK PoC 아키텍처 (MongoDB + JavaScript)

## 전체 시스템 구조

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Client App        │    │   Node.js API       │    │   Admin Dashboard   │
│                     │    │                     │    │                     │
│  ┌───────────────┐  │    │  ┌───────────────┐  │    │  ┌───────────────┐  │
│  │ JS SDK        │──┼────┼─→│  Express.js   │  │    │  │   React App   │  │
│  │ React SDK     │  │    │  │               │  │    │  │               │  │
│  │               │  │    │  │ - Validation  │  │    │  │ - 피드백 조회  │  │
│  │ - Widget      │  │    │  │ - Rate Limit  │  │    │  │ - 통계        │  │
│  │ - Settings    │  │    │  │ - Auth        │  │    │  │ - 설정        │  │
│  └───────────────┘  │    │  └───────────────┘  │    │  └───────────────┘  │
│                     │    └─────────────────────┘    └─────────────────────┘
└─────────────────────┘                │
                                       ▼
                           ┌─────────────────────┐
                           │     MongoDB         │
                           │                     │
                           │ - feedbacks         │
                           │ - projects          │
                           │ - settings          │
                           └─────────────────────┘
```

## 1. 프로젝트 구조

```
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
├── examples/                   # 사용 예시
│   ├── vanilla-demo/
│   ├── react-demo/
│   └── next-demo/
│
└── package.json               # 루트 패키지
```

## 2. JavaScript SDK 구조

### 메인 SDK 클래스
```javascript
// packages/vanilla-sdk/src/FeedbackSDK.js
class FeedbackSDK {
  constructor() {
    this.config = null;
    this.widgets = {
      floating: null,
      settings: null
    };
    this.isInitialized = false;
  }

  init(config) {
    // 설정 검증 및 초기화
    // 위젯 생성 및 DOM 삽입
  }

  showFloatingWidget() {
    // 플로팅 위젯 표시
  }

  showSettingsWidget() {
    // 설정 위젯 표시
  }

  destroy() {
    // 정리 작업
  }
}

// 글로벌 인스턴스
window.FeedbackSDK = new FeedbackSDK();
```

### 위젯 구조
```javascript
// packages/vanilla-sdk/src/widgets/FloatingWidget.js
class FloatingWidget {
  constructor(config) {
    this.config = config;
    this.element = null;
    this.modal = null;
  }

  render() {
    // DOM 요소 생성
    // 이벤트 리스너 등록
  }

  show() {
    // 위젯 표시
  }

  hide() {
    // 위젯 숨김
  }

  destroy() {
    // DOM에서 제거
  }
}
```

## 3. React SDK 구조

### Context Provider
```jsx
// packages/react-sdk/src/context/FeedbackContext.jsx
const FeedbackContext = createContext();

export const FeedbackProvider = ({ children, config }) => {
  const [isFloatingVisible, setFloatingVisible] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);

  const value = {
    config,
    isFloatingVisible,
    setFloatingVisible,
    isModalOpen,
    setModalOpen,
    feedbackData,
    setFeedbackData,
    submitFeedback: async (data) => {
      // API 호출 로직
    }
  };

  return (
    <FeedbackContext.Provider value={value}>
      {children}
    </FeedbackContext.Provider>
  );
};
```

### Hook
```javascript
// packages/react-sdk/src/hooks/useFeedback.js
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }

  return {
    openFloatingWidget: () => context.setModalOpen(true),
    openSettingsWidget: () => context.setModalOpen(true), // 다른 타입으로
    submitFeedback: context.submitFeedback,
    isLoading: context.isLoading
  };
};
```

### 컴포넌트
```jsx
// packages/react-sdk/src/components/FloatingButton.jsx
export const FloatingButton = ({ 
  position = 'bottom-right',
  theme = 'light',
  customStyles = {}
}) => {
  const { openFloatingWidget } = useFeedback();

  return (
    <button
      className={`feedback-floating-btn feedback-${theme} feedback-${position}`}
      style={customStyles}
      onClick={openFloatingWidget}
    >
      💬
    </button>
  );
};
```

## 4. API 서버 구조

### Express.js 앱
```javascript
// packages/api-server/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const feedbackRoutes = require('./routes/feedback');
const projectRoutes = require('./routes/projects');
const settingsRoutes = require('./routes/settings');

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(require('./middleware/rateLimit'));

// 라우트
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/settings', settingsRoutes);

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI);

module.exports = app;
```

### Mongoose 모델
```javascript
// packages/api-server/src/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['floating', 'settings'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  message: String,
  userEmail: String,
  metadata: {
    userAgent: String,
    pageUrl: String,
    browserInfo: Object,
    customFields: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
```

```javascript
// packages/api-server/src/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  publicKey: {
    type: String,
    unique: true,
    required: true
  },
  secretKey: {
    type: String,
    unique: true,
    required: true
  },
  allowedDomains: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
```

```javascript
// packages/api-server/src/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  projectId: {
    type: String,
    unique: true,
    required: true
  },
  widget: {
    position: {
      type: String,
      enum: ['bottom-left', 'bottom-right', 'top-left', 'top-right'],
      default: 'bottom-right'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    collectEmail: {
      type: Boolean,
      default: false
    },
    showBranding: {
      type: Boolean,
      default: true
    }
  },
  customFields: [{
    name: String,
    type: {
      type: String,
      enum: ['text', 'email', 'number', 'select']
    },
    required: Boolean,
    options: [String] // select type용
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
```

## 5. API 엔드포인트

### 피드백 관련
```javascript
// packages/api-server/src/routes/feedback.js
const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { validatePublicKey } = require('../middleware/auth');

// 피드백 전송 (Public API)
router.post('/', validatePublicKey, async (req, res) => {
  try {
    const feedback = new Feedback({
      projectId: req.project._id,
      type: req.body.type,
      rating: req.body.rating,
      message: req.body.message,
      userEmail: req.body.userEmail,
      metadata: {
        userAgent: req.headers['user-agent'],
        pageUrl: req.body.pageUrl,
        browserInfo: req.body.browserInfo,
        customFields: req.body.customFields
      }
    });

    await feedback.save();
    res.json({ success: true, id: feedback._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 피드백 목록 조회 (Private API)
router.get('/list', validateSecretKey, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedbacks = await Feedback.find({ projectId: req.project._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ projectId: req.project._id });

    res.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 설정 관련
```javascript
// packages/api-server/src/routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// 프로젝트 설정 조회 (Public API)
router.get('/:projectId', validatePublicKey, async (req, res) => {
  try {
    const settings = await Settings.findOne({ 
      projectId: req.params.projectId 
    });
    
    res.json(settings || getDefaultSettings());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 설정 업데이트 (Private API)
router.put('/:projectId', validateSecretKey, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { projectId: req.params.projectId },
      req.body,
      { new: true, upsert: true }
    );
    
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

## 6. 사용 예시

### Vanilla JS
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.yoursite.com/feedback-sdk@1.0.0/feedback-sdk.css">
</head>
<body>
  <div id="app">
    <!-- 앱 콘텐츠 -->
  </div>

  <script src="https://cdn.yoursite.com/feedback-sdk@1.0.0/feedback-sdk.min.js"></script>
  <script>
    FeedbackSDK.init({
      publicKey: 'pk_live_xxx',
      projectId: 'proj_123',
      apiUrl: 'https://api.feedback.com',
      widgets: {
        floating: {
          enabled: true,
          position: 'bottom-right'
        },
        settings: {
          enabled: true,
          triggerSelector: '#settings-feedback-btn'
        }
      }
    });
  </script>
</body>
</html>
```

### React
```jsx
// App.jsx
import { FeedbackProvider, FloatingButton, SettingsPanel } from '@yourcompany/feedback-react-sdk';

function App() {
  return (
    <FeedbackProvider config={{
      publicKey: 'pk_live_xxx',
      projectId: 'proj_123',
      apiUrl: 'https://api.feedback.com'
    }}>
      <div className="app">
        {/* 앱 콘텐츠 */}
        <Header />
        <Main />
        
        {/* 피드백 위젯들 */}
        <FloatingButton position="bottom-right" />
        
        {/* 설정 페이지에서 */}
        <SettingsPanel />
      </div>
    </FeedbackProvider>
  );
}
```

### Next.js
```jsx
// pages/_app.js
import { FeedbackProvider } from '@yourcompany/feedback-react-sdk';

function MyApp({ Component, pageProps }) {
  return (
    <FeedbackProvider config={{
      publicKey: process.env.NEXT_PUBLIC_FEEDBACK_KEY,
      projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
      apiUrl: process.env.NEXT_PUBLIC_FEEDBACK_API_URL
    }}>
      <Component {...pageProps} />
    </FeedbackProvider>
  );
}
```

## 7. 배포 & 개발 환경

### Docker Compose 개발환경
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: feedback_dev
    volumes:
      - mongodb_data:/data/db

  api:
    build: ./packages/api-server
    ports:
      - "3001:3001"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/feedback_dev
      NODE_ENV: development
    depends_on:
      - mongodb

  demo-vanilla:
    build: ./examples/vanilla-demo
    ports:
      - "3000:3000"

  demo-react:
    build: ./examples/react-demo
    ports:
      - "3002:3000"

volumes:
  mongodb_data:
```

### 빌드 스크립트
```json
{
  "scripts": {
    "build": "npm run build:core && npm run build:vanilla && npm run build:react",
    "build:core": "cd packages/core && npm run build",
    "build:vanilla": "cd packages/vanilla-sdk && npm run build",
    "build:react": "cd packages/react-sdk && npm run build",
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:vanilla\" \"npm run dev:react\"",
    "dev:api": "cd packages/api-server && npm run dev",
    "dev:vanilla": "cd examples/vanilla-demo && npm run dev",
    "dev:react": "cd examples/react-demo && npm run dev"
  }
}
```

이제 Cursor에서 이 구조로 구현하시면 됩니다! MongoDB는 스키마가 유연해서 빠른 프로토타이핑에 좋고, JavaScript로 통일해서 개발 속도도 빠를 거예요.