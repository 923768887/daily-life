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

  const body = await readBody(event)
  const {
    title,
    description,
    category,
    startDate,
    startTime,
    endDate,
    endTime,
    isAllDay,
    location,
    color,
    status,
  } = body

  // 构建更新字段
  const updates: string[] = []
  const params: any[] = []

  if (title !== undefined) {
    updates.push('title = ?')
    params.push(title.trim())
  }

  if (description !== undefined) {
    updates.push('description = ?')
    params.push(description?.trim() || null)
  }

  if (category !== undefined) {
    updates.push('category = ?')
    params.push(category)
  }

  if (startDate !== undefined) {
    const startDateTime = isAllDay 
      ? `${startDate} 00:00:00` 
      : `${startDate} ${startTime || '00:00'}:00`
    updates.push('start_time = ?')
    params.push(startDateTime)
  }

  if (endDate !== undefined) {
    const endDateTime = endDate 
      ? (isAllDay ? `${endDate} 23:59:59` : `${endDate} ${endTime || '23:59'}:00`)
      : null
    updates.push('end_time = ?')
    params.push(endDateTime)
  }

  if (isAllDay !== undefined) {
    updates.push('is_all_day = ?')
    params.push(isAllDay ? 1 : 0)
  }

  if (location !== undefined) {
    updates.push('location = ?')
    params.push(location?.trim() || null)
  }

  if (color !== undefined) {
    updates.push('color = ?')
    params.push(color)
  }

  if (status !== undefined) {
    updates.push('status = ?')
    params.push(status)
  }

  if (updates.length === 0) {
    return error(ResponseCode.PARAM_ERROR, '没有要更新的内容')
  }

  const now = formatDateTime()
  updates.push('update_time = ?')
  params.push(now)

  // 添加 WHERE 条件参数
  params.push(id)

  await db.execute(
    `UPDATE schedules SET ${updates.join(', ')} WHERE id = ?`,
    params
  )

  return success({ message: '更新成功' })
})
