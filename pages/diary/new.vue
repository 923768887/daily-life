<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { moodOptions, weatherOptions, formatDate } from '~/lib/utils'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()

const form = ref({
  title: '',
  content: '',
  mood: '',
  weather: '',
  location: '',
  isPrivate: false,
  diaryDate: formatDate(new Date(), 'YYYY-MM-DD'),
  images: [] as string[],
})

const isSubmitting = ref(false)

const handleSubmit = async () => {
  if (!form.value.content.trim()) {
    alert('请输入日记内容')
    return
  }

  isSubmitting.value = true
  
  try {
    const response = await authFetch<any>('/api/diary/add', {
      method: 'POST',
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
      router.push('/diary')
    } else {
      alert(response?.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleImageUpload = () => {
  // TODO: 实现图片上传
  const mockImage = `https://picsum.photos/400/300?random=${Date.now()}`
  form.value.images.push(mockImage)
}

const removeImage = (index: number) => {
  form.value.images.splice(index, 1)
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">写日记</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
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
        <label class="text-sm font-medium text-foreground mb-2 block">添加图片</label>
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
            @click="handleImageUpload"
          >
            <Icon name="lucide:plus" class="w-6 h-6" />
            <span class="text-xs">添加图片</span>
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
          {{ isSubmitting ? '保存中...' : '发布日记' }}
        </Button>
      </div>
    </form>
  </div>
</template>
