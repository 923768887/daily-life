import { eq, or } from 'drizzle-orm'
import { db, anniversaries, couples } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
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
      description,
      date,
      type,
      icon,
      color,
      images,
      isRepeat,
      remindDays,
    } = body

    if (!title || !date) {
      return error(ResponseCode.PARAM_ERROR, '请填写完整信息')
    }

    const now = formatDateTime()

    const result = await db.insert(anniversaries).values({
      coupleId,
      userId,
      title,
      description,
      date,
      type: type || 'custom',
      icon: icon || '❤️',
      color: color || '#FFE4E9',
      images: images ? JSON.stringify(images) : null,
      isRepeat: isRepeat !== false ? 1 : 0,
      remindDays: remindDays ? JSON.stringify(remindDays) : '[1,7]',
      createTime: now,
      updateTime: now,
    } as any).returning()

    return success({
      id: result[0]?.id || Date.now(),
    })
  } catch (err: any) {
    console.error('添加纪念日失败:', err)
    return error(ResponseCode.SERVER_ERROR, err.message || '添加失败')
  }
})
