import { Hono } from 'hono'
import { authMiddleware, adminMiddleware } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

type Env = { Bindings: Bindings; Variables: Variables }

const adminRoutes = new Hono<Env>()

adminRoutes.use('*', authMiddleware)
adminRoutes.use('*', adminMiddleware)

adminRoutes.get('/users', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, username, role, is_disabled, created_at FROM users ORDER BY created_at DESC'
  ).all()

  return c.json({ users: results })
})

adminRoutes.put('/users/:id/toggle', async (c) => {
  const id = parseInt(c.req.param('id'))

  const user = await c.env.DB.prepare(
    'SELECT id, role FROM users WHERE id = ?'
  ).bind(id).first<{ id: number; role: string }>()

  if (!user || user.role === 'admin') {
    return c.json({ message: 'Cannot toggle admin' }, 400)
  }

  await c.env.DB.prepare(
    'UPDATE users SET is_disabled = CASE WHEN is_disabled = 0 THEN 1 ELSE 0 END WHERE id = ?'
  ).bind(id).run()

  return c.json({ message: 'User status toggled' })
})

adminRoutes.delete('/users/:id', async (c) => {
  const id = parseInt(c.req.param('id'))

  const user = await c.env.DB.prepare(
    'SELECT id, role FROM users WHERE id = ?'
  ).bind(id).first<{ id: number; role: string }>()

  if (!user || user.role === 'admin') {
    return c.json({ message: 'Cannot delete admin' }, 400)
  }

  await c.env.DB.prepare('DELETE FROM score_logs WHERE user_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM presets WHERE user_id = ?').bind(id).run()

  const { results: children } = await c.env.DB.prepare(
    'SELECT id FROM children WHERE user_id = ?'
  ).bind(id).all<{ id: number }>()

  for (const child of children) {
    await c.env.DB.prepare('DELETE FROM score_logs WHERE child_id = ?').bind(child.id).run()
  }

  await c.env.DB.prepare('DELETE FROM children WHERE user_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()

  return c.json({ message: 'User deleted' })
})

export { adminRoutes }
