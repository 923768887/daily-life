import { eq, desc, and, like, gte, lte, or } from 'drizzle-orm'
import { db, diaries, users, likes, couples } from '~/server/database'
import { paginated, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
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
  
  const coupleId = couple?.id

  const body = await readBody(event)
  const {
    page = 1,
    size = 20,
    mood,
    startDate,
    endDate,
    keyword,
  } = body

  // 构建查询条件
  const conditions = [eq(diaries.coupleId, coupleId)]

  if (mood) {
    conditions.push(eq(diaries.mood, mood))
  }
  if (startDate) {
    conditions.push(gte(diaries.diaryDate, startDate))
  }
  if (endDate) {
    conditions.push(lte(diaries.diaryDate, endDate))
  }
  if (keyword) {
    conditions.push(like(diaries.content, `%${keyword}%`))
  }

  // 查询日记列表
  const offset = (page - 1) * size
  const diaryList = await db.query.diaries.findMany({
    where: and(...conditions),
    orderBy: [desc(diaries.diaryDate), desc(diaries.createTime)],
    limit: size,
    offset,
  })

  // 获取作者信息和点赞状态
  const result = await Promise.all(
    diaryList.map(async (diary) => {
      const author = await db.query.users.findFirst({
        where: eq(users.id, diary.userId),
      })

      const liked = await db.query.likes.findFirst({
        where: and(
          eq(likes.targetType, 'diary'),
          eq(likes.targetId, diary.id),
          eq(likes.userId, userId)
        ),
      })

      return {
        id: diary.id,
        title: diary.title,
        content: diary.content,
        mood: diary.mood,
        weather: diary.weather,
        location: diary.location,
        images: diary.images ? JSON.parse(diary.images) : [],
        isPrivate: diary.isPrivate === 1,
        likeCount: diary.likeCount,
        commentCount: diary.commentCount,
        diaryDate: diary.diaryDate,
        createTime: diary.createTime,
        author: {
          id: author?.id,
          nickName: author?.nickName,
          avatarUrl: author?.avatarUrl,
        },
        isLiked: !!liked,
      }
    })
  )

  // TODO: 获取总数
  const total = diaryList.length

  return paginated(result, page, size, total)
})
