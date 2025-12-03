import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
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

  // 获取查询参数
  const query = getQuery(event)
  const month = query.month as string // 格式: 2024-01
  const status = query.status !== undefined ? Number(query.status) : null

  // 构建查询
  let sql = 'SELECT s.*, u.nick_name, u.avatar_url FROM schedules s LEFT JOIN users u ON s.user_id = u.id WHERE s.couple_id = ?'
  const params: any[] = [couple.id]

  if (month) {
    sql += ' AND (s.start_time LIKE ? OR s.end_time LIKE ?)'
    params.push(`${month}%`, `${month}%`)
  }

  if (status !== null) {
    sql += ' AND s.status = ?'
    params.push(status)
  }

  sql += ' ORDER BY s.start_time ASC'

  const schedulesResult = await db.execute(sql, params)
  const schedules = schedulesResult.rows as any[]

  // 格式化返回数据
  const formattedSchedules = schedules.map((s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    startTime: s.start_time,
    endTime: s.end_time,
    isAllDay: s.is_all_day === 1,
    location: s.location,
    latitude: s.latitude,
    longitude: s.longitude,
    repeatType: s.repeat_type,
    color: s.color,
    status: s.status,
    createTime: s.create_time,
    updateTime: s.update_time,
    creator: {
      id: s.user_id,
      nickName: s.nick_name,
      avatarUrl: s.avatar_url,
    },
  }))

  return success(formattedSchedules)
})
