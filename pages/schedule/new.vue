<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { authFetch } from '~/composables/useAuthFetch'
import type { ApiResponse } from '~/server/utils/response'

const router = useRouter()

const categories = [
  { value: 'date', label: '约会', icon: '💑', color: '#FF6B9D' },
  { value: 'travel', label: '旅行', icon: '✈️', color: '#4CAF50' },
  { value: 'anniversary', label: '纪念日', icon: '🎉', color: '#9C27B0' },
  { value: 'birthday', label: '生日', icon: '🎂', color: '#FFD700' },
  { value: 'other', label: '其他', icon: '📌', color: '#607D8B' },
]

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
  reminders: [{ time: 30, unit: 'minutes' }],
})

const isSubmitting = ref(false)

const handleCategoryChange = (category: string) => {
  form.value.category = category
  const cat = categories.find(c => c.value === category)
  if (cat) {
    form.value.color = cat.color
  }
}

const addReminder = () => {
  form.value.reminders.push({ time: 1, unit: 'hours' })
}

const removeReminder = (index: number) => {
  form.value.reminders.splice(index, 1)
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
  
  const payload = {
    title: form.value.title.trim(),
    description: form.value.description?.trim() || '',
    category: form.value.category,
    startDate: form.value.startDate,
    startTime: form.value.startTime,
    endDate: form.value.endDate,
    endTime: form.value.endTime,
    isAllDay: form.value.isAllDay,
    location: form.value.location?.trim() || '',
    color: form.value.color,
  }

  try {
    const response = await authFetch<ApiResponse<any>>('/api/schedule/add', {
      method: 'POST',
      body: payload,
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
      <h1 class="text-xl font-bold text-foreground">添加日程</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
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

      <!-- 提醒 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">提醒</label>
        <div class="space-y-2">
          <div 
            v-for="(reminder, idx) in form.reminders" 
            :key="idx"
            class="flex items-center gap-2"
          >
            <Icon name="lucide:bell" class="w-4 h-4 text-muted-foreground" />
            <select 
              v-model="reminder.time" 
              class="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="30">30</option>
              <option :value="60">60</option>
            </select>
            <select 
              v-model="reminder.unit" 
              class="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="minutes">分钟前</option>
              <option value="hours">小时前</option>
              <option value="days">天前</option>
            </select>
            <Button 
              v-if="form.reminders.length > 1"
              type="button" 
              variant="ghost" 
              size="icon"
              @click="removeReminder(idx)"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </Button>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            @click="addReminder"
          >
            <Icon name="lucide:plus" class="w-4 h-4" />
            添加提醒
          </Button>
        </div>
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
          {{ isSubmitting ? '保存中...' : '创建日程' }}
        </Button>
      </div>
    </form>
  </div>
</template>
