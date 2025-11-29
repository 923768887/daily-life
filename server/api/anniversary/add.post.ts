import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  try {
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

    await db.execute(
      `INSERT INTO anniversaries (couple_id, user_id, title, description, date, type, icon, color, images, is_repeat, remind_days, create_time, update_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        coupleId,
        userId,
        title,
        description || null,
        date,
        type || 'custom',
        icon || '❤️',
        color || '#FFE4E9',
        images ? JSON.stringify(images) : null,
        isRepeat !== false ? 1 : 0,
        remindDays ? JSON.stringify(remindDays) : '[1,7]',
        now,
        now,
      ]
    )

    // 获取新插入的记录
    const newResult = await db.execute(
      'SELECT * FROM anniversaries WHERE couple_id = ? AND user_id = ? ORDER BY id DESC LIMIT 1',
      [coupleId, userId]
    )

    return success({
      id: (newResult.rows[0] as any)?.id || Date.now(),
    })
  } catch (err: any) {
    console.error('添加纪念日失败:', err)
    return error(ResponseCode.SERVER_ERROR, err.message || '添加失败')
  }
})
