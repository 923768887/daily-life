import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const body = await readBody(event)
  const { diaryId } = body

  if (!diaryId) {
    return error(ResponseCode.PARAM_ERROR, '缺少日记ID')
  }

  // 检查日记是否存在
  const diaryResult = await db.execute(
    'SELECT * FROM diaries WHERE id = ? LIMIT 1',
    [diaryId]
  )
  const diary = diaryResult.rows[0] as any

  if (!diary) {
    return error(ResponseCode.NOT_FOUND, '日记不存在')
  }

  // 检查是否已点赞
  const likedResult = await db.execute(
    'SELECT * FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ? LIMIT 1',
    ['diary', diaryId, userId]
  )
  const liked = likedResult.rows[0]

  const now = formatDateTime()

  if (liked) {
    // 取消点赞
    await db.execute(
      'DELETE FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ?',
      ['diary', diaryId, userId]
    )
    await db.execute(
      'UPDATE diaries SET like_count = COALESCE(like_count, 0) - 1 WHERE id = ?',
      [diaryId]
    )
    return success({ isLiked: false, likeCount: Math.max(0, (diary.like_count || 0) - 1) })
  } else {
    // 点赞
    await db.execute(
      'INSERT INTO likes (target_type, target_id, user_id, create_time) VALUES (?, ?, ?, ?)',
      ['diary', diaryId, userId, now]
    )
    await db.execute(
      'UPDATE diaries SET like_count = COALESCE(like_count, 0) + 1 WHERE id = ?',
      [diaryId]
    )
    return success({ isLiked: true, likeCount: (diary.like_count || 0) + 1 })
  }
})
