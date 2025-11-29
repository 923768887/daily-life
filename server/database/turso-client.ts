/**
 * Turso 数据库客户端
 * 使用官方 @libsql/client 库
 */

import { createClient } from '@libsql/client'

export interface DatabaseClient {
  execute(sql: string, args?: any[]): Promise<{ rows: Record<string, any>[] }>
  batch(statements: { sql: string; args?: any[] }[]): Promise<{ rows: Record<string, any>[] }[]>
}

export function createTursoClient(config: { url: string; authToken?: string }): DatabaseClient {
  const client = createClient({
    url: config.url,
    authToken: config.authToken,
  })

  return {
    async execute(sql: string, args: any[] = []): Promise<{ rows: Record<string, any>[] }> {
      const result = await client.execute({ sql, args })
      return { rows: result.rows as Record<string, any>[] }
    },

    async batch(statements: { sql: string; args?: any[] }[]): Promise<{ rows: Record<string, any>[] }[]> {
      const results = await client.batch(
        statements.map(s => ({ sql: s.sql, args: s.args || [] }))
      )
      return results.map(r => ({ rows: r.rows as Record<string, any>[] }))
    }
  }
}
