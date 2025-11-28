import { eq } from 'drizzle-orm'
import { db, users } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phone, code, nickName, password } = body

  if (!phone || phone.length !== 11) {
    return error(ResponseCode.PARAM_ERROR, '请输入正确的手机号')
  }

  if (!code) {
    return error(ResponseCode.PARAM_ERROR, '请输入验证码')
  }

  // TODO: 验证短信验证码
  if (code !== '123456') {
    return error(ResponseCode.PARAM_ERROR, '验证码错误')
  }

  if (!nickName || !nickName.trim()) {
    return error(ResponseCode.PARAM_ERROR, '请输入昵称')
  }

  // 检查手机号是否已注册
  const existingUser = await db.query.users.findFirst({
    where: eq(users.phone, phone),
  })

  if (existingUser) {
    return error(ResponseCode.PARAM_ERROR, '该手机号已注册，请直接登录')
  }

  // 创建用户
  const now = formatDateTime()
  const result = await db.insert(users).values({
    phone,
    nickName: nickName.trim(),
    password: password || null,
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
    createTime: now,
    updateTime: now,
  } as any).returning()

  const user = result[0]

  // 生成 token
  const token = `token_${user.id}_${Date.now()}`

  return success({
    token,
    expire: 604800,
    userInfo: {
      id: user.id,
      phone: user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      gender: user.gender,
      isPaired: false,
    },
  })
})
