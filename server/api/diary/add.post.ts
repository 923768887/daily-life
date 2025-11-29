import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 获取用户的 coupleId
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const coupleId = (coupleResult.rows[0] as any)?.id || 0

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

  await db.execute(
    `INSERT INTO diaries (couple_id, user_id, title, content, mood, weather, location, latitude, longitude, images, is_private, diary_date, create_time, update_time) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      coupleId,
      userId,
      title || null,
      content,
      mood || null,
      weather || null,
      location || null,
      latitude || null,
      longitude || null,
      images ? JSON.stringify(images) : null,
      isPrivate ? 1 : 0,
      diaryDate || now.split(' ')[0],
      now,
      now,
    ]
  )

  // 获取新插入的记录
  const newResult = await db.execute(
    'SELECT * FROM diaries WHERE couple_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1',
    [coupleId, userId]
  )

  return success({
    id: (newResult.rows[0] as any).id,
  })
})
