<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import type { ApiResponse } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const scheduleId = computed(() => route.params.id as string)

const categories = [
  { value: 'date', label: '约会', icon: '💑', color: '#FF6B9D' },
  { value: 'travel', label: '旅行', icon: '✈️', color: '#4CAF50' },
  { value: 'anniversary', label: '纪念日', icon: '🎉', color: '#9C27B0' },
  { value: 'birthday', label: '生日', icon: '🎂', color: '#FFD700' },
  { value: 'other', label: '其他', icon: '📌', color: '#607D8B' },
]

const loading = ref(true)
const error = ref('')
const isSubmitting = ref(false)

const form = ref({
  title: '',
  description: '',
  category: 'date',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  isAllDay: false,
  location: '',
  color: '#FF6B9D',
})

// 获取日程详情
const fetchSchedule = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await useAuthFetch<ApiResponse<any>>(`/api/schedule/${scheduleId.value}`)
    
    if (data.value?.code === 0) {
      const schedule = data.value.data
      // 解析时间
      const startParts = schedule.startTime?.split(' ') || []
      const endParts = schedule.endTime?.split(' ') || []
      
      form.value = {
        title: schedule.title || '',
        description: schedule.description || '',
        category: schedule.category || 'other',
        startDate: startParts[0] || '',
        startTime: startParts[1]?.substring(0, 5) || '',
        endDate: endParts[0] || '',
        endTime: endParts[1]?.substring(0, 5) || '',
        isAllDay: schedule.isAllDay || false,
        location: schedule.location || '',
        color: schedule.color || '#FF6B9D',
      }
    } else {
      error.value = data.value?.message || '加载失败'
    }
  } catch (e: any) {
    error.value = e.message || '加载失败'
  } finally {
    loading.value = false
  }
}

await fetchSchedule()

const handleCategoryChange = (category: string) => {
  form.value.category = category
  const cat = categories.find(c => c.value === category)
  if (cat) {
    form.value.color = cat.color
  }
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    alert('请输入日程标题')
    return
  }
  if (!form.value.startDate) {
    alert('请选择开始日期')
    return
  }

  isSubmitting.value = true
  
  try {
    const response = await authFetch<ApiResponse<any>>(`/api/schedule/${scheduleId.value}`, {
      method: 'PUT',
      body: {
        title: form.value.title,
        description: form.value.description,
        category: form.value.category,
        startDate: form.value.startDate,
        startTime: form.value.startTime,
        endDate: form.value.endDate,
        endTime: form.value.endTime,
        isAllDay: form.value.isAllDay,
        location: form.value.location,
        color: form.value.color,
      },
    })
    
    if (response?.code === 0) {
      router.push('/schedule')
    } else {
      alert(response?.message || '保存失败，请重试')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">编辑日程</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-romantic-pink" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="lucide:alert-circle" class="w-12 h-12 text-destructive/60 mx-auto mb-4" />
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button variant="outline" @click="fetchSchedule">重试</Button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 标题 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">标题</label>
        <Input 
          v-model="form.title"
          placeholder="日程标题..."
        />
      </div>

      <!-- 分类选择 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">分类</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="cat in categories"
            :key="cat.value"
            type="button"
            class="flex items-center gap-2 px-4 py-2 rounded-full border transition-colors"
            :class="form.category === cat.value 
              ? 'text-white border-transparent' 
              : 'bg-white border-border hover:border-romantic-pink'"
            :style="form.category === cat.value ? { backgroundColor: cat.color } : {}"
            @click="handleCategoryChange(cat.value)"
          >
            <span>{{ cat.icon }}</span>
            <span class="text-sm">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- 全天开关 -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="relative w-12 h-6 rounded-full transition-colors"
          :class="form.isAllDay ? 'bg-romantic-pink' : 'bg-muted'"
          @click="form.isAllDay = !form.isAllDay"
        >
          <span 
            class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
            :class="form.isAllDay ? 'translate-x-7' : 'translate-x-1'"
          />
        </button>
        <span class="text-sm text-foreground">全天</span>
      </div>

      <!-- 开始时间 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">开始日期</label>
          <Input 
            v-model="form.startDate"
            type="date"
          />
        </div>
        <div v-if="!form.isAllDay">
          <label class="text-sm font-medium text-foreground mb-2 block">开始时间</label>
          <Input 
            v-model="form.startTime"
            type="time"
          />
        </div>
      </div>

      <!-- 结束时间 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium text-foreground mb-2 block">结束日期</label>
          <Input 
            v-model="form.endDate"
            type="date"
          />
        </div>
        <div v-if="!form.isAllDay">
          <label class="text-sm font-medium text-foreground mb-2 block">结束时间</label>
          <Input 
            v-model="form.endTime"
            type="time"
          />
        </div>
      </div>

      <!-- 地点 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">地点（可选）</label>
        <div class="relative">
          <Icon name="lucide:map-pin" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            v-model="form.location"
            placeholder="添加地点..."
            class="pl-10"
          />
        </div>
      </div>

      <!-- 描述 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">描述（可选）</label>
        <Textarea 
          v-model="form.description"
          placeholder="添加描述..."
          class="min-h-[100px]"
        />
      </div>

      <!-- 提交按钮 -->
      <div class="flex gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          class="flex-1"
          @click="router.back()"
        >
          取消
        </Button>
        <Button 
          type="submit" 
          variant="love" 
          class="flex-1"
          :disabled="isSubmitting"
        >
          <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          {{ isSubmitting ? '保存中...' : '保存修改' }}
        </Button>
      </div>
    </form>
  </div>
</template>
