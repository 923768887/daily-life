/**
 * 基于原生 fetch 的 Turso HTTP 客户端
 * 用于替代 @libsql/client，解决 EdgeOne Pages 兼容性问题
 * 
 * 同时支持本地 SQLite 开发模式
 */

import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export interface DatabaseClient {
  execute(sql: string, args?: any[]): Promise<{ rows: Record<string, any>[] }>
  batch(statements: { sql: string; args?: any[] }[]): Promise<{ rows: Record<string, any>[] }[]>
}

interface TursoResult {
  columns: string[]
  rows: any[][]
  rows_read: number
  rows_written: number
}

interface TursoResponse {
  results: TursoResult
}

export class TursoClient implements DatabaseClient {
  private url: string
  private authToken: string

  constructor(config: { url: string; authToken?: string }) {
    this.url = config.url
    this.authToken = config.authToken || ''
  }

  async execute(sql: string, args: any[] = []): Promise<{ rows: Record<string, any>[] }> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statements: [
          { q: sql, params: args }
        ]
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Turso HTTP error ${response.status}: ${error}`)
    }

    const data: TursoResponse[] = await response.json()
    
    if (!data[0]?.results) {
      return { rows: [] }
    }

    const { columns, rows } = data[0].results
    
    // 将数组格式转换为对象格式
    const formattedRows = rows.map(row => {
      const obj: Record<string, any> = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
      })
      return obj
    })

    return { rows: formattedRows }
  }

  async batch(statements: { sql: string; args?: any[] }[]): Promise<{ rows: Record<string, any>[] }[]> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statements: statements.map(s => ({ q: s.sql, params: s.args || [] }))
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Turso HTTP error ${response.status}: ${error}`)
    }

    const data: TursoResponse[] = await response.json()
    
    return data.map(item => {
      if (!item.results) {
        return { rows: [] }
      }
      const { columns, rows } = item.results
      const formattedRows = rows.map(row => {
        const obj: Record<string, any> = {}
        columns.forEach((col, i) => {
          obj[col] = row[i]
        })
        return obj
      })
      return { rows: formattedRows }
    })
  }
}

export function createTursoClient(config: { url: string; authToken?: string }): DatabaseClient {
  return new TursoClient(config)
}

/**
 * 本地 SQLite 客户端，用于开发环境
 */
export class LocalSqliteClient implements DatabaseClient {
  private db: Database.Database
  private initialized = false

  constructor(dbPath?: string) {
    // 使用与 drizzle.config.ts 相同的数据库文件
    const path = dbPath || join(process.cwd(), 'loveday.db')
    
    this.db = new Database(path)
    this.db.pragma('journal_mode = WAL')
  }

  private ensureInitialized() {
    if (this.initialized) return
    
    // 创建表结构
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        password TEXT,
        nick_name TEXT,
        avatar_url TEXT,
        gender INTEGER DEFAULT 0,
        birthday TEXT,
        couple_id INTEGER,
        create_time TEXT,
        update_time TEXT
      );

      CREATE TABLE IF NOT EXISTS couples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,
        anniversary TEXT,
        status INTEGER DEFAULT 1,
        create_time TEXT,
        update_time TEXT
      );

      CREATE TABLE IF NOT EXISTS invites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        inviter_id INTEGER NOT NULL,
        invitee_id INTEGER,
        status INTEGER DEFAULT 0,
        expire_time TEXT,
        create_time TEXT
      );

      CREATE TABLE IF NOT EXISTS diaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        author_id INTEGER NOT NULL,
        title TEXT,
        content TEXT,
        mood INTEGER,
        weather TEXT,
        location TEXT,
        images TEXT,
        is_private INTEGER DEFAULT 0,
        create_time TEXT,
        update_time TEXT
      );

      CREATE TABLE IF NOT EXISTS anniversaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        type INTEGER DEFAULT 0,
        remind INTEGER DEFAULT 1,
        remind_days INTEGER DEFAULT 1,
        note TEXT,
        create_time TEXT,
        update_time TEXT
      );

      CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        cover_url TEXT,
        description TEXT,
        photo_count INTEGER DEFAULT 0,
        create_time TEXT,
        update_time TEXT
      );

      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        album_id INTEGER NOT NULL,
        couple_id INTEGER NOT NULL,
        uploader_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        description TEXT,
        taken_at TEXT,
        location TEXT,
        create_time TEXT
      );
    `)
    
    this.initialized = true
  }

  async execute(sql: string, args: any[] = []): Promise<{ rows: Record<string, any>[] }> {
    this.ensureInitialized()
    
    const normalizedSql = sql.trim().toUpperCase()
    
    if (normalizedSql.startsWith('SELECT')) {
      const stmt = this.db.prepare(sql)
      const rows = stmt.all(...args) as Record<string, any>[]
      return { rows }
    } else {
      const stmt = this.db.prepare(sql)
      stmt.run(...args)
      return { rows: [] }
    }
  }

  async batch(statements: { sql: string; args?: any[] }[]): Promise<{ rows: Record<string, any>[] }[]> {
    this.ensureInitialized()
    
    return statements.map(({ sql, args = [] }) => {
      const normalizedSql = sql.trim().toUpperCase()
      
      if (normalizedSql.startsWith('SELECT')) {
        const stmt = this.db.prepare(sql)
        const rows = stmt.all(...args) as Record<string, any>[]
        return { rows }
      } else {
        const stmt = this.db.prepare(sql)
        stmt.run(...args)
        return { rows: [] }
      }
    })
  }
}

export function createLocalClient(dbPath?: string): DatabaseClient {
  return new LocalSqliteClient(dbPath)
}
