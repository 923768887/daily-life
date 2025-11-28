import { eq, or } from 'drizzle-orm'
import { db, couples, users } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 查找情侣关系
  const couple = await db.query.couples.findFirst({
    where: or(
      eq(couples.userId, userId),
      eq(couples.partnerId, userId)
    ),
  })

  // 获取当前用户信息
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  // 未配对时返回基本信息
  if (!couple || couple.status !== 1) {
    return success({
      coupleId: null,
      loveStartDate: null,
      loveDays: 0,
      myInfo: {
        id: currentUser?.id,
        nickName: currentUser?.nickName,
        avatarUrl: currentUser?.avatarUrl,
      },
      partnerInfo: null,
    })
  }

  // 获取双方信息
  const myId = couple.userId === userId ? couple.userId : couple.partnerId
  const partnerId = couple.userId === userId ? couple.partnerId : couple.userId

  const [myInfo, partnerInfo] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, myId!) }),
    db.query.users.findFirst({ where: eq(users.id, partnerId!) }),
  ])

  // 计算恋爱天数
  const loveDays = couple.loveStartDate
    ? Math.ceil((Date.now() - new Date(couple.loveStartDate).getTime()) / (1000 * 60 * 60 * 24))
    : 1 // 至少显示1天

  return success({
    coupleId: couple.id,
    loveStartDate: couple.loveStartDate,
    loveDays,
    relationshipType: couple.relationshipType,
    coupleAvatar: couple.coupleAvatar,
    signature: couple.signature,
    theme: couple.theme,
    myInfo: {
      id: myInfo?.id,
      nickName: myInfo?.nickName,
      coupleNickname: couple.userId === userId ? couple.coupleNickname1 : couple.coupleNickname2,
      avatarUrl: myInfo?.avatarUrl,
    },
    partnerInfo: {
      id: partnerInfo?.id,
      nickName: partnerInfo?.nickName,
      coupleNickname: couple.userId === userId ? couple.coupleNickname2 : couple.coupleNickname1,
      avatarUrl: partnerInfo?.avatarUrl,
    },
  })
})
