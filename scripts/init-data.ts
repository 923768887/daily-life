import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../server/database/schema'

const sqlite = new Database('loveday.db')
const db = drizzle(sqlite, { schema })

const now = new Date().toISOString().replace('T', ' ').substring(0, 19)

async function initData() {
  console.log('开始初始化数据...')

  // 检查是否已有用户
  const existingUsers = await db.query.users.findMany()
  if (existingUsers.length > 0) {
    console.log('数据库已有数据，跳过初始化')
    sqlite.close()
    return
  }

  // 创建测试用户1
  const user1 = await db.insert(schema.users).values({
    phone: '13800138001',
    nickName: '小甜心',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    gender: 2,
    birthday: '1995-06-15',
    createTime: now,
    updateTime: now,
  }).returning()
  console.log('创建用户1:', user1[0].nickName)

  // 创建测试用户2
  const user2 = await db.insert(schema.users).values({
    phone: '13800138002',
    nickName: '小宝贝',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    gender: 1,
    birthday: '1994-09-20',
    createTime: now,
    updateTime: now,
  }).returning()
  console.log('创建用户2:', user2[0].nickName)

  // 创建情侣关系
  const couple = await db.insert(schema.couples).values({
    userId: user1[0].id,
    partnerId: user2[0].id,
    status: 1, // 已配对
    loveStartDate: '2023-01-01',
    coupleNickname1: '老公',
    coupleNickname2: '老婆',
    signature: '执子之手，与子偕老',
    createTime: now,
    updateTime: now,
  }).returning()
  console.log('创建情侣关系:', couple[0].id)

  // 创建纪念日
  await db.insert(schema.anniversaries).values([
    {
      coupleId: couple[0].id,
      userId: user1[0].id,
      title: '恋爱纪念日',
      date: '2023-01-01',
      type: 'love_start',
      icon: '❤️',
      color: '#FFE4E9',
      createTime: now,
      updateTime: now,
    },
    {
      coupleId: couple[0].id,
      userId: user1[0].id,
      title: '小宝贝生日',
      date: '1994-09-20',
      type: 'birthday',
      icon: '🎂',
      color: '#E8F5E9',
      createTime: now,
      updateTime: now,
    },
    {
      coupleId: couple[0].id,
      userId: user2[0].id,
      title: '小甜心生日',
      date: '1995-06-15',
      type: 'birthday',
      icon: '🎂',
      color: '#E3F2FD',
      createTime: now,
      updateTime: now,
    },
  ])
  console.log('创建纪念日: 3条')

  // 创建日记
  await db.insert(schema.diaries).values({
    coupleId: couple[0].id,
    userId: user1[0].id,
    title: '今天的约会超开心',
    content: '今天我们一起去了外滩，看了夜景，吃了好吃的晚餐。希望以后每一天都能这么幸福...',
    mood: 'happy',
    weather: 'sunny',
    location: '上海外滩',
    images: JSON.stringify(['https://picsum.photos/400/300?random=1']),
    diaryDate: '2024-01-15',
    createTime: now,
    updateTime: now,
  })
  console.log('创建日记: 1条')

  // 创建情话
  await db.insert(schema.loveQuotes).values([
    { content: '世界上最美好的事情，就是每天醒来都能看到你的笑容。', author: '情话集', category: 'sweet', createTime: now },
    { content: '我想把世界上最好的都给你，却发现世界上最好的就是你。', author: '情话集', category: 'sweet', createTime: now },
    { content: '遇见你之前，我没想过结婚；遇见你之后，我没想过别人。', author: '情话集', category: 'romantic', createTime: now },
    { content: '你是我的今天，也是我所有的明天。', author: '情话集', category: 'sweet', createTime: now },
    { content: '我喜欢你，像风走了八千里，不问归期。', author: '情话集', category: 'romantic', createTime: now },
  ])
  console.log('创建情话: 5条')

  console.log('\n✅ 数据初始化完成!')
  console.log('测试账号: 13800138001 / 13800138002')
  console.log('验证码: 123456')

  sqlite.close()
}

initData().catch(console.error)
