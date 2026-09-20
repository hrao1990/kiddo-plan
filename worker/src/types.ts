export type Bindings = {
  db: D1Database
  kv: KVNamespace
  assets: Fetcher
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
