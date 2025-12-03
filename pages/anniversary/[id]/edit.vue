<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { anniversaryTypes } from '~/lib/utils'
import type { ApiResponse } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const anniversaryId = computed(() => Number(route.params.id))

const form = ref({
  title: '',
  description: '',
  date: '',
  type: 'custom',
  icon: '❤️',
  color: '#FFE4E9',
  isRepeat: true,
  remindDays: [1, 7] as number[],
})

const colors = [
  '#FFE4E9', '#E8F5E9', '#E3F2FD', '#FFF3E0',
  '#F3E5F5', '#FCE4EC', '#E0F7FA', '#FFF8E1',
]

const icons = ['❤️', '💕', '🎂', '🌹', '💋', '💍', '🎉', '⭐', '🌙', '🎁']

const loading = ref(true)
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleTypeChange = (type: string) => {
  form.value.type = type
  const typeInfo = anniversaryTypes.find(t => t.value === type)
  if (typeInfo) {
    form.value.icon = typeInfo.icon
  }
}

const toggleRemindDay = (day: number) => {
  const idx = form.value.remindDays.indexOf(day)
  if (idx > -1) {
    form.value.remindDays.splice(idx, 1)
  } else {
    form.value.remindDays.push(day)
    form.value.remindDays.sort((a, b) => a - b)
  }
}

const loadDetail = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await authFetch<ApiResponse<any>>(`/api/anniversary/${anniversaryId.value}`)
    if (response?.code === 0 && response.data) {
      const data = response.data
      form.value = {
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        type: data.type || 'custom',
        icon: data.icon || '❤️',
        color: data.color || '#FFE4E9',
        isRepeat: data.isRepeat ?? true,
        remindDays: Array.isArray(data.remindDays) && data.remindDays.length ? data.remindDays : [1, 7],
      }
    } else {
      errorMessage.value = response?.message || '加载失败'
    }
  } catch (error: any) {
    console.error('获取纪念日详情失败:', error)
    errorMessage.value = error.message || '加载失败'
  } finally {
    loading.value = false
  }
}

await loadDetail()

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    alert('请输入纪念日名称')
    return
  }
  if (!form.value.date) {
    alert('请选择日期')
    return
  }

  isSubmitting.value = true
  try {
    const response = await authFetch<ApiResponse<any>>(`/api/anniversary/${anniversaryId.value}`, {
      method: 'PUT',
      body: {
        title: form.value.title,
        description: form.value.description,
        date: form.value.date,
        type: form.value.type,
        icon: form.value.icon,
        color: form.value.color,
        isRepeat: form.value.isRepeat,
        remindDays: form.value.remindDays,
      },
    })

    if (response?.code === 0) {
      router.push('/anniversary')
    } else {
      alert(response?.message || '保存失败，请重试')
    }
  } catch (error) {
    console.error('更新纪念日失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">编辑纪念日</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-romantic-pink" />
    </div>

    <div v-else-if="errorMessage" class="text-center py-12 space-y-4">
      <Icon name="lucide:alert-circle" class="w-10 h-10 text-destructive mx-auto" />
      <p class="text-muted-foreground">{{ errorMessage }}</p>
      <Button variant="outline" @click="loadDetail">重试</Button>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <Card :style="{ backgroundColor: form.color }">
        <CardContent class="p-6 flex items-center gap-4">
          <div class="text-4xl">{{ form.icon }}</div>
          <div>
            <h3 class="font-bold text-lg text-foreground">{{ form.title || '纪念日名称' }}</h3>
            <p class="text-sm text-muted-foreground">{{ form.date || '选择日期' }}</p>
          </div>
        </CardContent>
      </Card>

      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">纪念日名称</label>
        <Input v-model="form.title" placeholder="例如：恋爱纪念日" />
      </div>

      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">日期</label>
        <Input v-model="form.date" type="date" />
      </div>

      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">类型</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="type in anniversaryTypes"
            :key="type.value"
            type="button"
            class="flex items-center gap-1 px-3 py-2 rounded-full border transition-colors text-sm"
            :class="form.type === type.value
              ? 'bg-romantic-pink text-white border-romantic-pink'
              : 'bg-white border-border hover:border-romantic-pink'"
            @click="handleTypeChange(type.value)"
          >
            <span>{{ type.icon }}</span>
            <span>{{ type.label }}</span>
          </button>
        </div>
      </div>

      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">图标</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="icon in icons"
            :key="icon"
            type="button"
            class="w-10 h-10 rounded-lg border flex items-center justify-center text-xl transition-colors"
            :class="form.icon === icon
              ? 'bg-romantic-pink border-romantic-pink'
              : 'bg-white border-border hover:border-romantic-pink'"
            @click="form.icon = icon"
          >
            {{ icon }}
          </button>
        </div>
      </div>

      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">背景颜色</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in colors"
            :key="color"
            type="button"
            class="w-10 h-10 rounded-lg border-2 transition-all"
            :class="form.color === color ? 'border-romantic-pink scale-110' : 'border-transparent'"
            :style="{ backgroundColor: color }"
            @click="form.color = color"
          />
        </div>
      </div>

      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">描述（可选）</label>
        <Textarea v-model="form.description" placeholder="记录这个纪念日的故事..." class="min-h-[100px]" />
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="relative w-12 h-6 rounded-full transition-colors"
          :class="form.isRepeat ? 'bg-romantic-pink' : 'bg-muted'"
          @click="form.isRepeat = !form.isRepeat"
        >
          <span
            class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
            :class="form.isRepeat ? 'translate-x-7' : 'translate-x-1'"
          />
        </button>
        <span class="text-sm text-foreground">每年重复</span>
      </div>

      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">提前提醒</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="day in [1, 3, 7, 14, 30]"
            :key="day"
            type="button"
            class="px-3 py-2 rounded-full border text-sm transition-colors"
            :class="form.remindDays.includes(day)
              ? 'bg-romantic-pink text-white border-romantic-pink'
              : 'bg-white border-border hover:border-romantic-pink'"
            @click="toggleRemindDay(day)"
          >
            {{ day }}天前
          </button>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <Button type="button" variant="outline" class="flex-1" @click="router.back()">
          取消
        </Button>
        <Button type="submit" variant="love" class="flex-1" :disabled="isSubmitting">
          <Icon v-if="isSubmitting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          {{ isSubmitting ? '保存中...' : '保存修改' }}
        </Button>
      </div>
    </form>
  </div>
</template>
