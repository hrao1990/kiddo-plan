import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { childrenRoutes } from './routes/children'
import { presetsRoutes } from './routes/presets'
import { pointsRoutes } from './routes/points'
import { dashboardRoutes } from './routes/dashboard'
import { adminRoutes } from './routes/admin'
import type { Bindings } from './types'

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  is_disabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS children (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS score_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  preset_id INTEGER,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (preset_id) REFERENCES presets(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_children_user_id ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON presets(user_id);
CREATE INDEX IF NOT EXISTS idx_score_logs_child_id ON score_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_score_logs_created_at ON score_logs(created_at);
`

async function ensureSchema(env: Bindings) {
  const flag = await env.KV.get('schema_initialized')
  if (flag) return

  const statements = SCHEMA_SQL.split(';').filter(s => s.trim())
  for (const stmt of statements) {
    await env.DB.prepare(stmt).run()
  }

  await env.KV.put('schema_initialized', 'true')
}

async function ensureAdmin(env: Bindings) {
  const flag = await env.KV.get('admin_initialized')
  if (flag) return

  const row = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").first<{ count: number }>()
  if ((!row || row.count === 0) && env.ADMIN_USERNAME && env.ADMIN_PASSWORD) {
    const salt = generateSalt()
    const passwordHash = await hashPassword(env.ADMIN_PASSWORD, salt)
    await env.DB.prepare(
      'INSERT OR IGNORE INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)'
    ).bind(env.ADMIN_USERNAME, passwordHash, salt, 'admin').run()
  }

  await env.KV.put('admin_initialized', 'true')
}

function generateSalt(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(password + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('')
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.use('*', async (c, next) => {
  await ensureSchema(c.env)
  await ensureAdmin(c.env)
  await next()
})

app.route('/api/auth', authRoutes)
app.route('/api/children', childrenRoutes)
app.route('/api/presets', presetsRoutes)
app.route('/api/points', pointsRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/admin', adminRoutes)

app.get('/api/config', (c) => {
  return c.json({
    maxUsers: parseInt(c.env.MAX_USERS || '50'),
    maxChildrenPerUser: parseInt(c.env.MAX_CHILDREN_PER_USER || '5'),
  })
})

export default {
  async fetch(request: Request, env: Bindings, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx)
    }

    const assetResponse = await env.ASSETS.fetch(request)
    if (assetResponse.status === 200) {
      return assetResponse
    }

    const indexResponse = await env.ASSETS.fetch(new Request(new URL('/', url)))
    return indexResponse
  },
}
