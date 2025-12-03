import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 获取用户的 coupleId
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE (user_id = ? OR partner_id = ?) AND status = 1 LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  if (!couple) {
    return success({
      diaryCount: 0,
      photoCount: 0,
      anniversaryCount: 0,
      checkInDays: 0,
      totalPoints: 0,
    })
  }

  // 获取日记数量
  const diaryResult = await db.execute(
    'SELECT COUNT(*) as count FROM diaries WHERE couple_id = ?',
    [couple.id]
  )
  const diaryCount = (diaryResult.rows[0] as any)?.count || 0

  // 获取照片数量
  const photoResult = await db.execute(
    'SELECT COUNT(*) as count FROM photos WHERE couple_id = ?',
    [couple.id]
  )
  const photoCount = (photoResult.rows[0] as any)?.count || 0

  // 获取纪念日数量
  const anniversaryResult = await db.execute(
    'SELECT COUNT(*) as count FROM anniversaries WHERE couple_id = ?',
    [couple.id]
  )
  const anniversaryCount = (anniversaryResult.rows[0] as any)?.count || 0

  // 获取签到天数和总积分
  const taskResult = await db.execute(
    `SELECT 
       COUNT(CASE WHEN check_in = 1 THEN 1 END) as checkInDays,
       SUM(points) as totalPoints
     FROM daily_tasks WHERE couple_id = ? AND user_id = ?`,
    [couple.id, userId]
  )
  const taskStats = taskResult.rows[0] as any

  return success({
    diaryCount,
    photoCount,
    anniversaryCount,
    checkInDays: taskStats?.checkInDays || 0,
    totalPoints: taskStats?.totalPoints || 0,
  })
})
