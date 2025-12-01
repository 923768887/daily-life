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
    return success({ count: 0 })
  }

  // 获取未读消息数量
  const unreadResult = await db.execute(
    'SELECT COUNT(*) as count FROM messages WHERE couple_id = ? AND receiver_id = ? AND is_read = 0',
    [couple.id, userId]
  )
  const count = (unreadResult.rows[0] as any)?.count || 0

  return success({ count })
})
