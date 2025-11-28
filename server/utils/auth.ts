import type { H3Event } from 'h3'

/**
 * 从请求中获取当前用户 ID
 * 通过 Authorization header 中的 token 或 cookie 获取
 */
export function getCurrentUserId(event: H3Event): number | null {
  // 从 header 获取 token
  const authHeader = getHeader(event, 'authorization')
  let token = authHeader?.replace('Bearer ', '')
  
  // 如果 header 没有，从 cookie 获取
  if (!token) {
    token = getCookie(event, 'loveday_token')
  }
  
  // 如果还没有，从查询参数获取（用于调试）
  if (!token) {
    const query = getQuery(event)
    token = query.token as string
  }
  
  if (!token) {
    return null
  }
  
  // 解析 token: token_userId_timestamp
  const match = token.match(/^token_(\d+)_\d+$/)
  if (match) {
    return parseInt(match[1], 10)
  }
  
  return null
}

/**
 * 要求用户登录，如果未登录则抛出错误
 */
export function requireAuth(event: H3Event): number {
  const userId = getCurrentUserId(event)
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: '请先登录',
    })
  }
  return userId
}
