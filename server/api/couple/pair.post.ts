import { db } from '~/server/database'
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
  const inviteResult = await db.execute(
    'SELECT * FROM invites WHERE code = ? AND status = 0 LIMIT 1',
    [inviteCode]
  )
  const invite = inviteResult.rows[0] as any

  if (!invite) {
    return error(ResponseCode.INVALID_INVITE_CODE, '邀请码无效')
  }

  // 检查是否过期
  if (new Date(invite.expire_time) < new Date()) {
    return error(ResponseCode.INVITE_CODE_EXPIRED, '邀请码已过期')
  }

  // 不能和自己配对
  if (invite.user_id === userId) {
    return error(ResponseCode.PARAM_ERROR, '不能和自己配对')
  }

  const now = formatDateTime()
  const today = now.split(' ')[0]

  // 更新情侣关系
  await db.execute(
    'UPDATE couples SET partner_id = ?, status = 1, love_start_date = ?, update_time = ? WHERE id = ?',
    [userId, today, now, invite.couple_id]
  )

  // 更新邀请码状态
  await db.execute(
    'UPDATE invites SET status = 1 WHERE id = ?',
    [invite.id]
  )

  // 获取对方信息
  const partnerResult = await db.execute(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [invite.user_id]
  )
  const partner = partnerResult.rows[0] as any

  return success({
    coupleId: invite.couple_id,
    status: 1,
    loveStartDate: today,
    partnerInfo: {
      id: partner?.id,
      nickName: partner?.nick_name,
      avatarUrl: partner?.avatar_url,
    },
  })
})
