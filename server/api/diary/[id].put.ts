import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const id = getRouterParam(event, 'id')
  
  if (!id) {
    return error(ResponseCode.PARAM_ERROR, '缺少日记ID')
  }

  // 检查日记是否存在且属于当前用户
  const diaryResult = await db.execute(
    'SELECT * FROM diaries WHERE id = ? LIMIT 1',
    [id]
  )
  const diary = diaryResult.rows[0] as any

  if (!diary) {
    return error(ResponseCode.NOT_FOUND, '日记不存在')
  }

  if (diary.user_id !== userId) {
    return error(ResponseCode.FORBIDDEN, '只能编辑自己的日记')
  }

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
    `UPDATE diaries SET 
      title = ?, 
      content = ?, 
      mood = ?, 
      weather = ?, 
      location = ?, 
      latitude = ?, 
      longitude = ?, 
      images = ?, 
      is_private = ?, 
      diary_date = ?,
      update_time = ?
     WHERE id = ?`,
    [
      title || null,
      content,
      mood || null,
      weather || null,
      location || null,
      latitude || null,
      longitude || null,
      images ? JSON.stringify(images) : null,
      isPrivate ? 1 : 0,
      diaryDate || diary.diary_date,
      now,
      id,
    ]
  )

  return success({ id: Number(id) })
})
