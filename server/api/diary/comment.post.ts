import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const body = await readBody(event)
  const { diaryId, content } = body

  if (!diaryId) {
    return error(ResponseCode.PARAM_ERROR, '缺少日记ID')
  }

  if (!content || !content.trim()) {
    return error(ResponseCode.PARAM_ERROR, '请输入评论内容')
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

  const now = formatDateTime()

  // 添加评论
  await db.execute(
    'INSERT INTO comments (target_type, target_id, user_id, content, create_time) VALUES (?, ?, ?, ?, ?)',
    ['diary', diaryId, userId, content.trim(), now]
  )

  // 更新评论数
  await db.execute(
    'UPDATE diaries SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = ?',
    [diaryId]
  )

  // 获取新评论
  const newCommentResult = await db.execute(
    `SELECT c.*, u.nick_name, u.avatar_url 
     FROM comments c 
     LEFT JOIN users u ON c.user_id = u.id 
     WHERE c.target_type = 'diary' AND c.target_id = ? AND c.user_id = ?
     ORDER BY c.id DESC LIMIT 1`,
    [diaryId, userId]
  )
  const newComment = newCommentResult.rows[0] as any

  return success({
    id: newComment.id,
    content: newComment.content,
    createTime: newComment.create_time,
    user: {
      id: newComment.user_id,
      nickName: newComment.nick_name,
      avatarUrl: newComment.avatar_url,
    },
    commentCount: (diary.comment_count || 0) + 1,
  })
})
