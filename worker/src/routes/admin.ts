import { Hono } from 'hono'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

type Env = { Bindings: Bindings; Variables: Variables }

const adminRoutes = new Hono<Env>()

adminRoutes.use('*', authMiddleware)
adminRoutes.use('*', adminMiddleware)

adminRoutes.get('/users', async (c) => {
  const { results } = await c.env.db.prepare(
    'SELECT id, username, role, is_disabled, created_at FROM users ORDER BY created_at DESC'
  ).all()

  return c.json({ users: results })
})

adminRoutes.put('/users/:id/toggle', async (c) => {
  const id = parseInt(c.req.param('id'))

  const user = await c.env.db.prepare(
    'SELECT id, role FROM users WHERE id = ?'
  ).bind(id).first<{ id: number; role: string }>()

  if (!user || user.role === 'admin') {
    return c.json({ message: 'Cannot toggle admin' }, 400)
  }

  await c.env.db.prepare(
    'UPDATE users SET is_disabled = CASE WHEN is_disabled = 0 THEN 1 ELSE 0 END WHERE id = ?'
  ).bind(id).run()

  return c.json({ message: 'User status toggled' })
})

adminRoutes.put('/users/:id/reset-password', async (c) => {
  const id = parseInt(c.req.param('id'))
  const { newPassword } = await c.req.json()

  if (!newPassword) {
    return c.json({ message: 'New password required' }, 400)
  }

  if (newPassword.length < 8) {
    return c.json({ message: 'Password must be at least 8 characters' }, 400)
  }

  let types = 0
  if (/[a-z]/.test(newPassword)) types++
  if (/[A-Z]/.test(newPassword)) types++
  if (/[0-9]/.test(newPassword)) types++
  if (/[^a-zA-Z0-9]/.test(newPassword)) types++
  if (types < 2) {
    return c.json({ message: 'Password must include at least 2 of: uppercase, lowercase, digits, symbols' }, 400)
  }

  const user = await c.env.db.prepare(
    'SELECT id FROM users WHERE id = ?'
  ).bind(id).first<{ id: number }>()

  if (!user) {
    return c.json({ message: 'User not found' }, 404)
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

  const salt = generateSalt()
  const passwordHash = await hashPassword(newPassword, salt)
  await c.env.db.prepare(
    'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?'
  ).bind(passwordHash, salt, id).run()

  return c.json({ message: 'Password reset successfully' })
})

adminRoutes.delete('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'))

  const user = await c.env.db.prepare(
    'SELECT id, role FROM users WHERE id = ?'
  ).bind(id).first<{ id: number; role: string }>()

  if (!user || user.role === 'admin') {
    return c.json({ message: 'Cannot delete admin' }, 400)
  }

  await c.env.db.prepare('DELETE FROM score_logs WHERE user_id = ?').bind(id).run()
  await c.env.db.prepare('DELETE FROM presets WHERE user_id = ?').bind(id).run()

  const { results: children } = await c.env.db.prepare(
    'SELECT id FROM children WHERE user_id = ?'
  ).bind(id).all<{ id: number }>()

  for (const child of children) {
    await c.env.db.prepare('DELETE FROM score_logs WHERE child_id = ?').bind(child.id).run()
  }

  await c.env.db.prepare('DELETE FROM children WHERE user_id = ?').bind(id).run()
  await c.env.db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()

  return c.json({ message: 'User deleted' })
})

export { adminRoutes }
