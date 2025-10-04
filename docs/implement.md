# 구현 가이드

## 1. 공통 코드 (packages/shared)

### 타입 정의
```typescript
// packages/shared/src/types.ts
import { z } from 'zod'

export const feedbackSchema = z.object({
  id: z.string().uuid(),
  message: z.string().min(1),
  rating: z.number().min(1).max(5),
  category: z.enum(['bug', 'feature', 'improvement']),
  metadata: z.object({
    url: z.string().url(),
    userAgent: z.string(),
    timestamp: z.string().datetime()
  })
})

export type FeedbackData = z.infer<typeof feedbackSchema>

export interface SDKConfig {
  apiKey: string
  apiUrl?: string
  theme?: 'light' | 'dark' | 'auto'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}
```

### API 클라이언트
```typescript
// packages/shared/src/api.ts
export class FeedbackAPI {
  constructor(private config: SDKConfig) {}

  async submit(data: Omit<FeedbackData, 'id' | 'metadata'>) {
    const feedbackData: FeedbackData = {
      ...data,
      id: crypto.randomUUID(),
      metadata: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }

    const response = await fetch(`${this.config.apiUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(feedbackData)
    })

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`)
    }

    return response.json()
  }
}
```

## 2. Vanilla SDK (packages/vanilla)

### 메인 SDK 클래스
```typescript
// packages/vanilla/src/index.ts
import { SDKConfig, FeedbackAPI } from '@feedback/shared'

class FeedbackWidget extends HTMLElement {
  private api: FeedbackAPI
  private shadow: ShadowRoot

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'closed' })
  }

  init(config: SDKConfig) {
    this.api = new FeedbackAPI(config)
    this.render(config)
    this.attachEvents()
  }

  private async render(config: SDKConfig) {
    const sheet = new CSSStyleSheet()
    await sheet.replace(`
      :host {
        position: fixed;
        ${config.position?.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
        ${config.position?.includes('right') ? 'right: 20px;' : 'left: 20px;'}
        z-index: 999999;
      }
      .feedback-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        border-radius: 50px;
        width: 60px;
        height: 60px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
    `)
    
    this.shadow.adoptedStyleSheets = [sheet]
    this.shadow.innerHTML = `
      <button class="feedback-btn" aria-label="Send Feedback">💬</button>
    `
  }

  private attachEvents() {
    const btn = this.shadow.querySelector('.feedback-btn')
    btn?.addEventListener('click', () => this.openModal())
  }

  private openModal() {
    const dialog = document.createElement('dialog')
    dialog.innerHTML = `
      <form method="dialog">
        <h2>피드백 보내기</h2>
        
        <select name="category" required>
          <option value="bug">🐛 버그 신고</option>
          <option value="feature">✨ 기능 요청</option>
          <option value="improvement">🚀 개선 제안</option>
        </select>

        <div class="rating">
          ${[1,2,3,4,5].map(i => `
            <input type="radio" name="rating" value="${i}" id="rating-${i}" required>
            <label for="rating-${i}">⭐</label>
          `).join('')}
        </div>

        <textarea name="message" required 
                  placeholder="자세한 피드백을 남겨주세요..."></textarea>
        
        <div class="actions">
          <button type="button" onclick="this.closest('dialog').close()">취소</button>
          <button type="submit">전송</button>
        </div>
      </form>
    `
    
    document.body.appendChild(dialog)
    dialog.showModal()
    
    dialog.addEventListener('close', async () => {
      if (dialog.returnValue === 'submit') {
        const formData = new FormData(dialog.querySelector('form')!)
        await this.submitFeedback(formData)
      }
      dialog.remove()
    })
  }

  private async submitFeedback(formData: FormData) {
    try {
      await this.api.submit({
        message: formData.get('message') as string,
        rating: parseInt(formData.get('rating') as string),
        category: formData.get('category') as 'bug' | 'feature' | 'improvement'
      })
      this.showToast('피드백이 전송되었습니다! 🎉', 'success')
    } catch (error) {
      this.showToast('전송 중 오류가 발생했습니다.', 'error')
    }
  }

  private showToast(message: string, type: 'success' | 'error') {
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      padding: 16px 24px; border-radius: 8px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white; z-index: 1000000;
    `
    
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
}

customElements.define('feedback-widget', FeedbackWidget)

export function initFeedback(config: SDKConfig) {
  const widget = document.createElement('feedback-widget') as FeedbackWidget
  widget.init(config)
  document.body.appendChild(widget)
  return widget
}
```

## 3. React SDK (packages/react)

### Context Provider
```typescript
// packages/react/src/index.tsx
'use client'
import { createContext, useContext, ReactNode, useState } from 'react'
import { SDKConfig, FeedbackAPI } from '@feedback/shared'

const FeedbackContext = createContext<{
  config: SDKConfig
  api: FeedbackAPI
} | null>(null)

export function FeedbackProvider({ 
  children, 
  config 
}: { 
  children: ReactNode
  config: SDKConfig 
}) {
  const api = new FeedbackAPI(config)
  
  return (
    <FeedbackContext.Provider value={{ config, api }}>
      {children}
      <FeedbackWidget />
    </FeedbackContext.Provider>
  )
}

function FeedbackWidget() {
  const context = useContext(FeedbackContext)
  const [isOpen, setIsOpen] = useState(false)
  
  if (!context) return null
  
  const { config } = context
  const position = config.position || 'bottom-right'
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-[999999] w-15 h-15 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
        style={{
          [position.includes('bottom') ? 'bottom' : 'top']: '20px',
          [position.includes('right') ? 'right' : 'left']: '20px'
        }}
      >
        💬
      </button>
      
      {isOpen && <FeedbackModal onClose={() => setIsOpen(false)} />}
    </>
  )
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const context = useContext(FeedbackContext)!
  const [rating, setRating] = useState(0)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      await context.api.submit({
        message: formData.get('message') as string,
        rating,
        category: formData.get('category') as 'bug' | 'feature' | 'improvement'
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }
  
  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-6">피드백 보내기 ✨</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <select name="category" required className="w-full p-3 border rounded-lg">
            <option value="bug">🐛 버그 신고</option>
            <option value="feature">✨ 기능 요청</option>
            <option value="improvement">🚀 개선 제안</option>
          </select>
          
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className="text-2xl"
              >
                ⭐
              </button>
            ))}
          </div>
          
          <textarea
            name="message"
            required
            placeholder="자세한 피드백을 남겨주세요..."
            className="w-full p-3 border rounded-lg min-h-[120px]"
          />
          
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit" disabled={rating === 0}>전송</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const useFeedback = () => {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider')
  }
  return {
    openModal: () => {}, // 구현 필요
    submitFeedback: context.api.submit
  }
}
```

## 4. API 서버 (apps/server)

### Fastify 앱
```typescript
// apps/server/src/index.ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import Database from 'better-sqlite3'

// Fastify 타입 확장
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty'
    } : undefined
  }
})

// 데이터베이스 초기화
const db = new Database('feedback.sqlite')

db.exec(`
  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    message TEXT NOT NULL,
    rating INTEGER NOT NULL,
    category TEXT NOT NULL,
    url TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )
`)

// 플러그인 등록
await fastify.register(cors, {
  origin: true,
  credentials: true
})

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret'
})

// JWT 인증 데코레이터
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

// 스키마 정의
const feedbackSchema = {
  type: 'object',
  required: ['id', 'message', 'rating', 'category', 'metadata'],
  properties: {
    id: { type: 'string' },
    message: { type: 'string', minLength: 1 },
    rating: { type: 'integer', minimum: 1, maximum: 5 },
    category: { type: 'string', enum: ['bug', 'feature', 'improvement'] },
    metadata: {
      type: 'object',
      required: ['url', 'userAgent', 'timestamp'],
      properties: {
        url: { type: 'string' },
        userAgent: { type: 'string' },
        timestamp: { type: 'string' }
      }
    }
  }
}

// 피드백 제출 엔드포인트
fastify.post('/api/feedback', {
  schema: {
    body: feedbackSchema,
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          success: { type: 'boolean' }
        }
      }
    }
  },
  preHandler: fastify.authenticate
}, async (request, reply) => {
  const data = request.body as any
  
  const stmt = db.prepare(`
    INSERT INTO feedback (id, message, rating, category, url, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  
  try {
    stmt.run(
      data.id,
      data.message,
      data.rating,
      data.category,
      data.metadata.url,
      data.metadata.userAgent,
      Date.now()
    )
    
    return { id: data.id, success: true }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to save feedback' })
  }
})

// 피드백 목록 조회 엔드포인트
fastify.get('/api/feedback', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          feedback: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                message: { type: 'string' },
                rating: { type: 'integer' },
                category: { type: 'string' },
                url: { type: 'string' },
                user_agent: { type: 'string' },
                created_at: { type: 'integer' }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              pages: { type: 'integer' }
            }
          }
        }
      }
    }
  },
  preHandler: fastify.authenticate
}, async (request, reply) => {
  const { page = 1, limit = 10 } = request.query as any
  const offset = (page - 1) * limit
  
  try {
    const stmt = db.prepare(`
      SELECT * FROM feedback 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `)
    
    const feedback = stmt.all(limit, offset)
    
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM feedback')
    const { count } = countStmt.get() as { count: number }
    
    return {
      feedback,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  } catch (error) {
    fastify.log.error(error)
    reply.code(500).send({ error: 'Failed to fetch feedback' })
  }
})

// 헬스 체크
fastify.get('/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})

// 서버 시작
const start = async () => {
  try {
    await fastify.listen({ 
      port: Number(process.env.PORT) || 3001,
      host: '0.0.0.0'
    })
    fastify.log.info('🚀 Server running on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

## 5. Next.js 대시보드 (apps/dashboard)

### 피드백 목록 페이지
```typescript
// apps/dashboard/src/app/page.tsx
import { Suspense } from 'react'

async function getFeedback() {
  const res = await fetch('http://localhost:3001/api/feedback', {
    headers: {
      'Authorization': `Bearer ${process.env.JWT_TOKEN}`
    }
  })
  
  if (!res.ok) {
    throw new Error('Failed to fetch feedback')
  }
  
  return res.json()
}

export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">피드백 대시보드</h1>
      
      <Suspense fallback={<div>로딩중...</div>}>
        <FeedbackList />
      </Suspense>
    </div>
  )
}

async function FeedbackList() {
  const { feedback } = await getFeedback()
  
  return (
    <div className="grid gap-4">
      {feedback.map((item: any) => (
        <div key={item.id} className="p-4 border rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="px-2 py-1 text-xs bg-gray-100 rounded">
              {item.category}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-medium">{item.rating}/5</span>
            </div>
          </div>
          <p className="mb-2 text-gray-800">{item.message}</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>URL: {item.url}</div>
            <div>{new Date(item.created_at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

## 핵심 구현 원칙

1. **타입 안전성**: Fastify의 스키마 기반 검증으로 런타임 안전성 보장
2. **웹 표준**: Web Components, Dialog API 활용
3. **성능 최적화**: Fastify의 고속 JSON 처리와 스키마 검증
4. **구조적 검증**: JSON Schema로 요청/응답 검증
5. **에러 처리**: 구조화된 에러 응답과 로깅
6. **확장성**: Fastify 플러그인 시스템 활용