import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings, Variables } from '../types'

type Env = { Bindings: Bindings; Variables: Variables }

const dashboardRoutes = new Hono<Env>()

dashboardRoutes.use('*', authMiddleware)

dashboardRoutes.get('/child/:id/overview', async (c) => {
  const userId = c.get('userId')
  const childId = parseInt(c.req.param('id'))

  const child = await c.env.DB.prepare(
    'SELECT id FROM children WHERE id = ? AND user_id = ?'
  ).bind(childId, userId).first()

  if (!child) {
    return c.json({ message: 'Child not found' }, 404)
  }

  const totalRow = await c.env.DB.prepare(
    'SELECT COALESCE(SUM(score), 0) as total FROM score_logs WHERE child_id = ?'
  ).bind(childId).first<{ total: number }>()

  const todayRow = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(score), 0) as today FROM score_logs WHERE child_id = ? AND date(created_at) = date('now')"
  ).bind(childId).first<{ today: number }>()

  const weekRow = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(score), 0) as week FROM score_logs WHERE child_id = ? AND created_at >= datetime('now', '-7 days')"
  ).bind(childId).first<{ week: number }>()

  const monthRow = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(score), 0) as month FROM score_logs WHERE child_id = ? AND created_at >= datetime('now', '-30 days')"
  ).bind(childId).first<{ month: number }>()

  return c.json({
    total: totalRow?.total || 0,
    today: todayRow?.today || 0,
    week: weekRow?.week || 0,
    month: monthRow?.month || 0,
  })
})

dashboardRoutes.get('/child/:id/trend', async (c) => {
  const userId = c.get('userId')
  const childId = parseInt(c.req.param('id'))
  const period = c.req.query('period') || 'week'

  const child = await c.env.DB.prepare(
    'SELECT id FROM children WHERE id = ? AND user_id = ?'
  ).bind(childId, userId).first()

  if (!child) {
    return c.json({ message: 'Child not found' }, 404)
  }

  const days = period === 'month' ? 30 : 7

  const { results } = await c.env.DB.prepare(
    `SELECT date(created_at) as date, SUM(score) as score
     FROM score_logs
     WHERE child_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
     GROUP BY date(created_at)
     ORDER BY date(created_at) ASC`
  ).bind(childId, days).all<{ date: string; score: number }>()

  return c.json({ data: results })
})

dashboardRoutes.get('/child/:id/breakdown', async (c) => {
  const userId = c.get('userId')
  const childId = parseInt(c.req.param('id'))

  const child = await c.env.DB.prepare(
    'SELECT id FROM children WHERE id = ? AND user_id = ?'
  ).bind(childId, userId).first()

  if (!child) {
    return c.json({ message: 'Child not found' }, 404)
  }

  const { results } = await c.env.DB.prepare(
    `SELECT name, SUM(score) as value
     FROM score_logs
     WHERE child_id = ?
     GROUP BY name
     ORDER BY ABS(SUM(score)) DESC`
  ).bind(childId).all<{ name: string; value: number }>()

  return c.json({ data: results })
})

dashboardRoutes.get('/ranking', async (c) => {
  const userId = c.get('userId')

  const { results } = await c.env.DB.prepare(
    `SELECT c.id, c.name, c.avatar,
      COALESCE((SELECT SUM(score) FROM score_logs WHERE child_id = c.id), 0) as score
     FROM children c
     WHERE c.user_id = ?
     ORDER BY score DESC`
  ).bind(userId).all()

  return c.json({ ranking: results })
})

export { dashboardRoutes }
