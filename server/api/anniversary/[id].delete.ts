import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
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

  await db.execute('DELETE FROM anniversaries WHERE id = ?', [id])

  return success({ message: '删除成功' })
})
