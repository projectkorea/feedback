# 배포 & 개발 환경

## 로컬 개발 환경

### 빠른 시작
```bash
# 프로젝트 클론 후
pnpm install

# 전체 개발 서버 실행
pnpm dev

# 개별 실행
pnpm dev:server    # Fastify API 서버 (포트 3001)
pnpm dev:dashboard # 대시보드 (포트 3002)
```

### 환경변수 설정
```bash
# apps/server/.env
JWT_SECRET=your-secret-key
PORT=3001
NODE_ENV=development
DATABASE_URL=./feedback.sqlite

# apps/dashboard/.env.local  
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_TOKEN=your-jwt-token
```

## pnpm workspace 스크립트

### package.json (루트)
```json
{
  "scripts": {
    "build": "pnpm -r --filter='!examples/*' build",
    "dev": "pnpm -r --parallel dev",
    "dev:server": "pnpm --filter=server dev",
    "dev:dashboard": "pnpm --filter=dashboard dev",
    "dev:examples": "pnpm --filter='examples/*' dev",
    "test": "pnpm -r test",
    "clean": "pnpm -r clean && rm -rf node_modules/.pnpm",
    "build:sdk": "pnpm --filter=vanilla build && pnpm --filter=react build",
    "preview": "pnpm build && pnpm dev",
    "type-check": "pnpm -r type-check"
  }
}
```

## Docker 개발 환경

### docker-compose.yml
```yaml
version: '3.8'

services:
  server:
    build: 
      context: .
      dockerfile: apps/server/Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - JWT_SECRET=dev-secret-key
      - PORT=3001
    volumes:
      - ./apps/server/data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  dashboard:
    build:
      context: .
      dockerfile: apps/dashboard/Dockerfile
    ports:
      - "3002:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://server:3001
      - JWT_TOKEN=your-jwt-token
    depends_on:
      - server

  examples:
    build:
      context: .
      dockerfile: examples/Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./examples:/app/examples
      - ./packages:/app/packages
    depends_on:
      - server
```

### Fastify 서버 Dockerfile
```dockerfile
# apps/server/Dockerfile
FROM node:18-alpine

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사
COPY package.json pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY packages/shared ./packages/shared/
COPY apps/server ./apps/server/

# 빌드
RUN pnpm build:shared
RUN pnpm --filter=server build

# 데이터 디렉토리 생성
RUN mkdir -p /app/data

# 포트 노출
EXPOSE 3001

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# 서버 실행
CMD ["pnpm", "--filter=server", "start"]
```

### 대시보드 Dockerfile
```dockerfile
# apps/dashboard/Dockerfile
FROM node:18-alpine

WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사
COPY package.json pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY apps/dashboard ./apps/dashboard/

# 빌드
RUN pnpm --filter=dashboard build

# 포트 노출
EXPOSE 3000

# Next.js 실행
CMD ["pnpm", "--filter=dashboard", "start"]
```

## 프로덕션 배포

### Vercel 배포 (대시보드)
```json
// vercel.json
{
  "builds": [
    {
      "src": "apps/dashboard/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/dashboard/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "JWT_TOKEN": "@jwt-token"
  }
}
```

### Railway 배포 (Fastify API)
```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pnpm install && pnpm build:shared && pnpm --filter=server build"

[deploy]
startCommand = "pnpm --filter=server start"
restartPolicyType = "on_failure"
healthcheckPath = "/health"
healthcheckTimeout = 10

[[envs]]
environment = "production"
SERVICE_NAME = "feedback-api"

[variables]
NODE_ENV = "production"
PORT = { default = "3001" }
```

### Fly.io 배포 (Fastify API)
```toml
# fly.toml
app = "feedback-api"
primary_region = "nrt"

[build]
  dockerfile = "apps/server/Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20

[checks]
  [checks.health]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    path = "/health"
    timeout = "5s"
```

### CDN 배포 (SDK)
```bash
# SDK 빌드 및 CDN 업로드
pnpm build:sdk

# AWS S3 + CloudFront
aws s3 cp packages/vanilla/dist/ s3://cdn.yoursite.com/feedback-sdk@1.0.0/ --recursive
aws s3 cp packages/react/dist/ s3://cdn.yoursite.com/feedback-react@1.0.0/ --recursive

# CloudFlare R2
wrangler r2 object put feedback-cdn/vanilla/feedback-sdk.min.js --file=packages/vanilla/dist/index.js
wrangler r2 object put feedback-cdn/react/feedback-react.min.js --file=packages/react/dist/index.js
```

## CI/CD 설정

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
        
      - name: Build
        run: pnpm build
      
      - name: Test
        run: pnpm test

  deploy-api:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        uses: railway-deploy@v1
        with:
          service: feedback-api
          environment: production
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          
  deploy-dashboard:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: apps/dashboard
          
  deploy-sdk:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Build SDK
        run: |
          pnpm install --frozen-lockfile
          pnpm build:sdk
          
      - name: Deploy to CDN
        run: |
          aws s3 sync packages/vanilla/dist/ s3://${{ secrets.CDN_BUCKET }}/feedback-sdk@${{ github.sha }}/ 
          aws s3 sync packages/react/dist/ s3://${{ secrets.CDN_BUCKET }}/feedback-react@${{ github.sha }}/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 모니터링 설정

### Fastify 로깅 및 메트릭
```typescript
// apps/server/src/monitoring.ts
import fp from 'fastify-plugin'

export default fp(async function (fastify) {
  // Prometheus 메트릭
  await fastify.register(require('@fastify/metrics'), {
    endpoint: '/metrics'
  })
  
  // 요청 로깅
  fastify.addHook('onRequest', async (request) => {
    request.log.info({
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent']
    }, 'Incoming request')
  })
  
  // 에러 핸들링
  fastify.setErrorHandler(async (error, request, reply) => {
    request.log.error({
      error: error.message,
      stack: error.stack,
      method: request.method,
      url: request.url
    }, 'Request error')
    
    reply.status(error.statusCode || 500).send({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  })
})
```

### 헬스체크 확장
```typescript
// apps/server/src/routes/health.ts
import { FastifyInstance } from 'fastify'
import Database from 'better-sqlite3'

export default async function healthRoutes(fastify: FastifyInstance) {
  // 기본 헬스체크
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    }
  })
  
  // 상세 헬스체크
  fastify.get('/health/detailed', async () => {
    const checks = {
      database: false,
      memory: false,
      disk: false
    }
    
    try {
      // DB 연결 체크
      const db = new Database('feedback.sqlite')
      db.prepare('SELECT 1').get()
      checks.database = true
      db.close()
    } catch (error) {
      fastify.log.error('Database health check failed:', error)
    }
    
    // 메모리 사용량 체크
    const memUsage = process.memoryUsage()
    checks.memory = memUsage.heapUsed < memUsage.heapTotal * 0.9
    
    const allHealthy = Object.values(checks).every(Boolean)
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      memory: memUsage,
      timestamp: new Date().toISOString()
    }
  })
}
```

## 환경별 설정

### 개발환경
```bash
# .env.development
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-secret-key
LOG_LEVEL=debug
DATABASE_URL=./feedback.sqlite
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
```

### 스테이징
```bash
# .env.staging
NODE_ENV=staging
PORT=3001
JWT_SECRET=${STAGING_JWT_SECRET}
LOG_LEVEL=info
DATABASE_URL=./feedback-staging.sqlite
CORS_ORIGIN=https://staging.yourapp.com
```

### 프로덕션
```bash
# .env.production
NODE_ENV=production
PORT=${PORT}
JWT_SECRET=${JWT_SECRET}
LOG_LEVEL=warn
DATABASE_URL=${DATABASE_URL}
CORS_ORIGIN=https://yourapp.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

## 트러블슈팅

### 흔한 문제들

1. **pnpm workspace 의존성 문제**
```bash
# 캐시 클리어
pnpm store prune
rm -rf node_modules/.pnpm
pnpm install
```

2. **Fastify 플러그인 로딩 오류**
```bash
# async/await 사용 확인
# 플러그인 등록 순서 확인
# 스키마 검증 에러 로그 확인
```

3. **SQLite 권한 문제**
```bash
# 데이터 디렉토리 권한 설정
mkdir -p apps/server/data
chmod 755 apps/server/data
chown -R $USER:$USER apps/server/data
```

4. **메모리 사용량 최적화**
```typescript
// Fastify 메모리 설정
const fastify = Fastify({
  logger: true,
  trustProxy: true,
  bodyLimit: 1048576, // 1MB
  keepAliveTimeout: 5000
})
```

## 성능 최적화

### Fastify 최적화
```typescript
// 성능 튜닝 옵션
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  },
  disableRequestLogging: process.env.NODE_ENV === 'production',
  trustProxy: true,
  querystringParser: str => new URLSearchParams(str)
})

// 압축 활성화
await fastify.register(require('@fastify/compress'), {
  global: true
})

// 정적 파일 캐싱
await fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  maxAge: '1y'
})
```

### 빌드 최적화
- **tsup**으로 빠른 TypeScript 빌드
- **Tree shaking** 자동 적용
- **Code splitting** (React SDK)
- **pnpm**의 효율적 의존성 관리

### 런타임 최적화
- **Fastify**의 빠른 JSON 직렬화
- **SQLite**의 인메모리 캐싱
- **스키마 기반 검증**으로 빠른 요청 처리