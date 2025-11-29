import { eq, or } from 'drizzle-orm'
import { db, couples } from '~/server/database'
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
  const couple = await db.query.couples.findFirst({
    where: or(
      eq(couples.userId, userId),
      eq(couples.partnerId, userId)
    ),
  })

  if (!couple || couple.status !== 1) {
    return error(ResponseCode.NOT_FOUND, '未找到配对信息')
  }

  // 构建更新数据
  const updateData: any = {
    updateTime: formatDateTime(),
  }

  if (loveStartDate) {
    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(loveStartDate)) {
      return error(ResponseCode.PARAM_ERROR, '日期格式错误，请使用 YYYY-MM-DD 格式')
    }
    // 不能是未来日期
    if (new Date(loveStartDate) > new Date()) {
      return error(ResponseCode.PARAM_ERROR, '恋爱开始日期不能是未来日期')
    }
    updateData.loveStartDate = loveStartDate
  }

  if (relationshipType !== undefined) {
    updateData.relationshipType = relationshipType
  }

  if (signature !== undefined) {
    updateData.signature = signature
  }

  // 更新情侣昵称（根据是哪一方）
  if (coupleNickname !== undefined) {
    if (couple.userId === userId) {
      updateData.coupleNickname1 = coupleNickname
    } else {
      updateData.coupleNickname2 = coupleNickname
    }
  }

  // 更新数据库
  await db.update(couples)
    .set(updateData)
    .where(eq(couples.id, couple.id))

  // 计算新的恋爱天数
  const newLoveStartDate = updateData.loveStartDate || couple.loveStartDate
  const loveDays = newLoveStartDate
    ? Math.ceil((Date.now() - new Date(newLoveStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1

  return success({
    coupleId: couple.id,
    loveStartDate: newLoveStartDate,
    loveDays,
    relationshipType: updateData.relationshipType ?? couple.relationshipType,
    signature: updateData.signature ?? couple.signature,
  })
})
