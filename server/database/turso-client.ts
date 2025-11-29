/**
 * 基于原生 fetch 的 Turso HTTP 客户端
 * 用于替代 @libsql/client，解决 EdgeOne Pages 兼容性问题
 */

interface TursoResult {
  columns: string[]
  rows: any[][]
  rows_read: number
  rows_written: number
}

interface TursoResponse {
  results: TursoResult
}

export class TursoClient {
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

export function createTursoClient(config: { url: string; authToken?: string }) {
  return new TursoClient(config)
}
