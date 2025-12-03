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
    'SELECT * FROM couples WHERE (user_id = ? OR partner_id = ?) AND status = 1 LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  if (!couple) {
    return error(ResponseCode.NOT_PAIRED, '请先完成情侣配对')
  }

  const body = await readBody(event)
  const {
    title,
    description,
    category = 'other',
    startDate,
    startTime,
    endDate,
    endTime,
    isAllDay = false,
    location,
    color = '#FF6B9D',
  } = body

  // 验证必填字段
  if (!title?.trim()) {
    return error(ResponseCode.PARAM_ERROR, '请输入日程标题')
  }

  if (!startDate) {
    return error(ResponseCode.PARAM_ERROR, '请选择开始日期')
  }

  // 构建时间字符串
  const startDateTime = isAllDay 
    ? `${startDate} 00:00:00` 
    : `${startDate} ${startTime || '00:00'}:00`
  
  const endDateTime = endDate 
    ? (isAllDay ? `${endDate} 23:59:59` : `${endDate} ${endTime || '23:59'}:00`)
    : null

  const now = formatDateTime()

  // 插入日程
  await db.execute(
    `INSERT INTO schedules (couple_id, user_id, title, description, category, start_time, end_time, is_all_day, location, color, status, create_time, update_time) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [couple.id, userId, title.trim(), description?.trim() || null, category, startDateTime, endDateTime, isAllDay ? 1 : 0, location?.trim() || null, color, now, now]
  )

  // 获取新创建的日程
  const newScheduleResult = await db.execute(
    'SELECT * FROM schedules WHERE couple_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1',
    [couple.id, userId]
  )
  const newSchedule = newScheduleResult.rows[0] as any

  return success({
    id: newSchedule.id,
    title: newSchedule.title,
    description: newSchedule.description,
    category: newSchedule.category,
    startTime: newSchedule.start_time,
    endTime: newSchedule.end_time,
    isAllDay: newSchedule.is_all_day === 1,
    location: newSchedule.location,
    color: newSchedule.color,
    status: newSchedule.status,
    createTime: newSchedule.create_time,
  })
})
