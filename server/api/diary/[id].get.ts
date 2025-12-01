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

  // 获取日记详情
  const diaryResult = await db.execute(
    'SELECT * FROM diaries WHERE id = ? LIMIT 1',
    [id]
  )
  const diary = diaryResult.rows[0] as any

  if (!diary) {
    return error(ResponseCode.NOT_FOUND, '日记不存在')
  }

  // 检查权限：只能查看自己或情侣的日记
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE user_id = ? OR partner_id = ? LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  if (diary.couple_id !== couple?.id && diary.user_id !== userId) {
    return error(ResponseCode.FORBIDDEN, '无权查看此日记')
  }

  // 私密日记只能作者本人查看
  if (diary.is_private === 1 && diary.user_id !== userId) {
    return error(ResponseCode.FORBIDDEN, '这是一篇私密日记')
  }

  // 获取作者信息
  const authorResult = await db.execute(
    'SELECT id, nick_name, avatar_url FROM users WHERE id = ? LIMIT 1',
    [diary.user_id]
  )
  const author = authorResult.rows[0] as any

  // 获取点赞状态
  const likedResult = await db.execute(
    'SELECT * FROM likes WHERE target_type = ? AND target_id = ? AND user_id = ? LIMIT 1',
    ['diary', diary.id, userId]
  )
  const isLiked = !!likedResult.rows[0]

  // 获取评论列表（包含回复信息）
  const commentsResult = await db.execute(
    `SELECT c.*, u.nick_name, u.avatar_url,
            p.user_id as reply_to_user_id,
            pu.nick_name as reply_to_nick_name
     FROM comments c 
     LEFT JOIN users u ON c.user_id = u.id 
     LEFT JOIN comments p ON c.parent_id = p.id
     LEFT JOIN users pu ON p.user_id = pu.id
     WHERE c.target_type = 'diary' AND c.target_id = ? 
     ORDER BY c.create_time ASC`,
    [diary.id]
  )
  
  const comments = commentsResult.rows.map((c: any) => ({
    id: c.id,
    content: c.content,
    parentId: c.parent_id,
    createTime: c.create_time,
    user: {
      id: c.user_id,
      nickName: c.nick_name,
      avatarUrl: c.avatar_url,
    },
    replyToUser: c.parent_id ? {
      id: c.reply_to_user_id,
      nickName: c.reply_to_nick_name,
    } : null,
  }))

  return success({
    id: diary.id,
    title: diary.title,
    content: diary.content,
    mood: diary.mood,
    weather: diary.weather,
    location: diary.location,
    latitude: diary.latitude,
    longitude: diary.longitude,
    images: diary.images ? JSON.parse(diary.images) : [],
    isPrivate: diary.is_private === 1,
    likeCount: diary.like_count || 0,
    commentCount: comments.length, // 使用实际评论数量
    diaryDate: diary.diary_date,
    createTime: diary.create_time,
    updateTime: diary.update_time,
    author: {
      id: author?.id,
      nickName: author?.nick_name,
      avatarUrl: author?.avatar_url,
    },
    isLiked,
    comments,
    isOwner: diary.user_id === userId,
  })
})
