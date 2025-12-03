import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
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

  // 获取日程详情
  const scheduleResult = await db.execute(
    `SELECT s.*, u.nick_name, u.avatar_url 
     FROM schedules s 
     LEFT JOIN users u ON s.user_id = u.id 
     WHERE s.id = ? AND s.couple_id = ? LIMIT 1`,
    [id, couple.id]
  )
  const schedule = scheduleResult.rows[0] as any

  if (!schedule) {
    return error(ResponseCode.NOT_FOUND, '日程不存在')
  }

  return success({
    id: schedule.id,
    title: schedule.title,
    description: schedule.description,
    category: schedule.category,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    isAllDay: schedule.is_all_day === 1,
    location: schedule.location,
    latitude: schedule.latitude,
    longitude: schedule.longitude,
    repeatType: schedule.repeat_type,
    color: schedule.color,
    status: schedule.status,
    createTime: schedule.create_time,
    updateTime: schedule.update_time,
    creator: {
      id: schedule.user_id,
      nickName: schedule.nick_name,
      avatarUrl: schedule.avatar_url,
    },
    isOwner: schedule.user_id === userId,
  })
})
