/**
 * Turso 数据库客户端
 * 使用纯 HTTP API，兼容 Edge Runtime（EdgeOne Pages）
 */

export interface DatabaseClient {
  execute(sql: string, args?: any[]): Promise<{ rows: Record<string, any>[] }>
  batch(statements: { sql: string; args?: any[] }[]): Promise<{ rows: Record<string, any>[] }[]>
}

// 将参数转换为 Turso API 格式
function formatValue(value: any): any {
  if (value === null || value === undefined) {
    return { type: 'null' }
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { type: 'integer', value: String(value) }
    }
    return { type: 'float', value }
  }
  if (typeof value === 'string') {
    return { type: 'text', value }
  }
  if (typeof value === 'boolean') {
    return { type: 'integer', value: value ? '1' : '0' }
  }
  if (value instanceof Uint8Array) {
    return { type: 'blob', base64: btoa(String.fromCharCode(...value)) }
  }
  return { type: 'text', value: String(value) }
}

// 解析 Turso 返回的值
function parseValue(cell: any): any {
  if (!cell || cell.type === 'null') return null
  if (cell.type === 'integer') return parseInt(cell.value, 10)
  if (cell.type === 'float') return parseFloat(cell.value)
  if (cell.type === 'blob' && cell.base64) {
    return Uint8Array.from(atob(cell.base64), c => c.charCodeAt(0))
  }
  return cell.value
}

export function createTursoClient(config: { url: string; authToken?: string }): DatabaseClient {
  // 构建 HTTP API URL
  let apiUrl = config.url
  if (apiUrl.startsWith('libsql://')) {
    apiUrl = apiUrl.replace('libsql://', 'https://')
  }
  // 确保不以斜杠结尾，然后添加 pipeline 路径
  apiUrl = apiUrl.replace(/\/$/, '')
  
  const authToken = config.authToken || ''

  async function request(statements: { sql: string; args?: any[] }[]): Promise<any> {
    const body = {
      requests: [
        ...statements.map(stmt => ({
          type: 'execute',
          stmt: {
            sql: stmt.sql,
            args: (stmt.args || []).map(formatValue)
          }
        })),
        { type: 'close' }
      ]
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Turso API error:', response.status, errorText)
      throw new Error(`Turso error ${response.status}: ${errorText}`)
    }

    return response.json()
  }

  function parseResult(result: any): { rows: Record<string, any>[] } {
    if (!result?.response?.result) {
      return { rows: [] }
    }

    const { cols, rows } = result.response.result
    if (!cols || !rows) {
      return { rows: [] }
    }

    const formattedRows = rows.map((row: any[]) => {
      const obj: Record<string, any> = {}
      cols.forEach((col: { name: string }, i: number) => {
        obj[col.name] = parseValue(row[i])
      })
      return obj
    })

    return { rows: formattedRows }
  }

  return {
    async execute(sql: string, args: any[] = []): Promise<{ rows: Record<string, any>[] }> {
      const data = await request([{ sql, args }])
      return parseResult(data.results?.[0])
    },

    async batch(statements: { sql: string; args?: any[] }[]): Promise<{ rows: Record<string, any>[] }[]> {
      const data = await request(statements)
      return statements.map((_, i) => parseResult(data.results?.[i]))
    }
  }
}
