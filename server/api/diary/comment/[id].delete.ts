import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const commentId = getRouterParam(event, 'id')
  
  if (!commentId) {
    return error(ResponseCode.PARAM_ERROR, '缺少评论ID')
  }

  // 获取评论
  const commentResult = await db.execute(
    'SELECT * FROM comments WHERE id = ? LIMIT 1',
    [commentId]
  )
  const comment = commentResult.rows[0] as any

  if (!comment) {
    return error(ResponseCode.NOT_FOUND, '评论不存在')
  }

  // 只能删除自己的评论
  if (comment.user_id !== userId) {
    return error(ResponseCode.FORBIDDEN, '无权删除此评论')
  }

  // 统计要删除的评论数（包括子评论）
  const childCountResult = await db.execute(
    'SELECT COUNT(*) as count FROM comments WHERE parent_id = ?',
    [commentId]
  )
  const childCount = (childCountResult.rows[0] as any)?.count || 0
  const totalDeleted = 1 + childCount

  // 删除评论
  await db.execute('DELETE FROM comments WHERE id = ?', [commentId])

  // 删除子评论（回复）
  await db.execute('DELETE FROM comments WHERE parent_id = ?', [commentId])

  // 更新日记评论数
  let newCommentCount = 0
  if (comment.target_type === 'diary') {
    await db.execute(
      'UPDATE diaries SET comment_count = COALESCE(comment_count, 0) - ? WHERE id = ?',
      [totalDeleted, comment.target_id]
    )
    // 获取更新后的评论数
    const diaryResult = await db.execute(
      'SELECT comment_count FROM diaries WHERE id = ? LIMIT 1',
      [comment.target_id]
    )
    newCommentCount = Math.max(0, (diaryResult.rows[0] as any)?.comment_count || 0)
  }

  return success({ 
    message: '删除成功',
    commentCount: newCommentCount,
  })
})
