import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

type Env = { Bindings: Bindings; Variables: Variables }

const childrenRoutes = new Hono<Env>()

childrenRoutes.use('*', authMiddleware)

childrenRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.name, c.avatar, c.created_at,
      COALESCE((SELECT SUM(score) FROM score_logs WHERE child_id = c.id), 0) as score
     FROM children c WHERE c.user_id = ? ORDER BY c.created_at DESC`
  ).bind(userId).all()

  return c.json({ children: results })
})

childrenRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const { name, avatar } = await c.req.json()

  if (!name) {
    return c.json({ message: 'Name required' }, 400)
  }

  const maxChildren = parseInt(c.env.MAX_CHILDREN_PER_USER || '5')
  const row = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM children WHERE user_id = ?'
  ).bind(userId).first<{ count: number }>()
  const count = row?.count || 0

  if (count >= maxChildren) {
    return c.json({ message: 'Maximum number of children reached' }, 400)
  }

  await c.env.DB.prepare(
    'INSERT INTO children (user_id, name, avatar) VALUES (?, ?, ?)'
  ).bind(userId, name, avatar || null).run()

  return c.json({ message: 'Child added' })
})

childrenRoutes.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  const { name, avatar } = await c.req.json()

  const child = await c.env.DB.prepare(
    'SELECT id FROM children WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first()

  if (!child) {
    return c.json({ message: 'Child not found' }, 404)
  }

  await c.env.DB.prepare(
    'UPDATE children SET name = ?, avatar = ? WHERE id = ?'
  ).bind(name, avatar || null, id).run()

  return c.json({ message: 'Child updated' })
})

childrenRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))

  const child = await c.env.DB.prepare(
    'SELECT id FROM children WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first()

  if (!child) {
    return c.json({ message: 'Child not found' }, 404)
  }

  await c.env.DB.prepare('DELETE FROM score_logs WHERE child_id = ?').bind(id).run()
  await c.env.DB.prepare('DELETE FROM children WHERE id = ?').bind(id).run()

  return c.json({ message: 'Child deleted' })
})

export { childrenRoutes }
