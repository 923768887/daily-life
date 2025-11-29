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
    
    // 创建表结构 - 与 Drizzle schema 保持一致
    this.db.exec(`
      -- 用户表
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        password TEXT,
        nick_name TEXT NOT NULL,
        avatar_url TEXT,
        gender INTEGER DEFAULT 0,
        birthday TEXT,
        constellation TEXT,
        hobby TEXT,
        create_time TEXT NOT NULL,
        update_time TEXT NOT NULL
      );

      -- 情侣关系表
      CREATE TABLE IF NOT EXISTS couples (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        partner_id INTEGER,
        status INTEGER DEFAULT 0,
        love_start_date TEXT,
        relationship_type INTEGER DEFAULT 0,
        couple_nickname_1 TEXT,
        couple_nickname_2 TEXT,
        couple_avatar TEXT,
        signature TEXT,
        theme TEXT DEFAULT 'romantic-pink',
        create_time TEXT NOT NULL,
        update_time TEXT NOT NULL
      );

      -- 邀请码表
      CREATE TABLE IF NOT EXISTS invites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        code TEXT UNIQUE NOT NULL,
        status INTEGER DEFAULT 0,
        expire_time TEXT NOT NULL,
        create_time TEXT NOT NULL
      );

      -- 日记表
      CREATE TABLE IF NOT EXISTS diaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        mood TEXT,
        weather TEXT,
        location TEXT,
        latitude REAL,
        longitude REAL,
        images TEXT,
        videos TEXT,
        is_private INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        diary_date TEXT NOT NULL,
        create_time TEXT NOT NULL,
        update_time TEXT NOT NULL
      );

      -- 相册表
      CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        cover_url TEXT,
        photo_count INTEGER DEFAULT 0,
        create_time TEXT NOT NULL,
        update_time TEXT NOT NULL
      );

      -- 照片表
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        album_id INTEGER NOT NULL,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        width INTEGER,
        height INTEGER,
        description TEXT,
        location TEXT,
        latitude REAL,
        longitude REAL,
        taken_at TEXT,
        like_count INTEGER DEFAULT 0,
        create_time TEXT NOT NULL
      );

      -- 纪念日表
      CREATE TABLE IF NOT EXISTS anniversaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        type TEXT DEFAULT 'custom',
        icon TEXT DEFAULT '❤️',
        color TEXT DEFAULT '#FFE4E9',
        images TEXT,
        is_repeat INTEGER DEFAULT 1,
        remind_days TEXT DEFAULT '[1,7]',
        is_active INTEGER DEFAULT 1,
        create_time TEXT NOT NULL,
        update_time TEXT NOT NULL
      );

      -- 日程表
      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'other',
        start_time TEXT NOT NULL,
        end_time TEXT,
        is_all_day INTEGER DEFAULT 0,
        location TEXT,
        latitude REAL,
        longitude REAL,
        repeat_type TEXT DEFAULT 'none',
        color TEXT DEFAULT '#FF6B9D',
        status INTEGER DEFAULT 0,
        create_time TEXT NOT NULL,
        update_time TEXT NOT NULL
      );

      -- 每日任务表
      CREATE TABLE IF NOT EXISTS daily_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        task_date TEXT NOT NULL,
        check_in INTEGER DEFAULT 0,
        check_in_time TEXT,
        good_morning INTEGER DEFAULT 0,
        good_morning_time TEXT,
        good_night INTEGER DEFAULT 0,
        good_night_time TEXT,
        mood TEXT,
        points INTEGER DEFAULT 0,
        create_time TEXT NOT NULL,
        update_time TEXT NOT NULL
      );

      -- 消息表
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        couple_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        type TEXT DEFAULT 'text',
        content TEXT,
        media_url TEXT,
        special_type TEXT,
        is_read INTEGER DEFAULT 0,
        read_time TEXT,
        create_time TEXT NOT NULL
      );

      -- 点赞表
      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_type TEXT NOT NULL,
        target_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        create_time TEXT NOT NULL
      );

      -- 评论表
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_type TEXT NOT NULL,
        target_id INTEGER NOT NULL,
        couple_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        parent_id INTEGER,
        create_time TEXT NOT NULL
      );

      -- 情话表
      CREATE TABLE IF NOT EXISTS love_quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        author TEXT,
        source TEXT,
        category TEXT,
        is_system INTEGER DEFAULT 1,
        create_time TEXT NOT NULL
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
