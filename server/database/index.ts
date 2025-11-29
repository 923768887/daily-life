import { drizzle } from 'drizzle-orm/libsql/web'
import * as schema from './schema'

// Turso 云数据库配置
const dbUrl = process.env.TURSO_DATABASE_URL || 'file:loveday.db'
const authToken = process.env.TURSO_AUTH_TOKEN

export const db = drizzle({
  connection: {
    url: dbUrl,
    authToken: authToken,
  },
  schema,
})

export * from './schema'
