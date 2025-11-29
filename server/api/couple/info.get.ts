import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 查找情侣关系
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  // 获取当前用户信息
  const currentUserResult = await db.execute(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [userId]
  )
  const currentUser = currentUserResult.rows[0] as any

  // 未配对时返回基本信息
  if (!couple || couple.status !== 1) {
    return success({
      coupleId: null,
      loveStartDate: null,
      loveDays: 0,
      myInfo: {
        id: currentUser?.id,
        nickName: currentUser?.nick_name,
        avatarUrl: currentUser?.avatar_url,
      },
      partnerInfo: null,
    })
  }

  // 获取双方信息
  const myId = couple.user_id === userId ? couple.user_id : couple.partner_id
  const partnerId = couple.user_id === userId ? couple.partner_id : couple.user_id

  const [myInfoResult, partnerInfoResult] = await Promise.all([
    db.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [myId]),
    db.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [partnerId]),
  ])
  const myInfo = myInfoResult.rows[0] as any
  const partnerInfo = partnerInfoResult.rows[0] as any

  // 计算恋爱天数
  const loveDays = couple.love_start_date
    ? Math.ceil((Date.now() - new Date(couple.love_start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 1

  return success({
    coupleId: couple.id,
    loveStartDate: couple.love_start_date,
    loveDays,
    relationshipType: couple.relationship_type,
    coupleAvatar: couple.couple_avatar,
    signature: couple.signature,
    theme: couple.theme,
    myInfo: {
      id: myInfo?.id,
      nickName: myInfo?.nick_name,
      coupleNickname: couple.user_id === userId ? couple.couple_nickname_1 : couple.couple_nickname_2,
      avatarUrl: myInfo?.avatar_url,
    },
    partnerInfo: {
      id: partnerInfo?.id,
      nickName: partnerInfo?.nick_name,
      coupleNickname: couple.user_id === userId ? couple.couple_nickname_2 : couple.couple_nickname_1,
      avatarUrl: partnerInfo?.avatar_url,
    },
  })
})
