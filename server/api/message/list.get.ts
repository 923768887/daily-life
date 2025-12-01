import { db } from '~/server/database'
import { success, error, ResponseCode } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  // 获取用户的 coupleId
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE (user_id = ? OR partner_id = ?) AND status = 1 LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  if (!couple) {
    return error(ResponseCode.NOT_FOUND, '请先完成情侣配对')
  }

  // 获取查询参数
  const query = getQuery(event)
  const limit = Number(query.limit) || 50
  const beforeId = query.beforeId ? Number(query.beforeId) : null

  // 构建查询
  let sql = 'SELECT * FROM messages WHERE couple_id = ?'
  const params: any[] = [couple.id]

  if (beforeId) {
    sql += ' AND id < ?'
    params.push(beforeId)
  }

  sql += ' ORDER BY id DESC LIMIT ?'
  params.push(limit)

  const messagesResult = await db.execute(sql, params)
  const messages = messagesResult.rows as any[]

  // 标记消息为已读（对方发给我的消息）
  await db.execute(
    'UPDATE messages SET is_read = 1, read_time = ? WHERE couple_id = ? AND receiver_id = ? AND is_read = 0',
    [new Date().toISOString(), couple.id, userId]
  )

  // 获取伴侣信息
  const partnerId = couple.user_id === userId ? couple.partner_id : couple.user_id
  const partnerResult = await db.execute(
    'SELECT id, nick_name, avatar_url FROM users WHERE id = ? LIMIT 1',
    [partnerId]
  )
  const partner = partnerResult.rows[0] as any

  // 格式化消息列表（按时间正序返回）
  const formattedMessages = messages.reverse().map((msg: any) => ({
    id: msg.id,
    type: msg.type,
    content: msg.content,
    mediaUrl: msg.media_url,
    specialType: msg.special_type,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    isRead: msg.is_read === 1,
    readTime: msg.read_time,
    createTime: msg.create_time,
  }))

  return success({
    messages: formattedMessages,
    partner: partner ? {
      id: partner.id,
      nickName: partner.nick_name,
      avatarUrl: partner.avatar_url,
    } : null,
    hasMore: messages.length === limit,
  })
})
