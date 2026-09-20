export type Bindings = {
  DB: D1Database
  KV: KVNamespace
  ASSETS: Fetcher
  JWT_SECRET: string
  ADMIN_USERNAME: string
  ADMIN_PASSWORD: string
  MAX_USERS: string
  MAX_CHILDREN_PER_USER: string
}

export type Variables = {
  userId: number
  userRole: string
}
