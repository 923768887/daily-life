import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export function getDaysBetween(startDate: Date | string, endDate: Date | string = new Date()): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return formatDate(target)
}

export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'LOVE'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export const moodOptions = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'touched', label: '感动', emoji: '🥹' },
  { value: 'sweet', label: '甜蜜', emoji: '🥰' },
  { value: 'miss', label: '思念', emoji: '💭' },
  { value: 'sad', label: '难过', emoji: '😢' },
  { value: 'angry', label: '生气', emoji: '😤' },
]

export const weatherOptions = [
  { value: 'sunny', label: '晴天', emoji: '☀️' },
  { value: 'cloudy', label: '多云', emoji: '⛅' },
  { value: 'rainy', label: '雨天', emoji: '🌧️' },
  { value: 'snowy', label: '雪天', emoji: '❄️' },
  { value: 'windy', label: '大风', emoji: '💨' },
]

export const anniversaryTypes = [
  { value: 'love_start', label: '恋爱纪念日', icon: '❤️' },
  { value: 'wedding', label: '结婚纪念日', icon: '💒' },
  { value: 'birthday', label: '生日', icon: '🎂' },
  { value: 'first_date', label: '第一次约会', icon: '🌹' },
  { value: 'first_kiss', label: '第一次接吻', icon: '💋' },
  { value: 'proposal', label: '求婚日', icon: '💍' },
  { value: 'custom', label: '自定义', icon: '⭐' },
]
