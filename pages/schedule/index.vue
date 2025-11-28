<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'

// 模拟日程数据
const schedules = ref([
  {
    id: 1,
    title: '情人节约会',
    description: '去看电影，然后吃晚餐',
    category: 'date',
    startTime: '2024-02-14 18:00:00',
    endTime: '2024-02-14 22:00:00',
    location: '万达影城',
    color: '#FF6B9D',
    status: 1,
  },
  {
    id: 2,
    title: '小宝贝生日',
    description: '准备惊喜派对',
    category: 'birthday',
    startTime: '2024-06-15 00:00:00',
    endTime: '2024-06-15 23:59:59',
    location: '',
    color: '#FFD700',
    status: 0,
  },
  {
    id: 3,
    title: '周末旅行',
    description: '去杭州西湖',
    category: 'travel',
    startTime: '2024-03-01 08:00:00',
    endTime: '2024-03-03 20:00:00',
    location: '杭州',
    color: '#4CAF50',
    status: 0,
  },
])

const viewMode = ref<'list' | 'calendar'>('list')
const currentMonth = ref(new Date())

const categoryLabels: Record<string, string> = {
  date: '约会',
  travel: '旅行',
  anniversary: '纪念日',
  birthday: '生日',
  other: '其他',
}

const statusLabels: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  0: { label: '待确认', variant: 'outline' },
  1: { label: '已确认', variant: 'default' },
  2: { label: '已完成', variant: 'secondary' },
  3: { label: '已取消', variant: 'outline' },
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 生成日历数据
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  
  const days = []
  
  // 上月填充
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({ date, isCurrentMonth: false, events: [] })
  }
  
  // 当月
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    const dateStr = date.toISOString().split('T')[0]
    const events = schedules.value.filter(s => s.startTime.startsWith(dateStr))
    days.push({ date, isCurrentMonth: true, events })
  }
  
  // 下月填充
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ date, isCurrentMonth: false, events: [] })
  }
  
  return days
})

const prevMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
}

const nextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-foreground flex items-center gap-2">
        <span>📅</span>
        日程安排
      </h1>
      <NuxtLink to="/schedule/new">
        <Button variant="love">
          <Icon name="lucide:plus" class="w-4 h-4" />
          添加日程
        </Button>
      </NuxtLink>
    </div>

    <!-- 视图切换 -->
    <div class="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
      <button
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="viewMode === 'list' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
        @click="viewMode = 'list'"
      >
        <Icon name="lucide:list" class="w-4 h-4 inline mr-1" />
        列表
      </button>
      <button
        class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
        :class="viewMode === 'calendar' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
        @click="viewMode = 'calendar'"
      >
        <Icon name="lucide:calendar" class="w-4 h-4 inline mr-1" />
        日历
      </button>
    </div>

    <!-- 列表视图 -->
    <div v-if="viewMode === 'list'" class="space-y-3">
      <Card 
        v-for="schedule in schedules" 
        :key="schedule.id"
        class="card-hover"
      >
        <CardContent class="p-4">
          <div class="flex items-start gap-4">
            <div 
              class="w-1 h-full min-h-16 rounded-full"
              :style="{ backgroundColor: schedule.color }"
            />
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-foreground">{{ schedule.title }}</h3>
                <Badge :variant="statusLabels[schedule.status].variant">
                  {{ statusLabels[schedule.status].label }}
                </Badge>
              </div>
              <p v-if="schedule.description" class="text-sm text-muted-foreground mb-2">
                {{ schedule.description }}
              </p>
              <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span class="flex items-center gap-1">
                  <Icon name="lucide:clock" class="w-4 h-4" />
                  {{ formatTime(schedule.startTime) }}
                </span>
                <span v-if="schedule.location" class="flex items-center gap-1">
                  <Icon name="lucide:map-pin" class="w-4 h-4" />
                  {{ schedule.location }}
                </span>
                <Badge variant="outline">{{ categoryLabels[schedule.category] }}</Badge>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <Icon name="lucide:check" class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Icon name="lucide:pencil" class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div v-if="!schedules.length" class="text-center py-12">
        <div class="text-6xl mb-4">📅</div>
        <p class="text-muted-foreground mb-4">还没有日程安排</p>
        <NuxtLink to="/schedule/new">
          <Button variant="love">添加第一个日程</Button>
        </NuxtLink>
      </div>
    </div>

    <!-- 日历视图 -->
    <Card v-else>
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <Button variant="ghost" size="icon" @click="prevMonth">
            <Icon name="lucide:chevron-left" class="w-5 h-5" />
          </Button>
          <CardTitle class="text-lg">
            {{ currentMonth.getFullYear() }}年{{ currentMonth.getMonth() + 1 }}月
          </CardTitle>
          <Button variant="ghost" size="icon" @click="nextMonth">
            <Icon name="lucide:chevron-right" class="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <!-- 星期标题 -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div 
            v-for="day in ['日', '一', '二', '三', '四', '五', '六']" 
            :key="day"
            class="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {{ day }}
          </div>
        </div>
        
        <!-- 日期格子 -->
        <div class="grid grid-cols-7 gap-1">
          <div 
            v-for="(day, idx) in calendarDays" 
            :key="idx"
            class="aspect-square p-1 rounded-lg text-sm"
            :class="{
              'bg-muted/50': !day.isCurrentMonth,
              'bg-romantic-pink text-white': isToday(day.date),
              'hover:bg-muted cursor-pointer': day.isCurrentMonth,
            }"
          >
            <div class="font-medium">{{ day.date.getDate() }}</div>
            <div v-if="day.events.length" class="mt-1">
              <div 
                v-for="event in day.events.slice(0, 2)" 
                :key="event.id"
                class="w-full h-1 rounded-full mb-0.5"
                :style="{ backgroundColor: event.color }"
              />
              <div v-if="day.events.length > 2" class="text-xs text-muted-foreground">
                +{{ day.events.length - 2 }}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
