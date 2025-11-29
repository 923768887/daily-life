import { createTursoClient, createLocalClient, type DatabaseClient } from './turso-client'
export * from './schema'

// 根据环境选择数据库客户端
function createDbClient(): DatabaseClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  
  if (tursoUrl) {
    // 使用 Turso 云数据库
    console.log('Using Turso cloud database')
    return createTursoClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  } else {
    // 使用本地 SQLite 数据库
    console.log('Using local SQLite database')
    return createLocalClient()
  }
}

const tursoClient = createDbClient()

// 简单的数据库查询封装
export const db = {
  execute: (sql: string, args?: any[]) => tursoClient.execute(sql, args),
  batch: (statements: { sql: string; args?: any[] }[]) => tursoClient.batch(statements),
  
  // 用于兼容现有代码的查询方法
  query: {
    users: {
      findFirst: async (options?: { where?: any }) => {
        // 简化实现，后续可以扩展
        const result = await tursoClient.execute('SELECT * FROM users LIMIT 1')
        return result.rows[0] || null
      },
      findMany: async () => {
        const result = await tursoClient.execute('SELECT * FROM users')
        return result.rows
      },
    },
    couples: {
      findFirst: async (options?: { where?: any }) => {
        const result = await tursoClient.execute('SELECT * FROM couples LIMIT 1')
        return result.rows[0] || null
      },
    },
    invites: {
      findFirst: async (options?: { where?: any }) => {
        const result = await tursoClient.execute('SELECT * FROM invites LIMIT 1')
        return result.rows[0] || null
      },
    },
  },
}
