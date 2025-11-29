import { createTursoClient } from './turso-client'
export * from './schema'

// Turso 云数据库配置
const tursoClient = createTursoClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

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
