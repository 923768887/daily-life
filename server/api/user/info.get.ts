import { eq, or } from 'drizzle-orm'
import { db, users, couples } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) {
    return error(ResponseCode.NOT_FOUND, '用户不存在')
  }

  // 查询配对状态
  const couple = await db.query.couples.findFirst({
    where: or(
      eq(couples.userId, userId),
      eq(couples.partnerId, userId)
    ),
  })

  return success({
    id: user.id,
    phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    nickName: user.nickName,
    avatarUrl: user.avatarUrl,
    gender: user.gender,
    birthday: user.birthday,
    constellation: user.constellation,
    hobby: user.hobby,
    isPaired: couple?.status === 1,
    coupleId: couple?.id,
  })
})
