import { db, users } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'

export default defineEventHandler(async () => {
  const envCheck = {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? '已配置' : '未配置',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? '已配置' : '未配置',
  }

  try {
    // 测试数据库连接
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
        error: err.message,
      }
    }
  }
})
