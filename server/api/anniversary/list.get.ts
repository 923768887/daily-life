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
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const coupleId = (coupleResult.rows[0] as any)?.id
  
  if (!coupleId) {
    return success({ list: [] })
  }

  const listResult = await db.execute(
    'SELECT * FROM anniversaries WHERE couple_id = ? ORDER BY date ASC',
    [coupleId]
  )
  const list = listResult.rows as any[]

  const today = new Date()
  const result = list.map((ann) => {
    const annDate = new Date(ann.date)
    annDate.setFullYear(today.getFullYear())
    if (annDate < today) {
      annDate.setFullYear(today.getFullYear() + 1)
    }
    const daysToNext = Math.ceil((annDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return {
      id: ann.id,
      title: ann.title,
      date: ann.date,
      type: ann.type,
      icon: ann.icon,
      color: ann.color,
      daysCount: Math.ceil((today.getTime() - new Date(ann.date).getTime()) / (1000 * 60 * 60 * 24)),
      nextDate: annDate.toISOString().split('T')[0],
      daysToNext,
    }
  })

  // 按距离下次的天数排序
  result.sort((a, b) => a.daysToNext - b.daysToNext)

  return success({ list: result })
})
