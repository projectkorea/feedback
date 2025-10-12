# Feedback SDK

A **monorepo SDK** system for easily collecting user feedback.

---

## 🚀 Quick Start

### Option 1: Docker (Recommended - 5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/feedback-sdk.git
cd feedback-sdk

# 2. Set up notification platforms (optional but recommended)
# Edit packages/server/.env and configure:
# - SLACK_WEBHOOK_URL for Slack
# - DISCORD_WEBHOOK_URL for Discord
# - TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID for Telegram
# You can enable multiple platforms at once!

# 3. Start everything with Docker
docker-compose up

# 4. Open your browser
# React Demo: http://localhost:5173
# API Server: http://localhost:3001/health
```

That's it! 🎉 The entire system is now running:
- ✅ API Server at http://localhost:3001
- ✅ React Demo at http://localhost:5173
- ✅ SQLite database automatically created
- ✅ Demo project (`pk_demo_key`) automatically seeded
- ✅ Multi-platform notifications (Slack/Discord/Telegram) enabled (if configured)

### Option 2: Manual Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cd packages/server
cp .env.example .env
# Edit .env and set your preferred notification platforms

# 3. Start API server
pnpm dev  # http://localhost:3001

# 4. In another terminal, start React demo
cd examples/react-demo
pnpm dev  # http://localhost:5173
```

### Setting Up Notification Platforms 🌐

Edit `packages/server/.env` to enable your preferred platforms:

#### Slack 💬
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```
[Create Slack App](https://api.slack.com/apps) → Incoming Webhooks → Copy URL

#### Discord 🎮
```bash
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK/URL
```
Server Settings → Integrations → Webhooks → Create Webhook

#### Telegram ✈️
```bash
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_CHAT_ID
```
1. Create bot via [@BotFather](https://t.me/botfather)
2. Add bot to your group/channel
3. Get chat ID from: `https://api.telegram.org/bot<TOKEN>/getUpdates`

**✨ You can enable multiple platforms simultaneously!**

### Testing the Feedback Flow

#### React Demo (Vite)

```bash
# Using Docker (recommended)
docker-compose up
# Then open: http://localhost:5173

# Or manually
pnpm demo:react
```

#### Vanilla JS Demo

```bash
# From root
pnpm demo:js
# Then open: http://localhost:8080
```

**Steps:**

1. Open the demo URL
2. See the beautiful UI showcasing all supported platforms (Slack, Discord, Telegram)
3. Click the 💬 button in the bottom-right corner
4. Fill out the feedback form and submit
5. Check ALL your enabled platforms for notifications! 🎉

---

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Stop and remove volumes (resets database)
docker-compose down -v
```

---

## 🗂 Project Structure

```
feedback/
├── packages/
│   ├── core/           # Shared logic (API client, utilities)
│   ├── js-sdk/         # JavaScript SDK
│   ├── react-sdk/      # React SDK
│   └── api-server/     # Fastify API server
└── examples/
    ├── js-demo/        # JavaScript SDK demo
    └── react-demo/     # React SDK demo (Vite)
```

---

## ✨ Features

### SDK

* 💬 Floating feedback button
* 🐛 / ✨ / 🚀 Category selection (Bug / Feature / Improvement)
* 🎛 Feedback modal (rating, message, email)
* 🔔 Toast notifications (success & error)
* 🧠 Automatic metadata collection (ID, timestamp, URL, browser)
* 🔄 Available for both JavaScript and React

### Server

* 🧱 Create / Retrieve projects
* 💾 Store, list, filter, and aggregate feedback
* 🔑 Public Key authentication
* 🌐 CORS & Rate limiting support
* 📢 **Multi-platform notifications: Slack, Discord, Telegram**
* ⚡ Async notification sending (non-blocking)

---

## ⚙️ Tech Stack

| Layer         | Stack                                 |
| ------------- | ------------------------------------- |
| **Frontend**  | JavaScript (ES6), React 18, Fetch API |
| **Backend**   | Fastify 4.x, SQLite (better-sqlite3)  |
| **Dev Tools** | pnpm workspaces, Vite                 |

---

## 🧭 API Endpoints

| Method | Endpoint              | Description                         |
| ------ | --------------------- | ----------------------------------- |
| `POST` | `/api/projects`       | Create project                      |
| `GET`  | `/api/projects/:id`   | Get project                         |
| `POST` | `/api/feedback`       | Submit feedback                     |
| `GET`  | `/api/feedback`       | List feedback (pagination, filters) |
| `GET`  | `/api/feedback/stats` | Feedback statistics                 |
| `GET`  | `/api/settings`       | Get settings                        |
| `GET`  | `/health`             | Health check                        |

**Auth Headers:**
`X-Public-Key`, `X-Project-Id`

**Example Filter:**
`?page=1&limit=20&category=bug&minRating=3`

---

## 🧪 Testing

### API Tests

```bash
# Health check
curl http://localhost:3001/health

# Create project
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My Project"}'

# Send feedback (id, timestamp auto-generated by client)
curl -X POST http://localhost:3001/api/feedback \
  -H "Content-Type: application/json" \
  -H "X-Public-Key: YOUR_PUBLIC_KEY" \
  -H "X-Project-Id: YOUR_PROJECT_ID" \
  -d '{
    "id": "unique-uuid",
    "type": "floating",
    "category": "bug",
    "message": "test message",
    "rating": 5,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }'

# Get feedback list
curl http://localhost:3001/api/feedback?page=1&limit=10 \
  -H "X-Public-Key: YOUR_PUBLIC_KEY" \
  -H "X-Project-Id: YOUR_PROJECT_ID"

# Get feedback stats
curl http://localhost:3001/api/feedback/stats \
  -H "X-Public-Key: YOUR_PUBLIC_KEY" \
  -H "X-Project-Id: YOUR_PROJECT_ID"
```


---

## 🧰 Troubleshooting

| Issue                | Solution                                                       |
| -------------------- | -------------------------------------------------------------- |
| **CORS Error**       | Make sure the API server is running at `http://localhost:3001` |
| **Auth Failed**      | Verify `publicKey` / `projectId` and project activation status |
| **Dependency Issue** | Run `pnpm install` (globally or inside each package)           |

---

## 🗄 Database Schema

### `projects` Table

| Column       | Type    | Note         |
| ------------ | ------- | ------------ |
| `id`         | TEXT    | Primary key  |
| `name`       | TEXT    | Project name |
| `public_key` | TEXT    | Unique       |
| `is_active`  | INTEGER | Default: 1   |
| `created_at` | INTEGER | Timestamp    |

### `feedback` Table

| Column                               | Type    | Note                              |
| ------------------------------------ | ------- | --------------------------------- |
| `id`                                 | TEXT    | Primary key                       |
| `project_id`                         | TEXT    | Foreign key                       |
| `type`                               | TEXT    | `floating` / `settings`           |
| `category`                           | TEXT    | `bug` / `feature` / `improvement` |
| `rating`                             | INTEGER | 1–5                               |
| `message`                            | TEXT    | Feedback message                  |
| `user_email`                         | TEXT    | Optional                          |
| `page_url`                           | TEXT    | Page where feedback was sent      |
| `user_agent`, `language`, `platform` | TEXT    | Metadata                          |
| `timestamp`                          | TEXT    | ISO timestamp                     |
| `created_at`                         | INTEGER | Created date                      |

---

## 📜 License

[MIT](./LICENSE)
