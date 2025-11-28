<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import AnniversaryCard from '~/components/love/AnniversaryCard.vue'
import { anniversaryTypes, getDaysBetween } from '~/lib/utils'
import type { ApiResponse, Anniversary, PaginatedData } from '~/types'

definePageMeta({
  middleware: 'auth',
})

// 从 API 获取纪念日数据
const { data: anniversaryData, refresh } = await useAuthFetch<ApiResponse<PaginatedData<Anniversary>>>('/api/anniversary/list')
const anniversaries = computed(() => {
  if (anniversaryData.value?.code === 0 && anniversaryData.value?.data?.list) {
    return anniversaryData.value.data.list
  }
  return []
})

// 即将到来的纪念日（API 已排序）
const upcomingAnniversaries = computed(() => anniversaries.value)

// 今天的纪念日
const todayAnniversaries = computed(() => {
  return upcomingAnniversaries.value.filter(ann => ann.daysToNext === 0)
})

// 7天内的纪念日
const weekAnniversaries = computed(() => {
  return upcomingAnniversaries.value.filter(ann => ann.daysToNext > 0 && ann.daysToNext <= 7)
})

// 其他纪念日
const otherAnniversaries = computed(() => {
  return upcomingAnniversaries.value.filter(ann => ann.daysToNext > 7)
})

const handleEdit = (id: number) => {
  navigateTo(`/anniversary/${id}/edit`)
}

const handleDelete = async (id: number) => {
  if (confirm('确定要删除这个纪念日吗？')) {
    // TODO: 调用删除 API
    await refresh()
  }
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <span>🎉</span>
        纪念日
      </h1>
      <NuxtLink to="/anniversary/new">
        <Button variant="love">
          <Icon name="lucide:plus" class="w-4 h-4" />
          添加纪念日
        </Button>
      </NuxtLink>
    </div>

    <!-- 今天的纪念日 -->
    <section v-if="todayAnniversaries.length">
      <Card class="love-gradient text-white overflow-hidden">
        <CardContent class="p-6">
          <div class="flex items-center gap-4">
            <div class="text-5xl animate-heart-beat">🎊</div>
            <div>
              <h2 class="text-xl font-bold mb-1">今天是特别的日子！</h2>
              <div class="space-y-1">
                <p v-for="ann in todayAnniversaries" :key="ann.id" class="flex items-center gap-2">
                  <span>{{ ann.icon }}</span>
                  <span>{{ ann.title }}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 即将到来（7天内） -->
    <section v-if="weekAnniversaries.length">
      <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>⏰</span>
        即将到来
        <Badge variant="love">{{ weekAnniversaries.length }}</Badge>
      </h2>
      <div class="space-y-3">
        <AnniversaryCard 
          v-for="ann in weekAnniversaries" 
          :key="ann.id" 
          :anniversary="ann"
        />
      </div>
    </section>

    <!-- 所有纪念日 -->
    <section>
      <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>📅</span>
        所有纪念日
      </h2>
      <div class="space-y-3">
        <Card 
          v-for="ann in otherAnniversaries" 
          :key="ann.id"
          class="card-hover"
        >
          <CardContent class="p-4">
            <div class="flex items-center gap-4">
              <div 
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                :style="{ backgroundColor: ann.color }"
              >
                {{ ann.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-foreground">{{ ann.title }}</h3>
                <p class="text-sm text-muted-foreground">{{ ann.date }}</p>
                <p class="text-sm text-romantic-pink">还有 {{ ann.daysToNext }} 天</p>
              </div>
              <div class="flex items-center gap-1">
                <Button variant="ghost" size="icon" @click="handleEdit(ann.id)">
                  <Icon name="lucide:pencil" class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" @click="handleDelete(ann.id)">
                  <Icon name="lucide:trash-2" class="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- 纪念日类型说明 -->
    <Card class="bg-muted/50">
      <CardHeader class="pb-2">
        <CardTitle class="text-base">纪念日类型</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div 
            v-for="type in anniversaryTypes" 
            :key="type.value"
            class="flex items-center gap-2 text-sm"
          >
            <span>{{ type.icon }}</span>
            <span class="text-muted-foreground">{{ type.label }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
