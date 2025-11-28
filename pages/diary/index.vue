<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import DiaryCard from '~/components/diary/DiaryCard.vue'
import { moodOptions } from '~/lib/utils'
import type { ApiResponse, PaginatedData } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const searchQuery = ref('')
const selectedMood = ref<string | null>(null)
const page = ref(1)
const diaries = ref<any[]>([])

// 从 API 获取日记数据
const fetchDiaries = async () => {
  const { data } = await useAuthFetch<ApiResponse<PaginatedData<any>>>('/api/diary/page', {
    method: 'POST',
    body: {
      page: page.value,
      size: 20,
      mood: selectedMood.value || undefined,
      keyword: searchQuery.value || undefined,
    },
  })
  if (data.value?.code === 0 && data.value?.data?.list) {
    diaries.value = data.value.data.list
  }
}

// 初始加载
await fetchDiaries()

// 监听筛选条件变化
watch([selectedMood], () => {
  page.value = 1
  fetchDiaries()
})

// 搜索防抖
let searchTimer: any = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    fetchDiaries()
  }, 300)
})

const filteredDiaries = computed(() => diaries.value)

const toggleMoodFilter = (mood: string) => {
  selectedMood.value = selectedMood.value === mood ? null : mood
}

const handleDiaryClick = (id: number) => {
  navigateTo(`/diary/${id}`)
}

const handleLike = async (id: number) => {
  // TODO: 调用点赞 API
  const diary = diaries.value.find(d => d.id === id)
  if (diary) {
    diary.isLiked = !diary.isLiked
    diary.likeCount += diary.isLiked ? 1 : -1
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <span>📖</span>
        我们的日记
      </h1>
      <NuxtLink to="/diary/new">
        <Button variant="love">
          <Icon name="lucide:plus" class="w-4 h-4" />
          写日记
        </Button>
      </NuxtLink>
    </div>

    <!-- 搜索和筛选 -->
    <div class="space-y-3">
      <div class="relative">
        <Icon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          v-model="searchQuery"
          placeholder="搜索日记..."
          class="pl-10"
        />
      </div>
      
      <!-- 心情筛选 -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <span class="text-sm text-muted-foreground shrink-0">心情:</span>
        <Badge 
          v-for="mood in moodOptions"
          :key="mood.value"
          :variant="selectedMood === mood.value ? 'love' : 'outline'"
          class="cursor-pointer shrink-0"
          @click="toggleMoodFilter(mood.value)"
        >
          {{ mood.emoji }} {{ mood.label }}
        </Badge>
      </div>
    </div>

    <!-- 日记列表 -->
    <div v-if="filteredDiaries.length" class="space-y-4">
      <DiaryCard 
        v-for="diary in filteredDiaries" 
        :key="diary.id" 
        :diary="diary"
        @click="handleDiaryClick(diary.id)"
        @like="handleLike(diary.id)"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="text-center py-12">
      <div class="text-6xl mb-4">📝</div>
      <p class="text-muted-foreground mb-4">
        {{ searchQuery || selectedMood ? '没有找到匹配的日记' : '还没有日记，快来记录美好时光吧！' }}
      </p>
      <NuxtLink v-if="!searchQuery && !selectedMood" to="/diary/new">
        <Button variant="love">写第一篇日记</Button>
      </NuxtLink>
    </div>
  </div>
</template>
