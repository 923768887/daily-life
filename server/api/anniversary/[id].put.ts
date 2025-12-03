import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)

  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const idParam = getRouterParam(event, 'id')
  const id = idParam ? Number(idParam) : NaN

  if (!id || Number.isNaN(id)) {
    return error(ResponseCode.PARAM_ERROR, '缺少有效的纪念日ID')
  }

  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const coupleId = (coupleResult.rows[0] as any)?.id

  if (!coupleId) {
    return error(ResponseCode.NOT_PAIRED, '请先完成情侣配对')
  }

  const annResult = await db.execute(
    'SELECT * FROM anniversaries WHERE id = ? AND couple_id = ? LIMIT 1',
    [id, coupleId]
  )
  const anniversary = annResult.rows[0] as any

  if (!anniversary) {
    return error(ResponseCode.NOT_FOUND, '纪念日不存在')
  }

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
    isActive,
  } = body

  const updates: string[] = []
  const params: any[] = []

  const pushUpdate = (field: string, value: any) => {
    updates.push(`${field} = ?`)
    params.push(value)
  }

  if (title !== undefined) {
    pushUpdate('title', title.trim())
  }
  if (description !== undefined) {
    pushUpdate('description', description?.trim() || null)
  }
  if (date !== undefined) {
    pushUpdate('date', date)
  }
  if (type !== undefined) {
    pushUpdate('type', type)
  }
  if (icon !== undefined) {
    pushUpdate('icon', icon)
  }
  if (color !== undefined) {
    pushUpdate('color', color)
  }
  if (images !== undefined) {
    pushUpdate('images', images ? JSON.stringify(images) : null)
  }
  if (isRepeat !== undefined) {
    pushUpdate('is_repeat', isRepeat ? 1 : 0)
  }
  if (remindDays !== undefined) {
    pushUpdate('remind_days', remindDays ? JSON.stringify(remindDays) : null)
  }
  if (isActive !== undefined) {
    pushUpdate('is_active', isActive ? 1 : 0)
  }

  if (updates.length === 0) {
    return error(ResponseCode.PARAM_ERROR, '没有要更新的内容')
  }

  pushUpdate('update_time', formatDateTime())
  params.push(id)

  await db.execute(
    `UPDATE anniversaries SET ${updates.join(', ')} WHERE id = ?`,
    params
  )

  return success({ message: '更新成功' })
})
