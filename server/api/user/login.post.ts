import { eq } from 'drizzle-orm'
import { db, users } from '~/server/database'
import { success, error, ResponseCode, formatDateTime } from '~/server/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { phone, code, password, loginType = 0 } = body

    if (!phone) {
      return error(ResponseCode.PARAM_ERROR, '请输入手机号')
    }

    // 查找用户
    let user = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    })

  // 验证码登录 - 自动注册
  if (loginType === 0) {
    // TODO: 验证短信验证码
    if (code !== '123456') {
      return error(ResponseCode.PARAM_ERROR, '验证码错误')
    }

    if (!user) {
      // 自动注册
      const now = formatDateTime()
      const result = await db.insert(users).values({
        phone,
        nickName: `用户${phone.slice(-4)}`,
        createTime: now,
        updateTime: now,
      }).returning()
      user = result[0]
    }
  } else {
    // 密码登录
    if (!user) {
      return error(ResponseCode.NOT_FOUND, '用户不存在')
    }
    // TODO: 验证密码
    if (user.password !== password) {
      return error(ResponseCode.PARAM_ERROR, '密码错误')
    }
  }

  // 生成 token
  const token = `token_${user!.id}_${Date.now()}`

  return success({
    token,
    expire: 604800,
    userInfo: {
      id: user!.id,
      phone: user!.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      nickName: user!.nickName,
      avatarUrl: user!.avatarUrl,
      gender: user!.gender,
      isPaired: false, // TODO: 查询配对状态
    },
  })
  } catch (err: any) {
    console.error('登录错误:', err)
    return error(ResponseCode.SERVER_ERROR, `服务器错误: ${err.message}`)
  }
})
