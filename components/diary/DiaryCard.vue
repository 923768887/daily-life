<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { getRelativeTime, moodOptions, weatherOptions } from '~/lib/utils'

interface Author {
  id: number
  nickName: string
  avatarUrl?: string
}

interface Diary {
  id: number
  title?: string
  content: string
  mood?: string
  weather?: string
  location?: string
  images?: string[]
  likeCount: number
  commentCount: number
  diaryDate: string
  createTime: string
  author: Author
  isLiked?: boolean
}

const props = defineProps<{
  diary: Diary
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'like'): void
}>()

const getMoodEmoji = (mood?: string) => {
  return moodOptions.find(m => m.value === mood)?.emoji || ''
}

const getWeatherEmoji = (weather?: string) => {
  return weatherOptions.find(w => w.value === weather)?.emoji || ''
}
</script>

<template>
  <Card class="card-hover cursor-pointer" @click="emit('click')">
    <CardContent class="p-4">
      <!-- 作者信息 -->
      <div class="flex items-center gap-3 mb-3">
        <Avatar class="w-10 h-10">
          <AvatarImage :src="diary.author.avatarUrl" :alt="diary.author.nickName" />
          <AvatarFallback class="bg-romantic-pink text-white">
            {{ diary.author.nickName?.charAt(0) }}
          </AvatarFallback>
        </Avatar>
        <div class="flex-1">
          <p class="font-medium text-foreground">{{ diary.author.nickName }}</p>
          <p class="text-xs text-muted-foreground">{{ getRelativeTime(diary.createTime) }}</p>
        </div>
        <div class="flex items-center gap-1 text-lg">
          <span v-if="diary.mood">{{ getMoodEmoji(diary.mood) }}</span>
          <span v-if="diary.weather">{{ getWeatherEmoji(diary.weather) }}</span>
        </div>
      </div>

      <!-- 标题 -->
      <h3 v-if="diary.title" class="font-semibold text-foreground mb-2">{{ diary.title }}</h3>

      <!-- 内容 -->
      <p class="text-muted-foreground text-sm line-clamp-3 mb-3">{{ diary.content }}</p>

      <!-- 图片预览 -->
      <div v-if="diary.images?.length" class="grid gap-2 mb-3" :class="diary.images.length === 1 ? 'grid-cols-1' : 'grid-cols-3'">
        <div 
          v-for="(img, idx) in diary.images.slice(0, 3)" 
          :key="idx"
          class="relative aspect-square rounded-lg overflow-hidden bg-muted"
        >
          <img :src="img" :alt="`图片${idx + 1}`" class="w-full h-full object-cover" />
          <div 
            v-if="idx === 2 && diary.images.length > 3" 
            class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold"
          >
            +{{ diary.images.length - 3 }}
          </div>
        </div>
      </div>

      <!-- 位置和互动 -->
      <div class="flex items-center justify-between text-sm">
        <div v-if="diary.location" class="flex items-center gap-1 text-muted-foreground">
          <Icon name="lucide:map-pin" class="w-4 h-4" />
          <span class="truncate max-w-32">{{ diary.location }}</span>
        </div>
        <div class="flex items-center gap-4 text-muted-foreground ml-auto">
          <button 
            class="flex items-center gap-1 hover:text-romantic-pink transition-colors"
            :class="{ 'text-romantic-pink': diary.isLiked }"
            @click.stop="emit('like')"
          >
            <Icon :name="diary.isLiked ? 'lucide:heart' : 'lucide:heart'" :class="{ 'fill-current': diary.isLiked }" class="w-4 h-4" />
            <span>{{ diary.likeCount }}</span>
          </button>
          <div class="flex items-center gap-1">
            <Icon name="lucide:message-circle" class="w-4 h-4" />
            <span>{{ diary.commentCount }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
