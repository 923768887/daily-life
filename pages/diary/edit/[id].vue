<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { moodOptions, weatherOptions, formatDate } from '~/lib/utils'
import type { ApiResponse } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const diaryId = computed(() => route.params.id as string)

const loading = ref(true)
const isSubmitting = ref(false)
const isUploading = ref(false)
const error = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const form = ref({
  title: '',
  content: '',
  mood: '',
  weather: '',
  location: '',
  isPrivate: false,
  diaryDate: '',
  images: [] as string[],
})

// 获取日记详情
const fetchDiary = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await useAuthFetch<ApiResponse<any>>(`/api/diary/${diaryId.value}`)
    
    if (data.value?.code === 0) {
      const diary = data.value.data
      
      // 检查是否是作者
      if (!diary.isOwner) {
        error.value = '只能编辑自己的日记'
        return
      }
      
      form.value = {
        title: diary.title || '',
        content: diary.content || '',
        mood: diary.mood || '',
        weather: diary.weather || '',
        location: diary.location || '',
        isPrivate: diary.isPrivate || false,
        diaryDate: diary.diaryDate || formatDate(new Date(), 'YYYY-MM-DD'),
        images: diary.images || [],
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

await fetchDiary()

const handleSubmit = async () => {
  if (!form.value.content.trim()) {
    alert('请输入日记内容')
    return
  }

  isSubmitting.value = true
  
  try {
    const response = await authFetch<ApiResponse<any>>(`/api/diary/${diaryId.value}`, {
      method: 'PUT',
      body: {
        title: form.value.title,
        content: form.value.content,
        mood: form.value.mood,
        weather: form.value.weather,
        location: form.value.location,
        images: form.value.images,
        isPrivate: form.value.isPrivate,
        diaryDate: form.value.diaryDate,
      },
    })
    
    if (response?.code === 0) {
      router.replace(`/diary/${diaryId.value}`)
    } else {
      alert(response?.message || '保存失败')
    }
  } catch (e: any) {
    console.error('保存失败:', e)
    alert(e.message || '保存失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleImageUpload = () => {
  fileInputRef.value?.click()
}

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  
  if (!files || files.length === 0) return
  
  if (form.value.images.length + files.length > 9) {
    alert('最多只能上传9张图片')
    return
  }

  isUploading.value = true
  
  try {
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    const response = await authFetch<any>('/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    if (response?.code === 0 && response.data?.urls) {
      form.value.images.push(...response.data.urls)
    } else {
      alert(response?.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
    input.value = ''
  }
}

const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">编辑日记</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="space-y-4">
      <div class="skeleton h-12 rounded-lg" />
      <div class="skeleton h-12 rounded-lg" />
      <div class="skeleton h-40 rounded-lg" />
    </div>

    <!-- 错误状态 -->
    <Card v-else-if="error" class="p-8 text-center">
      <Icon name="lucide:alert-circle" class="w-12 h-12 text-destructive/60 mx-auto mb-4" />
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button variant="outline" @click="router.back()">返回</Button>
    </Card>

    <!-- 编辑表单 -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 日期选择 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">日期</label>
        <Input 
          v-model="form.diaryDate"
          type="date"
        />
      </div>

      <!-- 标题 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">标题（可选）</label>
        <Input 
          v-model="form.title"
          placeholder="给今天起个标题吧..."
        />
      </div>

      <!-- 内容 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">内容</label>
        <Textarea 
          v-model="form.content"
          placeholder="记录今天的点点滴滴..."
          class="min-h-[200px]"
        />
      </div>

      <!-- 心情选择 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">今天的心情</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="mood in moodOptions"
            :key="mood.value"
            type="button"
            class="flex items-center gap-1 px-3 py-2 rounded-full border transition-colors"
            :class="form.mood === mood.value 
              ? 'bg-romantic-pink text-white border-romantic-pink' 
              : 'bg-white border-border hover:border-romantic-pink'"
            @click="form.mood = form.mood === mood.value ? '' : mood.value"
          >
            <span>{{ mood.emoji }}</span>
            <span class="text-sm">{{ mood.label }}</span>
          </button>
        </div>
      </div>

      <!-- 天气选择 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">今天的天气</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="weather in weatherOptions"
            :key="weather.value"
            type="button"
            class="flex items-center gap-1 px-3 py-2 rounded-full border transition-colors"
            :class="form.weather === weather.value 
              ? 'bg-romantic-pink text-white border-romantic-pink' 
              : 'bg-white border-border hover:border-romantic-pink'"
            @click="form.weather = form.weather === weather.value ? '' : weather.value"
          >
            <span>{{ weather.emoji }}</span>
            <span class="text-sm">{{ weather.label }}</span>
          </button>
        </div>
      </div>

      <!-- 位置 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">位置（可选）</label>
        <div class="relative">
          <Icon name="lucide:map-pin" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            v-model="form.location"
            placeholder="记录这个地方..."
            class="pl-10"
          />
        </div>
      </div>

      <!-- 图片上传 -->
      <div>
        <label class="text-sm font-medium text-foreground mb-2 block">图片</label>
        <input 
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onFileChange"
        />
        <div class="grid grid-cols-3 gap-3">
          <div 
            v-for="(img, idx) in form.images" 
            :key="idx"
            class="relative aspect-square rounded-lg overflow-hidden group"
          >
            <img :src="img" class="w-full h-full object-cover" />
            <button
              type="button"
              class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeImage(idx)"
            >
              <Icon name="lucide:x" class="w-4 h-4" />
            </button>
          </div>
          <button
            v-if="form.images.length < 9"
            type="button"
            class="aspect-square rounded-lg border-2 border-dashed border-border hover:border-romantic-pink flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-romantic-pink transition-colors"
            :disabled="isUploading"
            @click="handleImageUpload"
          >
            <Icon v-if="isUploading" name="lucide:loader-2" class="w-6 h-6 animate-spin" />
            <Icon v-else name="lucide:plus" class="w-6 h-6" />
            <span class="text-xs">{{ isUploading ? '上传中...' : '添加图片' }}</span>
          </button>
        </div>
      </div>

      <!-- 私密设置 -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="relative w-12 h-6 rounded-full transition-colors"
          :class="form.isPrivate ? 'bg-romantic-pink' : 'bg-muted'"
          @click="form.isPrivate = !form.isPrivate"
        >
          <span 
            class="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
            :class="form.isPrivate ? 'translate-x-7' : 'translate-x-1'"
          />
        </button>
        <span class="text-sm text-foreground">仅自己可见</span>
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
