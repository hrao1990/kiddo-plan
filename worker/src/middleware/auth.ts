import { Context, Next } from 'hono'
import { verify } from 'hono/jwt'
import type { Bindings, Variables } from '../types'

type AppEnv = { Bindings: Bindings; Variables: Variables }

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    c.set('userId', payload.sub as number)
    c.set('userRole', payload.role as string)
  } catch {
    return c.json({ message: 'Invalid token' }, 401)
  }
  await next()
}

export async function adminMiddleware(c: Context<AppEnv>, next: Next) {
  const role = c.get('userRole')
  if (role !== 'admin') {
    return c.json({ message: 'Forbidden' }, 403)
  }
  await next()
}
