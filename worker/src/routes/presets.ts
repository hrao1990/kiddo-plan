import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

type Env = { Bindings: Bindings; Variables: Variables }

const presetsRoutes = new Hono<Env>()

presetsRoutes.use('*', authMiddleware)

presetsRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.db.prepare(
    'SELECT id, name, score, category, created_at FROM presets WHERE user_id = ? ORDER BY score DESC'
  ).bind(userId).all()

  return c.json({ presets: results })
})

presetsRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const { name, score, category } = await c.req.json()

  if (!name || score === undefined) {
    return c.json({ message: 'Name and score required' }, 400)
  }

  await c.env.db.prepare(
    'INSERT INTO presets (user_id, name, score, category) VALUES (?, ?, ?, ?)'
  ).bind(userId, name, score, category || 'custom').run()

  return c.json({ message: 'Preset added' })
})

presetsRoutes.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  const { name, score, category } = await c.req.json()

  const preset = await c.env.db.prepare(
    'SELECT id FROM presets WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first()

  if (!preset) {
    return c.json({ message: 'Preset not found' }, 404)
  }

  await c.env.db.prepare(
    'UPDATE presets SET name = ?, score = ?, category = ? WHERE id = ?'
  ).bind(name, score, category || 'custom', id).run()

  return c.json({ message: 'Preset updated' })
})

presetsRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))

  const preset = await c.env.db.prepare(
    'SELECT id FROM presets WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first()

  if (!preset) {
    return c.json({ message: 'Preset not found' }, 404)
  }

  await c.env.db.prepare('UPDATE score_logs SET preset_id = NULL WHERE preset_id = ?').bind(id).run()
  await c.env.db.prepare('DELETE FROM presets WHERE id = ?').bind(id).run()

  return c.json({ message: 'Preset deleted' })
})

export { presetsRoutes }
