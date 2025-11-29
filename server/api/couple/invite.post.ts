import { db } from '~/server/database'
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
  const existingResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? LIMIT 1',
    [userId]
  )
  const existingCouple = existingResult.rows[0] as any

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
    await db.execute(
      'INSERT INTO couples (user_id, status, create_time, update_time) VALUES (?, ?, ?, ?)',
      [userId, 0, now, now]
    )
    const newCoupleResult = await db.execute(
      'SELECT * FROM couples WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId]
    )
    coupleId = (newCoupleResult.rows[0] as any).id
  }

  // 生成邀请码
  const code = generateInviteCode()
  await db.execute(
    'INSERT INTO invites (couple_id, user_id, code, status, expire_time, create_time) VALUES (?, ?, ?, ?, ?, ?)',
    [coupleId, userId, code, 0, expireTime, now]
  )

  return success({
    inviteCode: code,
    qrcode: `https://loveday.com/invite/${code}`,
    expireTime,
  })
})
