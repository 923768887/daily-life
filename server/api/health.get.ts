import { createClient } from '@libsql/client/web'
import { success, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async () => {
  const dbUrl = process.env.TURSO_DATABASE_URL || ''
  const envCheck = {
    TURSO_DATABASE_URL: dbUrl ? `已配置 (${dbUrl.substring(0, 30)}...)` : '未配置',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? '已配置' : '未配置',
  }

  try {
    // 直接用 libsql 客户端测试连接
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    
    // 执行原生 SQL
    const result = await client.execute('SELECT COUNT(*) as count FROM users')
    
    return success({
      status: 'ok',
      env: envCheck,
      dbConnection: '成功',
      result: result.rows,
    })
  } catch (err: any) {
    return {
      code: ResponseCode.SERVER_ERROR,
      message: `数据库连接失败: ${err.message}`,
      data: {
        env: envCheck,
        errorName: err.name,
        errorCode: err.code,
        errorStack: err.stack?.substring(0, 500),
      }
    }
  }
})
