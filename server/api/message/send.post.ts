import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)
  
  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const body = await readBody(event)
  const { type = 'text', content, mediaUrl, specialType } = body

  // 验证消息内容
  if (type === 'text' && (!content || !content.trim())) {
    return error(ResponseCode.PARAM_ERROR, '请输入消息内容')
  }

  if (type === 'special' && !specialType) {
    return error(ResponseCode.PARAM_ERROR, '请选择特殊消息类型')
  }

  // 获取用户的 coupleId 和伴侣 ID
  const coupleResult = await db.execute(
    'SELECT * FROM couples WHERE (user_id = ? OR partner_id = ?) AND status = 1 LIMIT 1',
    [userId, userId]
  )
  const couple = coupleResult.rows[0] as any

  if (!couple) {
    return error(ResponseCode.NOT_FOUND, '请先完成情侣配对')
  }

  const partnerId = couple.user_id === userId ? couple.partner_id : couple.user_id

  if (!partnerId) {
    return error(ResponseCode.NOT_FOUND, '伴侣信息不存在')
  }

  const now = formatDateTime()

  // 插入消息
  await db.execute(
    `INSERT INTO messages (couple_id, sender_id, receiver_id, type, content, media_url, special_type, is_read, create_time) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [couple.id, userId, partnerId, type, content?.trim() || null, mediaUrl || null, specialType || null, now]
  )

  // 获取新插入的消息
  const newMessageResult = await db.execute(
    'SELECT * FROM messages WHERE couple_id = ? AND sender_id = ? ORDER BY id DESC LIMIT 1',
    [couple.id, userId]
  )
  const newMessage = newMessageResult.rows[0] as any

  return success({
    id: newMessage.id,
    type: newMessage.type,
    content: newMessage.content,
    mediaUrl: newMessage.media_url,
    specialType: newMessage.special_type,
    senderId: newMessage.sender_id,
    receiverId: newMessage.receiver_id,
    isRead: false,
    createTime: newMessage.create_time,
  })
})
