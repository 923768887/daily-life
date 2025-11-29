import { drizzle } from 'drizzle-orm/libsql'
import { createClient, type Client } from '@libsql/client/web'
import * as schema from './schema'

// 创建数据库客户端
let client: Client

if (process.env.TURSO_DATABASE_URL) {
  // 生产环境：使用 Turso 云数据库
  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
} else {
  // 本地开发：使用本地 SQLite 文件
  client = createClient({
    url: 'file:loveday.db',
  })
}

export const db = drizzle(client, { schema })

export * from './schema'
