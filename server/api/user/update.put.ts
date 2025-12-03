import { db } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'
import { getCurrentUserId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const userId = getCurrentUserId(event)

  if (!userId) {
    return error(ResponseCode.UNAUTHORIZED, '请先登录')
  }

  const body = await readBody(event)
  const { nickName, avatarUrl, gender, birthday } = body

  // 构建更新字段
  const updates: string[] = []
  const params: any[] = []

  if (nickName !== undefined) {
    if (!nickName.trim()) {
      return error(ResponseCode.PARAM_ERROR, '昵称不能为空')
    }
    if (nickName.length > 20) {
      return error(ResponseCode.PARAM_ERROR, '昵称不能超过20个字符')
    }
    updates.push('nick_name = ?')
    params.push(nickName.trim())
  }

  if (avatarUrl !== undefined) {
    updates.push('avatar_url = ?')
    params.push(avatarUrl || null)
  }

  if (gender !== undefined) {
    if (![0, 1, 2].includes(gender)) {
      return error(ResponseCode.PARAM_ERROR, '无效的性别值')
    }
    updates.push('gender = ?')
    params.push(gender)
  }

  if (birthday !== undefined) {
    updates.push('birthday = ?')
    params.push(birthday || null)
  }

  if (updates.length === 0) {
    return error(ResponseCode.PARAM_ERROR, '没有要更新的内容')
  }

  const now = formatDateTime()
  updates.push('update_time = ?')
  params.push(now)
  params.push(userId)

  await db.execute(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    params
  )

  // 获取更新后的用户信息
  const userResult = await db.execute(
    'SELECT id, phone, nick_name, avatar_url, gender, birthday, NULL as couple_id, create_time FROM users WHERE id = ? LIMIT 1',
    [userId]
  )
  const user = userResult.rows[0] as any

  if (!user) {
    console.error('User not found after update, userId:', userId)
    return error(ResponseCode.NOT_FOUND, '用户不存在')
  }

  // 计算星座
  const getConstellation = (birthday: string) => {
    if (!birthday) return ''
    const date = new Date(birthday)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const constellations = [
      { name: '摩羯座', start: [1, 1], end: [1, 19] },
      { name: '水瓶座', start: [1, 20], end: [2, 18] },
      { name: '双鱼座', start: [2, 19], end: [3, 20] },
      { name: '白羊座', start: [3, 21], end: [4, 19] },
      { name: '金牛座', start: [4, 20], end: [5, 20] },
      { name: '双子座', start: [5, 21], end: [6, 21] },
      { name: '巨蟹座', start: [6, 22], end: [7, 22] },
      { name: '狮子座', start: [7, 23], end: [8, 22] },
      { name: '处女座', start: [8, 23], end: [9, 22] },
      { name: '天秤座', start: [9, 23], end: [10, 23] },
      { name: '天蝎座', start: [10, 24], end: [11, 22] },
      { name: '射手座', start: [11, 23], end: [12, 21] },
      { name: '摩羯座', start: [12, 22], end: [12, 31] },
    ]
    for (const c of constellations) {
      if ((month === c.start[0] && day >= c.start[1]) || (month === c.end[0] && day <= c.end[1])) {
        return c.name
      }
    }
    return ''
  }

  return success({
    id: user.id,
    phone: user.phone,
    nickName: user.nick_name,
    avatarUrl: user.avatar_url,
    gender: user.gender,
    birthday: user.birthday,
    constellation: getConstellation(user.birthday),
    coupleId: user.couple_id,
  })
})
