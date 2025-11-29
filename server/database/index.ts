import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { join } from 'path'
import * as schema from './schema'

// 使用环境变量或默认路径
const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'loveday.db')
const sqlite = new Database(dbPath)
export const db = drizzle(sqlite, { schema })

export * from './schema'
