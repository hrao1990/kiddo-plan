import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

const authRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

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

authRoutes.post('/register', async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ message: 'Username and password required' }, 400)
  }

  if (password.length < 8) {
    return c.json({ message: 'Password must be at least 8 characters' }, 400)
  }

  let types = 0
  if (/[a-z]/.test(password)) types++
  if (/[A-Z]/.test(password)) types++
  if (/[0-9]/.test(password)) types++
  if (/[^a-zA-Z0-9]/.test(password)) types++
  if (types < 2) {
    return c.json({ message: 'Password must include at least 2 of: uppercase, lowercase, digits, symbols' }, 400)
  }

  const maxUsers = parseInt(c.env.MAX_USERS || '50')
  const row = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<{ count: number }>()
  const count = row?.count || 0
  if (count >= maxUsers) {
    return c.json({ message: 'User limit reached, please contact admin' }, 400)
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()
  if (existing) {
    return c.json({ message: 'Username already exists' }, 400)
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  await c.env.DB.prepare(
    'INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)'
  ).bind(username, passwordHash, salt, 'user').run()

  return c.json({ message: 'Registration successful' })
})

authRoutes.post('/login', async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ message: 'Username and password required' }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT id, username, password_hash, salt, role, is_disabled FROM users WHERE username = ?'
  ).bind(username).first<{ id: number; username: string; password_hash: string; salt: string; role: string; is_disabled: number }>()

  if (!user) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  if (user.is_disabled) {
    return c.json({ message: 'Account disabled, please contact admin' }, 403)
  }

  const passwordHash = await hashPassword(password, user.salt)
  if (passwordHash !== user.password_hash) {
    return c.json({ message: 'Invalid credentials' }, 401)
  }

  const { sign } = await import('hono/jwt')
  const token = await sign(
    { sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 86400 },
    c.env.JWT_SECRET
  )

  return c.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  })
})

authRoutes.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare(
    'SELECT id, username, role FROM users WHERE id = ?'
  ).bind(userId).first<{ id: number; username: string; role: string }>()

  if (!user) {
    return c.json({ message: 'User not found' }, 404)
  }

  return c.json({ user })
})

export { authRoutes }
