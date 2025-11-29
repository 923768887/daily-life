import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const userResult = await db.execute(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [userId]
  )
  const user = userResult.rows[0] as any

  if (!user) {
    return error(ResponseCode.NOT_FOUND, '用户不存在')
  }

  // 查询配对状态
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  return success({
    id: user.id,
    phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    nickName: user.nick_name,
    avatarUrl: user.avatar_url,
    gender: user.gender,
    birthday: user.birthday,
    constellation: user.constellation,
    hobby: user.hobby,
    isPaired: couple?.status === 1,
    coupleId: couple?.id,
  })
})
