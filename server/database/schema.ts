import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phone: text('phone').notNull().unique(),
  password: text('password'),
  nickName: text('nick_name').notNull(),
  avatarUrl: text('avatar_url'),
  gender: integer('gender').default(0), // 0-未知 1-男 2-女
  birthday: text('birthday'),
  constellation: text('constellation'),
  hobby: text('hobby'),
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
})

// 情侣关系表
export const couples = sqliteTable('couples', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  partnerId: integer('partner_id').references(() => users.id),
  status: integer('status').default(0), // 0-待配对 1-已配对 2-已解除
  loveStartDate: text('love_start_date'),
  relationshipType: integer('relationship_type').default(0), // 0-恋爱中 1-已订婚 2-已结婚
  coupleNickname1: text('couple_nickname_1'),
  coupleNickname2: text('couple_nickname_2'),
  coupleAvatar: text('couple_avatar'),
  signature: text('signature'),
  theme: text('theme').default('romantic-pink'),
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
})

// 邀请码表
export const invites = sqliteTable('invites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  code: text('code').notNull().unique(),
  status: integer('status').default(0), // 0-有效 1-已使用 2-已过期
  expireTime: text('expire_time').notNull(),
  createTime: text('create_time').notNull(),
})

// 日记表
export const diaries = sqliteTable('diaries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title'),
  content: text('content').notNull(),
  mood: text('mood'),
  weather: text('weather'),
  location: text('location'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  images: text('images'), // JSON array
  videos: text('videos'), // JSON array
  isPrivate: integer('is_private').default(0),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  diaryDate: text('diary_date').notNull(),
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
})

// 相册表
export const albums = sqliteTable('albums', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  coverUrl: text('cover_url'),
  photoCount: integer('photo_count').default(0),
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
})

// 照片表
export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  albumId: integer('album_id').notNull().references(() => albums.id),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  width: integer('width'),
  height: integer('height'),
  description: text('description'),
  location: text('location'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  takenAt: text('taken_at'),
  likeCount: integer('like_count').default(0),
  createTime: text('create_time').notNull(),
})

// 纪念日表
export const anniversaries = sqliteTable('anniversaries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  type: text('type').default('custom'),
  icon: text('icon').default('❤️'),
  color: text('color').default('#FFE4E9'),
  images: text('images'), // JSON array
  isRepeat: integer('is_repeat').default(1),
  remindDays: text('remind_days').default('[1,7]'), // JSON array
  isActive: integer('is_active').default(1),
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
})

// 日程表
export const schedules = sqliteTable('schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').default('other'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  isAllDay: integer('is_all_day').default(0),
  location: text('location'),
  latitude: real('latitude'),
  longitude: real('longitude'),
  repeatType: text('repeat_type').default('none'),
  color: text('color').default('#FF6B9D'),
  status: integer('status').default(0), // 0-待确认 1-已确认 2-已完成 3-已取消
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
})

// 每日任务表
export const dailyTasks = sqliteTable('daily_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  taskDate: text('task_date').notNull(),
  checkIn: integer('check_in').default(0),
  checkInTime: text('check_in_time'),
  goodMorning: integer('good_morning').default(0),
  goodMorningTime: text('good_morning_time'),
  goodNight: integer('good_night').default(0),
  goodNightTime: text('good_night_time'),
  mood: text('mood'),
  points: integer('points').default(0),
  createTime: text('create_time').notNull(),
  updateTime: text('update_time').notNull(),
})

// 消息表
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  senderId: integer('sender_id').notNull().references(() => users.id),
  receiverId: integer('receiver_id').notNull().references(() => users.id),
  type: text('type').default('text'), // text/image/audio/video/special
  content: text('content'),
  mediaUrl: text('media_url'),
  specialType: text('special_type'), // poke/missyou/hug/kiss
  isRead: integer('is_read').default(0),
  readTime: text('read_time'),
  createTime: text('create_time').notNull(),
})

// 点赞表
export const likes = sqliteTable('likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  targetType: text('target_type').notNull(), // diary/photo
  targetId: integer('target_id').notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
  createTime: text('create_time').notNull(),
})

// 评论表
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  targetType: text('target_type').notNull(), // diary/photo
  targetId: integer('target_id').notNull(),
  coupleId: integer('couple_id').notNull().references(() => couples.id),
  userId: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  parentId: integer('parent_id'),
  createTime: text('create_time').notNull(),
})

// 情话表
export const loveQuotes = sqliteTable('love_quotes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  author: text('author'),
  source: text('source'),
  category: text('category'),
  isSystem: integer('is_system').default(1),
  createTime: text('create_time').notNull(),
})
