# AgentOS — AI Agent Dashboard

A full-stack AI agent orchestration dashboard built with Next.js, Claude AI, PostgreSQL, and Redis. Users submit tasks and watch multiple AI agents (Web Search, Summarizer, Code Runner, Analyst) work in real time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + React |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (Google + GitHub) |
| AI | Anthropic Claude API |
| Database | PostgreSQL via Prisma ORM |
| Queue | BullMQ + Redis |
| Deploy | Vercel (frontend) + Neon (DB) + Upstash (Redis) |

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/ai-agent-dashboard.git
cd ai-agent-dashboard
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in each value in `.env.local` (see the comments in `.env.example` for where to get each one).

### 3. Set up the database

Create a free PostgreSQL database at [neon.tech](https://neon.tech), copy the connection string into `DATABASE_URL`, then run:

```bash
npm run db:push
```

### 4. Set up Redis

Create a free Redis instance at [upstash.com](https://upstash.com). Copy the Redis URL into `REDIS_URL`.

### 5. Set up OAuth (pick at least one)

**Google:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
4. Copy Client ID and Secret into `.env.local`

**GitHub:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL to `http://localhost:3000`
4. Set Callback URL to `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Secret into `.env.local`

### 6. Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Paste the output as `NEXTAUTH_SECRET` in `.env.local`.

### 7. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-agent-dashboard.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Click **Environment Variables** and add every variable from `.env.example` with real values
4. For `NEXTAUTH_URL` use your Vercel deployment URL (e.g. `https://ai-agent-dashboard.vercel.app`)
5. For OAuth callbacks, update the redirect URIs in Google/GitHub to use your Vercel URL
6. Click **Deploy**

### Step 3 — Push the database schema

After first deploy, run locally (the DATABASE_URL points to Neon):

```bash
npm run db:push
```

---

## Project Structure

```
ai-agent-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth endpoints
│   │   └── tasks/
│   │       ├── route.ts                  # GET /api/tasks, POST /api/tasks
│   │       └── [id]/route.ts             # GET /api/tasks/:id (polling)
│   ├── auth/signin/page.tsx              # Sign-in page
│   ├── dashboard/page.tsx                # Main dashboard UI
│   ├── globals.css                       # Global styles
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing page
│   └── providers.tsx                     # SessionProvider wrapper
├── lib/
│   ├── auth.ts                           # NextAuth config
│   ├── orchestrator.ts                   # Agent orchestration logic
│   ├── prisma.ts                         # Prisma client singleton
│   └── redis.ts                          # Redis client singleton
├── prisma/
│   └── schema.prisma                     # Database schema
├── types/
│   └── next-auth.d.ts                    # Session type extension
├── .env.example                          # Environment variable template
├── vercel.json                           # Vercel config
└── README.md
```

---

## How It Works

1. **User submits a task** via the dashboard input
2. **POST /api/tasks** creates a Task record in PostgreSQL and starts the orchestrator
3. **Orchestrator** calls Claude to decide which agents are needed (web_search, summarizer, code_runner, analyst)
4. **Each agent** is created as an Agent record in DB and runs concurrently via `Promise.all`
5. **Frontend polls** GET /api/tasks/:id every 2 seconds to get live status updates
6. **Results appear** in the dashboard as each agent completes

---

## Agents

| Agent | What it does |
|-------|-------------|
| 🔍 Web Search | Researches the topic and returns key findings |
| 📝 Summarizer | Creates a structured summary of the task |
| ⚡ Code Runner | Writes and explains code relevant to the task |
| 📊 Analyst | Provides deep analysis and recommendations |

---

## What to say in interviews

> "I built a full-stack AI agent orchestration system. Users submit tasks and a central orchestrator — powered by Claude — decides which specialized agents to deploy: web search, summarizer, code runner, and analyst. Agents run concurrently and persist results to PostgreSQL. The frontend polls for live status updates and renders results per agent. The stack is Next.js, Prisma, Anthropic API, and NextAuth for OAuth."

---

## License

MIT
