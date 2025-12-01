import { db } from '~/server/database'
import { paginated, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 获取用户的 coupleId
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const coupleId = (coupleResult.rows[0] as any)?.id

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
  let sql = 'SELECT * FROM diaries WHERE couple_id = ?'
  const params: any[] = [coupleId]

  if (mood) {
    sql += ' AND mood = ?'
    params.push(mood)
  }
  if (startDate) {
    sql += ' AND diary_date >= ?'
    params.push(startDate)
  }
  if (endDate) {
    sql += ' AND diary_date <= ?'
    params.push(endDate)
  }
  if (keyword) {
    sql += ' AND content LIKE ?'
    params.push(`%${keyword}%`)
  }

  sql += ' ORDER BY diary_date DESC, create_time DESC'
  
  const offset = (page - 1) * size
  sql += ` LIMIT ${size} OFFSET ${offset}`

  const diaryResult = await db.execute(sql, params)
  const diaryList = diaryResult.rows as any[]

  // 获取作者信息、点赞状态和实际评论数
  const result = await Promise.all(
    diaryList.map(async (diary) => {
      const authorResult = await db.execute(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [diary.user_id]
      )
      const author = authorResult.rows[0] as any

      const likedResult = await db.execute(
        'SELECT * FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ? LIMIT 1',
        ['diary', diary.id, userId]
      )
      const liked = likedResult.rows[0]

      // 获取实际评论数
      const commentCountResult = await db.execute(
        'SELECT COUNT(*) as count FROM comments WHERE target_type = ? AND target_id = ?',
        ['diary', diary.id]
      )
      const commentCount = (commentCountResult.rows[0] as any)?.count || 0

      return {
        id: diary.id,
        title: diary.title,
        content: diary.content,
        mood: diary.mood,
        weather: diary.weather,
        location: diary.location,
        images: diary.images ? JSON.parse(diary.images) : [],
        isPrivate: diary.is_private === 1,
        likeCount: diary.like_count || 0,
        commentCount: commentCount,
        diaryDate: diary.diary_date,
        createTime: diary.create_time,
        author: {
          id: author?.id,
          nickName: author?.nick_name,
          avatarUrl: author?.avatar_url,
        },
        isLiked: !!liked,
      }
    })
  )

  const total = diaryList.length

  return paginated(result, page, size, total)
})
