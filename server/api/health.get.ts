import { db, users } from '~/server/database'
import { success, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async () => {
  // 显示更多环境变量信息用于调试
  const dbUrl = process.env.TURSO_DATABASE_URL || ''
  const envCheck = {
    TURSO_DATABASE_URL: dbUrl ? `已配置 (${dbUrl.substring(0, 30)}...)` : '未配置',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? '已配置' : '未配置',
  }

  try {
    // 测试数据库连接 - 使用原生 SQL
    const result = await db.select().from(users).limit(1)
    
    return success({
      status: 'ok',
      env: envCheck,
      dbConnection: '成功',
      userCount: result.length,
    })
  } catch (err: any) {
    return {
      code: ResponseCode.SERVER_ERROR,
      message: `数据库连接失败: ${err.message}`,
      data: {
        env: envCheck,
        errorName: err.name,
        errorStack: err.stack?.substring(0, 500),
      }
    }
  }
})
