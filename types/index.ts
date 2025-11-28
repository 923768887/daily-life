// 用户相关类型
export interface User {
  id: number
  phone: string
  nickName: string
  avatarUrl?: string
  gender?: number
  birthday?: string
  constellation?: string
  hobby?: string
}

// 情侣相关类型
export interface Couple {
  id: number
  userId: number
  partnerId?: number
  status: number
  loveStartDate?: string
  relationshipType: number
  coupleNickname1?: string
  coupleNickname2?: string
  coupleAvatar?: string
  signature?: string
  theme: string
}

export interface CoupleInfo {
  coupleId: number
  loveStartDate: string
  loveDays: number
  relationshipType: number
  coupleAvatar?: string
  signature?: string
  theme: string
  myInfo: PartnerInfo
  partnerInfo: PartnerInfo
}

export interface PartnerInfo {
  id: number
  nickName: string
  coupleNickname?: string
  avatarUrl?: string
}

// 日记相关类型
export interface Diary {
  id: number
  coupleId: number
  userId: number
  title?: string
  content: string
  mood?: string
  weather?: string
  location?: string
  latitude?: number
  longitude?: number
  images?: string[]
  videos?: string[]
  isPrivate: boolean
  likeCount: number
  commentCount: number
  diaryDate: string
  createTime: string
  author?: User
  isLiked?: boolean
}

export interface DiaryQuery {
  page?: number
  size?: number
  mood?: string
  startDate?: string
  endDate?: string
  keyword?: string
}

// 相册相关类型
export interface Album {
  id: number
  coupleId: number
  userId: number
  name: string
  description?: string
  coverUrl?: string
  photoCount: number
  createTime: string
}

export interface Photo {
  id: number
  albumId: number
  coupleId: number
  userId: number
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  description?: string
  location?: string
  latitude?: number
  longitude?: number
  takenAt?: string
  likeCount: number
  isLiked?: boolean
}

// 纪念日相关类型
export interface Anniversary {
  id: number
  coupleId: number
  userId: number
  title: string
  description?: string
  date: string
  type: string
  icon: string
  color: string
  images?: string[]
  isRepeat: boolean
  remindDays: number[]
  isActive: boolean
  daysCount?: number
  nextDate?: string
  daysToNext?: number
}

// 日程相关类型
export interface Schedule {
  id: number
  coupleId: number
  userId: number
  title: string
  description?: string
  category: string
  startTime: string
  endTime?: string
  isAllDay: boolean
  location?: string
  latitude?: number
  longitude?: number
  repeatType: string
  color: string
  status: number
}

// 消息相关类型
export interface Message {
  id: number
  coupleId: number
  senderId: number
  receiverId: number
  type: 'text' | 'image' | 'audio' | 'video' | 'special'
  content?: string
  mediaUrl?: string
  specialType?: 'poke' | 'missyou' | 'hug' | 'kiss'
  isRead: boolean
  readTime?: string
  createTime: string
}

// 任务相关类型
export interface DailyTask {
  id: number
  coupleId: number
  userId: number
  taskDate: string
  checkIn: boolean
  checkInTime?: string
  goodMorning: boolean
  goodMorningTime?: string
  goodNight: boolean
  goodNightTime?: string
  mood?: string
  points: number
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T | null
}

export interface PaginatedData<T> {
  list: T[]
  pagination: {
    page: number
    size: number
    total: number
  }
}
