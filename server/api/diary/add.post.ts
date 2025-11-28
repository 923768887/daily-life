import { eq, or } from 'drizzle-orm'
import { db, diaries, couples } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 获取用户的 coupleId
  const couple = await db.query.couples.findFirst({
    where: or(
      eq(couples.userId, userId),
      eq(couples.partnerId, userId)
    ),
  })
  
  const coupleId = couple?.id || 0

  const body = await readBody(event)
  const {
    title,
    content,
    mood,
    weather,
    location,
    latitude,
    longitude,
    images,
    isPrivate,
    diaryDate,
  } = body

  if (!content) {
    return error(ResponseCode.PARAM_ERROR, '请输入日记内容')
  }

  const now = formatDateTime()

  const result = await db.insert(diaries).values({
    coupleId,
    userId,
    title,
    content,
    mood,
    weather,
    location,
    latitude,
    longitude,
    images: images ? JSON.stringify(images) : null,
    isPrivate: isPrivate ? 1 : 0,
    diaryDate: diaryDate || now.split(' ')[0],
    createTime: now,
    updateTime: now,
  } as any).returning()

  return success({
    id: result[0].id,
  })
})
