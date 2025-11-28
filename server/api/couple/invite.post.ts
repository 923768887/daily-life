import { eq, or } from 'drizzle-orm'
import { db, couples, invites } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'LOVE'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 检查是否已配对
  const existingCouple = await db.query.couples.findFirst({
    where: eq(couples.userId, userId),
  })

  if (existingCouple?.status === 1) {
    return error(ResponseCode.ALREADY_PAIRED, '您已经配对了')
  }

  const now = formatDateTime()
  const expireTime = formatDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

  // 创建或获取情侣关系
  let coupleId: number
  if (existingCouple) {
    coupleId = existingCouple.id
  } else {
    const result = await db.insert(couples).values({
      userId,
      status: 0,
      createTime: now,
      updateTime: now,
    } as any).returning()
    coupleId = result[0].id
  }

  // 生成邀请码
  const code = generateInviteCode()
  await db.insert(invites).values({
    coupleId,
    userId,
    code,
    status: 0,
    expireTime,
    createTime: now,
  } as any)

  return success({
    inviteCode: code,
    qrcode: `https://loveday.com/invite/${code}`,
    expireTime,
  })
})
