import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const id = getRouterParam(event, 'id')
  
  if (!id) {
    return error(ResponseCode.PARAM_ERROR, '缺少日记ID')
  }

  // 检查日记是否存在且属于当前用户
  const diaryResult = await db.execute(
    'SELECT * FROM diaries WHERE id = ? LIMIT 1',
    [id]
  )
  const diary = diaryResult.rows[0] as any

  if (!diary) {
    return error(ResponseCode.NOT_FOUND, '日记不存在')
  }

  if (diary.user_id !== userId) {
    return error(ResponseCode.FORBIDDEN, '只能删除自己的日记')
  }

  // 删除相关的点赞记录
  await db.execute(
    "DELETE FROM likes WHERE target_type = 'diary' AND target_id = ?",
    [id]
  )

  // 删除相关的评论记录
  await db.execute(
    "DELETE FROM comments WHERE target_type = 'diary' AND target_id = ?",
    [id]
  )

  // 删除日记
  await db.execute('DELETE FROM diaries WHERE id = ?', [id])

  return success({ id: Number(id) })
})
