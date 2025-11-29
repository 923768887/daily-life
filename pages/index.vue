<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import LoveCounter from '~/components/love/LoveCounter.vue'
import CoupleHeader from '~/components/love/CoupleHeader.vue'
import AnniversaryCard from '~/components/love/AnniversaryCard.vue'
import DiaryCard from '~/components/diary/DiaryCard.vue'
import { useUserStore } from '~/stores/user'
import type { ApiResponse, PaginatedData } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const userStore = useUserStore()
const isLoading = ref(true)

// 从 API 获取情侣信息
const { data: coupleData, pending: couplePending } = await useAuthFetch<ApiResponse<PaginatedData<any>>>('/api/couple/info', { lazy: true })
const coupleInfo = computed(() => {
  if (coupleData.value?.code === 0 && coupleData.value?.data) {
    return coupleData.value.data
  }
  return {
    loveStartDate: '2023-01-01',
    myInfo: { id: 1, nickName: '我', avatarUrl: '', coupleNickname: '' },
    partnerInfo: { id: 2, nickName: 'TA', avatarUrl: '', coupleNickname: '' },
  }
})

// 从 API 获取纪念日
const { data: anniversaryData, pending: anniversaryPending } = await useAuthFetch<ApiResponse<PaginatedData<any>>>('/api/anniversary/list', { lazy: true })
const upcomingAnniversaries = computed(() => {
  if (anniversaryData.value?.code === 0 && anniversaryData.value?.data?.list) {
    return anniversaryData.value.data.list.slice(0, 3)
  }
  return []
})

// 从 API 获取日记
const { data: diaryData, pending: diaryPending } = await useAuthFetch<ApiResponse<PaginatedData<any>>>('/api/diary/page', {
  method: 'POST',
  body: { page: 1, size: 3 },
  lazy: true,
})
const recentDiaries = computed(() => {
  if (diaryData.value?.code === 0 && diaryData.value?.data?.list) {
    return diaryData.value.data.list
  }
  return []
})

// 从 API 获取每日情话
const { data: quoteData, pending: quotePending } = await useFetch('/api/lovequote/daily', { lazy: true })
const dailyQuote = computed(() => {
  if (quoteData.value?.code === 0 && quoteData.value?.data) {
    return quoteData.value.data
  }
  return { content: '爱你每一天', author: '情话集' }
})

// 整体加载状态
const pageLoading = computed(() => couplePending.value)

// 模拟初始加载完成
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 100)
})

const handleDiaryClick = (id: number) => {
  navigateTo(`/diary/${id}`)
}
</script>

<template>
  <div class="space-y-6">
    <!-- 页面加载骨架屏 -->
    <template v-if="pageLoading">
      <!-- 情侣头像骨架 -->
      <div class="flex items-center justify-center gap-6 py-4">
        <div class="skeleton w-20 h-20 rounded-full" />
        <div class="skeleton w-8 h-8 rounded-full" />
        <div class="skeleton w-20 h-20 rounded-full" />
      </div>
      <!-- 恋爱天数骨架 -->
      <div class="skeleton h-24 rounded-xl" />
      <!-- 情话骨架 -->
      <div class="skeleton h-20 rounded-xl" />
      <!-- 快捷操作骨架 -->
      <div class="grid grid-cols-4 gap-3">
        <div v-for="i in 4" :key="i" class="skeleton h-20 rounded-xl" />
      </div>
    </template>

    <!-- 实际内容 -->
    <Transition name="fade" mode="out-in">
      <div v-if="!pageLoading" class="space-y-6">
        <!-- 未配对提示 -->
        <Card v-if="!coupleInfo.loveDays" class="bg-gradient-to-br from-romantic-pink/10 to-romantic-rose/10 border-romantic-pink/30">
          <CardContent class="p-6 text-center">
            <div class="text-4xl mb-3">💕</div>
            <h3 class="text-lg font-semibold text-foreground mb-2">还没有配对另一半</h3>
            <p class="text-sm text-muted-foreground mb-4">配对后可以一起记录美好时光</p>
            <NuxtLink to="/couple/pair">
              <Button variant="love" class="gap-2">
                <Icon name="lucide:heart-handshake" class="w-4 h-4" />
                立即配对
              </Button>
            </NuxtLink>
          </CardContent>
        </Card>

        <!-- 已配对内容 -->
        <template v-else>
          <!-- 情侣头像 -->
          <CoupleHeader 
            :my-info="coupleInfo.myInfo" 
            :partner-info="coupleInfo.partnerInfo" 
          />

          <!-- 恋爱天数 -->
          <LoveCounter :start-date="coupleInfo.loveStartDate" />
        </template>

        <!-- 每日情话 -->
        <Transition name="slide-up" appear>
          <Card class="bg-gradient-to-br from-white to-romantic-blush border-romantic-rose/20">
            <CardContent class="p-4">
              <div class="flex items-start gap-3">
                <span class="text-2xl">💌</span>
                <div>
                  <p v-if="quotePending" class="skeleton h-4 w-48 rounded" />
                  <template v-else>
                    <p class="text-foreground italic">"{{ dailyQuote.content }}"</p>
                    <p class="text-sm text-muted-foreground mt-2">—— {{ dailyQuote.author }}</p>
                  </template>
                </div>
              </div>
            </CardContent>
          </Card>
        </Transition>

        <!-- 快捷操作 -->
        <div class="grid grid-cols-4 gap-3">
          <NuxtLink 
            v-for="(action, index) in [
              { icon: '📝', label: '写日记', path: '/diary/new' },
              { icon: '📸', label: '传照片', path: '/album/upload' },
              { icon: '📅', label: '加日程', path: '/schedule/new' },
              { icon: '💕', label: '想你了', path: '/message' },
            ]"
            :key="action.path"
            :to="action.path"
            class="flex flex-col items-center gap-2 p-4 rounded-xl bg-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <span class="text-2xl">{{ action.icon }}</span>
            <span class="text-xs text-muted-foreground">{{ action.label }}</span>
          </NuxtLink>
        </div>

        <!-- 即将到来的纪念日 -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>🎉</span>
              即将到来
            </h2>
            <NuxtLink to="/anniversary" class="text-sm text-romantic-pink hover:underline">
              查看全部
            </NuxtLink>
          </div>
          <div v-if="anniversaryPending" class="space-y-3">
            <div v-for="i in 2" :key="i" class="skeleton h-16 rounded-xl" />
          </div>
          <TransitionGroup v-else name="slide-up" tag="div" class="space-y-3">
            <AnniversaryCard 
              v-for="ann in upcomingAnniversaries" 
              :key="ann.id" 
              :anniversary="ann" 
            />
          </TransitionGroup>
          <p v-if="!anniversaryPending && upcomingAnniversaries.length === 0" class="text-center text-muted-foreground py-4 text-sm">
            暂无即将到来的纪念日
          </p>
        </section>

        <!-- 最近日记 -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
              <span>📖</span>
              最近日记
            </h2>
            <NuxtLink to="/diary" class="text-sm text-romantic-pink hover:underline">
              查看全部
            </NuxtLink>
          </div>
          <div v-if="diaryPending" class="space-y-3">
            <CardSkeleton v-for="i in 2" :key="i" />
          </div>
          <TransitionGroup v-else name="slide-up" tag="div" class="space-y-3">
            <DiaryCard 
              v-for="diary in recentDiaries" 
              :key="diary.id" 
              :diary="diary"
              @click="handleDiaryClick(diary.id)"
            />
          </TransitionGroup>
          <p v-if="!diaryPending && recentDiaries.length === 0" class="text-center text-muted-foreground py-4 text-sm">
            还没有日记，快来记录美好时光吧
          </p>
        </section>

        <!-- 今日任务 -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-center gap-2">
              <span>✨</span>
              今日任务
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div 
              v-for="task in [
                { icon: '☀️', label: '发送早安', done: true },
                { icon: '💭', label: '记录心情', done: false },
                { icon: '🌙', label: '发送晚安', done: false },
              ]"
              :key="task.label"
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform"
              :class="task.done ? 'bg-green-50' : 'bg-muted'"
            >
              <span class="text-xl">{{ task.icon }}</span>
              <span class="flex-1" :class="task.done ? 'text-muted-foreground line-through' : 'text-foreground'">
                {{ task.label }}
              </span>
              <Icon 
                :name="task.done ? 'lucide:check-circle-2' : 'lucide:circle'" 
                class="w-5 h-5"
                :class="task.done ? 'text-green-500' : 'text-muted-foreground'"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </Transition>
  </div>
</template>
