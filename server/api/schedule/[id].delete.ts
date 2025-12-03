import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const id = getRouterParam(event, 'id')
  
  if (!id) {
    return error(ResponseCode.PARAM_ERROR, '缺少日程ID')
  }

  // 获取用户的 coupleId
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE (user_id = ? OR partner_id = ?) AND status = 1 LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  if (!couple) {
    return error(ResponseCode.NOT_PAIRED, '请先完成情侣配对')
  }

  // 检查日程是否存在
  const scheduleResult = await db.execute(
    'SELECT * FROM schedules WHERE id = ? AND couple_id = ? LIMIT 1',
    [id, couple.id]
  )
  const schedule = scheduleResult.rows[0] as any

  if (!schedule) {
    return error(ResponseCode.NOT_FOUND, '日程不存在')
  }

  // 删除日程
  await db.execute('DELETE FROM schedules WHERE id = ?', [id])

  return success({ message: '删除成功' })
})
