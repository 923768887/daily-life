import { eq, and } from 'drizzle-orm'
import { db, couples, invites, users } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const body = await readBody(event)
  const { inviteCode } = body

  if (!inviteCode) {
    return error(ResponseCode.PARAM_ERROR, '请输入邀请码')
  }

  // 查找邀请码
  const invite = await db.query.invites.findFirst({
    where: and(
      eq(invites.code, inviteCode),
      eq(invites.status, 0)
    ),
  })

  if (!invite) {
    return error(ResponseCode.INVALID_INVITE_CODE, '邀请码无效')
  }

  // 检查是否过期
  if (new Date(invite.expireTime) < new Date()) {
    return error(ResponseCode.INVITE_CODE_EXPIRED, '邀请码已过期')
  }

  // 不能和自己配对
  if (invite.userId === userId) {
    return error(ResponseCode.PARAM_ERROR, '不能和自己配对')
  }

  const now = formatDateTime()
  const today = now.split(' ')[0] // 获取日期部分

  // 更新情侣关系 - 直接设置为已配对状态
  await db.update(couples)
    .set({
      partnerId: userId,
      status: 1, // 已配对
      loveStartDate: today, // 设置恋爱开始日期为今天
      updateTime: now,
    })
    .where(eq(couples.id, invite.coupleId))

  // 更新邀请码状态
  await db.update(invites)
    .set({ status: 1 })
    .where(eq(invites.id, invite.id))

  // 获取对方信息
  const partner = await db.query.users.findFirst({
    where: eq(users.id, invite.userId),
  })

  return success({
    coupleId: invite.coupleId,
    status: 1,
    loveStartDate: today,
    partnerInfo: {
      id: partner?.id,
      nickName: partner?.nickName,
      avatarUrl: partner?.avatarUrl,
    },
  })
})
