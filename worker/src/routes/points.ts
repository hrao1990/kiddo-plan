import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

type Env = { Bindings: Bindings; Variables: Variables }

const pointsRoutes = new Hono<Env>()

pointsRoutes.use('*', authMiddleware)

pointsRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const childId = c.req.query('child_id')
  const dateFrom = c.req.query('date_from')
  const dateTo = c.req.query('date_to')
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = parseInt(c.req.query('pageSize') || '20')
  const offset = (page - 1) * pageSize

  let query = `
    SELECT sl.id, sl.name, sl.score, sl.note, sl.created_at, sl.preset_id,
      c.name as child_name
    FROM score_logs sl
    JOIN children c ON sl.child_id = c.id
    WHERE c.user_id = ?
  `
  const params: (string | number)[] = [userId]

  if (childId) {
    query += ' AND sl.child_id = ?'
    params.push(parseInt(childId))
  }

  if (dateFrom) {
    query += ' AND date(sl.created_at) >= date(?)'
    params.push(dateFrom)
  }

  if (dateTo) {
    query += ' AND date(sl.created_at) <= date(?)'
    params.push(dateTo)
  }

  query += ' ORDER BY sl.created_at DESC LIMIT ? OFFSET ?'
  params.push(pageSize, offset)

  const { results } = await c.env.DB.prepare(query).bind(...params).all()

  return c.json({ records: results })
})

pointsRoutes.post('/', async (c) => {
  const userId = c.get('userId')
  const { child_id, preset_id, name, score, note } = await c.req.json()

  if (!child_id || !name || score === undefined) {
    return c.json({ message: 'Child ID, name and score required' }, 400)
  }

  const child = await c.env.DB.prepare(
    'SELECT id FROM children WHERE id = ? AND user_id = ?'
  ).bind(child_id, userId).first()

  if (!child) {
    return c.json({ message: 'Child not found' }, 404)
  }

  await c.env.DB.prepare(
    'INSERT INTO score_logs (child_id, user_id, preset_id, name, score, note) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(child_id, userId, preset_id || null, name, score, note || null).run()

  return c.json({ message: 'Score recorded' })
})

pointsRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))

  const log = await c.env.DB.prepare(
    `SELECT sl.id FROM score_logs sl
     JOIN children c ON sl.child_id = c.id
     WHERE sl.id = ? AND c.user_id = ?`
  ).bind(id, userId).first()

  if (!log) {
    return c.json({ message: 'Record not found' }, 404)
  }

  await c.env.DB.prepare('DELETE FROM score_logs WHERE id = ?').bind(id).run()

  return c.json({ message: 'Record deleted' })
})

export { pointsRoutes }
