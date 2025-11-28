import { eq, asc, or } from 'drizzle-orm'
import { db, anniversaries, couples } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
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
  
  const coupleId = couple?.id
  
  if (!coupleId) {
    return success({ list: [] })
  }

  const list = await db.query.anniversaries.findMany({
    where: eq(anniversaries.coupleId, coupleId),
    orderBy: [asc(anniversaries.date)],
  })

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
