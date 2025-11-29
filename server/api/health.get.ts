import { success, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async () => {
  const dbUrl = process.env.TURSO_DATABASE_URL || ''
  const authToken = process.env.TURSO_AUTH_TOKEN || ''
  
  const envCheck = {
    TURSO_DATABASE_URL: dbUrl ? `已配置 (${dbUrl.substring(0, 30)}...)` : '未配置',
    TURSO_AUTH_TOKEN: authToken ? '已配置' : '未配置',
  }

  try {
    // 直接用 fetch 调用 Turso HTTP API
    const response = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statements: [
          { q: 'SELECT COUNT(*) as count FROM users' }
        ]
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`)
    }
    
    return success({
      status: 'ok',
      env: envCheck,
      dbConnection: '成功',
      result: data,
    })
  } catch (err: any) {
    return {
      code: ResponseCode.SERVER_ERROR,
      message: `数据库连接失败: ${err.message}`,
      data: {
        env: envCheck,
        errorName: err.name,
        errorCode: err.code,
      }
    }
  }
})
