import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const body = await readBody(event)
  const { loveStartDate, relationshipType, signature, coupleNickname } = body

  // 查找情侣关系
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  if (!couple || couple.status !== 1) {
    return error(ResponseCode.NOT_FOUND, '未找到配对信息')
  }

  // 构建更新 SQL
  const updates: string[] = []
  const params: any[] = []

  updates.push('update_time = ?')
  params.push(formatDateTime())

  if (loveStartDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(loveStartDate)) {
      return error(ResponseCode.PARAM_ERROR, '日期格式错误，请使用 YYYY-MM-DD 格式')
    }
    if (new Date(loveStartDate) > new Date()) {
      return error(ResponseCode.PARAM_ERROR, '恋爱开始日期不能是未来日期')
    }
    updates.push('love_start_date = ?')
    params.push(loveStartDate)
  }

  if (relationshipType !== undefined) {
    updates.push('relationship_type = ?')
    params.push(relationshipType)
  }

  if (signature !== undefined) {
    updates.push('signature = ?')
    params.push(signature)
  }

  if (coupleNickname !== undefined) {
    if (couple.user_id === userId) {
      updates.push('couple_nickname_1 = ?')
    } else {
      updates.push('couple_nickname_2 = ?')
    }
    params.push(coupleNickname)
  }

  // 更新数据库
  params.push(couple.id)
  await db.execute(
    `UPDATE couples SET ${updates.join(', ')} WHERE id = ?`,
    params
  )

  // 计算新的恋爱天数
  const newLoveStartDate = loveStartDate || couple.love_start_date
  const loveDays = newLoveStartDate
    ? Math.ceil((Date.now() - new Date(newLoveStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1

  return success({
    coupleId: couple.id,
    loveStartDate: newLoveStartDate,
    loveDays,
    relationshipType: relationshipType ?? couple.relationship_type,
    signature: signature ?? couple.signature,
  })
})
