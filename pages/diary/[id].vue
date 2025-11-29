<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { moodOptions, weatherOptions, getRelativeTime } from '~/lib/utils'
import type { ApiResponse } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const diaryId = computed(() => route.params.id as string)

// 加载状态
const loading = ref(true)
const error = ref('')
const isLiking = ref(false)
const isCommenting = ref(false)
const isDeleting = ref(false)
const showDeleteConfirm = ref(false)

// 日记数据
const diary = ref<any>(null)
const comments = ref<any[]>([])

// 获取日记详情
const fetchDiary = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await useAuthFetch<ApiResponse<any>>(`/api/diary/${diaryId.value}`)
    
    if (data.value?.code === 0) {
      diary.value = data.value.data
      comments.value = data.value.data.comments || []
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

const newComment = ref('')
const currentImageIndex = ref(0)
const showImageViewer = ref(false)

const getMoodInfo = (mood?: string) => {
  return moodOptions.find(m => m.value === mood)
}

const getWeatherInfo = (weather?: string) => {
  return weatherOptions.find(w => w.value === weather)
}

// 点赞
const handleLike = async () => {
  if (isLiking.value || !diary.value) return
  isLiking.value = true
  
  try {
    const response = await authFetch<ApiResponse<any>>('/api/diary/like', {
      method: 'POST',
      body: { diaryId: diary.value.id },
    })
    
    if (response?.code === 0) {
      diary.value.isLiked = response.data.isLiked
      diary.value.likeCount = response.data.likeCount
    }
  } catch (e) {
    console.error('点赞失败:', e)
  } finally {
    isLiking.value = false
  }
}

// 发表评论
const submitComment = async () => {
  if (!newComment.value.trim() || isCommenting.value || !diary.value) return
  isCommenting.value = true
  
  try {
    const response = await authFetch<ApiResponse<any>>('/api/diary/comment', {
      method: 'POST',
      body: { 
        diaryId: diary.value.id,
        content: newComment.value.trim(),
      },
    })
    
    if (response?.code === 0) {
      comments.value.push(response.data)
      diary.value.commentCount = response.data.commentCount
      newComment.value = ''
    }
  } catch (e) {
    console.error('评论失败:', e)
  } finally {
    isCommenting.value = false
  }
}

// 删除日记
const handleDelete = async () => {
  if (isDeleting.value || !diary.value) return
  isDeleting.value = true
  
  try {
    const response = await authFetch<ApiResponse<any>>(`/api/diary/${diary.value.id}`, {
      method: 'DELETE',
    })
    
    if (response?.code === 0) {
      router.replace('/diary')
    } else {
      alert(response?.message || '删除失败')
    }
  } catch (e: any) {
    alert(e.message || '删除失败')
  } finally {
    isDeleting.value = false
    showDeleteConfirm.value = false
  }
}

// 编辑日记
const handleEdit = () => {
  router.push(`/diary/edit/${diary.value.id}`)
}

const openImageViewer = (index: number) => {
  currentImageIndex.value = index
  showImageViewer.value = true
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- 返回按钮 -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground flex-1">日记详情</h1>
      <!-- 操作菜单（仅作者可见） -->
      <template v-if="diary?.isOwner">
        <Button variant="ghost" size="icon" @click="handleEdit">
          <Icon name="lucide:edit" class="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" class="text-destructive" @click="showDeleteConfirm = true">
          <Icon name="lucide:trash-2" class="w-5 h-5" />
        </Button>
      </template>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="space-y-4">
      <div class="skeleton h-20 rounded-xl" />
      <div class="skeleton h-40 rounded-xl" />
      <div class="skeleton h-32 rounded-xl" />
    </div>

    <!-- 错误状态 -->
    <Card v-else-if="error" class="p-8 text-center">
      <Icon name="lucide:alert-circle" class="w-12 h-12 text-destructive/60 mx-auto mb-4" />
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button variant="outline" @click="fetchDiary">重试</Button>
    </Card>

    <!-- 日记内容 -->
    <template v-else-if="diary">
      <Card>
        <CardContent class="p-6 space-y-4">
          <!-- 作者信息 -->
          <div class="flex items-center gap-3">
            <Avatar class="w-12 h-12">
              <AvatarImage :src="diary.author?.avatarUrl" :alt="diary.author?.nickName" />
              <AvatarFallback class="bg-romantic-pink text-white">
                {{ diary.author?.nickName?.charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1">
              <p class="font-medium text-foreground">{{ diary.author?.nickName }}</p>
              <p class="text-sm text-muted-foreground">{{ diary.diaryDate }} · {{ getRelativeTime(diary.createTime) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <Badge v-if="diary.isPrivate" variant="secondary" class="gap-1">
                <Icon name="lucide:lock" class="w-3 h-3" />
                私密
              </Badge>
              <Badge v-if="getMoodInfo(diary.mood)" variant="outline">
                {{ getMoodInfo(diary.mood)?.emoji }} {{ getMoodInfo(diary.mood)?.label }}
              </Badge>
              <Badge v-if="getWeatherInfo(diary.weather)" variant="outline">
                {{ getWeatherInfo(diary.weather)?.emoji }}
              </Badge>
            </div>
          </div>

        <!-- 标题 -->
        <h2 v-if="diary.title" class="text-xl font-bold text-foreground">{{ diary.title }}</h2>

        <!-- 内容 -->
        <div class="text-foreground whitespace-pre-wrap leading-relaxed">{{ diary.content }}</div>

        <!-- 图片 -->
        <div v-if="diary.images?.length" class="grid gap-2" :class="diary.images.length === 1 ? 'grid-cols-1' : 'grid-cols-3'">
          <div 
            v-for="(img, idx) in diary.images" 
            :key="idx"
            class="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
            @click="openImageViewer(idx)"
          >
            <img :src="img" :alt="`图片${idx + 1}`" class="w-full h-full object-cover hover:scale-105 transition-transform" />
          </div>
        </div>

        <!-- 位置 -->
        <div v-if="diary.location" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="lucide:map-pin" class="w-4 h-4" />
          <span>{{ diary.location }}</span>
        </div>

        <!-- 互动栏 -->
        <div class="flex items-center gap-6 pt-4 border-t">
          <button 
            class="flex items-center gap-2 transition-colors"
            :class="diary.isLiked ? 'text-romantic-pink' : 'text-muted-foreground hover:text-romantic-pink'"
            @click="handleLike"
          >
            <Icon name="lucide:heart" :class="{ 'fill-current': diary.isLiked }" class="w-5 h-5" />
            <span>{{ diary.likeCount }}</span>
          </button>
          <div class="flex items-center gap-2 text-muted-foreground">
            <Icon name="lucide:message-circle" class="w-5 h-5" />
            <span>{{ diary.commentCount }}</span>
          </div>
          <Button variant="ghost" size="sm" class="ml-auto">
            <Icon name="lucide:share-2" class="w-4 h-4" />
            分享
          </Button>
        </div>
      </CardContent>
    </Card>
    </template>
    <!-- 评论区 -->
    <Card>
      <CardContent class="p-6 space-y-4">
        <h3 class="font-semibold text-foreground">评论 ({{ comments.length }})</h3>
        
        <!-- 评论列表 -->
        <div class="space-y-4">
          <div 
            v-for="comment in comments" 
            :key="comment.id"
            class="flex gap-3"
          >
            <Avatar class="w-8 h-8 shrink-0">
              <AvatarImage :src="comment.user.avatarUrl" />
              <AvatarFallback class="bg-romantic-rose text-white text-xs">
                {{ comment.user.nickName?.charAt(0) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm text-foreground">{{ comment.user.nickName }}</span>
                <span class="text-xs text-muted-foreground">{{ getRelativeTime(comment.createTime) }}</span>
              </div>
              <p class="text-sm text-foreground mt-1">{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <!-- 发表评论 -->
        <div class="flex items-center gap-2 pt-4 border-t">
          <Input 
            v-model="newComment"
            placeholder="写下你的评论..."
            class="flex-1"
            @keyup.enter="submitComment"
          />
          <Button 
            variant="love"
            :disabled="!newComment.trim()"
            @click="submitComment"
          >
            发送
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- 图片查看器 -->
    <Teleport to="body">
      <div 
        v-if="showImageViewer"
        class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        @click="showImageViewer = false"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          class="absolute top-4 right-4 text-white"
          @click="showImageViewer = false"
        >
          <Icon name="lucide:x" class="w-6 h-6" />
        </Button>
        
        <Button 
          v-if="currentImageIndex > 0"
          variant="ghost" 
          size="icon" 
          class="absolute left-4 text-white"
          @click.stop="currentImageIndex--"
        >
          <Icon name="lucide:chevron-left" class="w-8 h-8" />
        </Button>
        
        <img 
          :src="diary.images?.[currentImageIndex]" 
          class="max-w-full max-h-full object-contain"
          @click.stop
        />
        
        <Button 
          v-if="currentImageIndex < (diary.images?.length || 0) - 1"
          variant="ghost" 
          size="icon" 
          class="absolute right-4 text-white"
          @click.stop="currentImageIndex++"
        >
          <Icon name="lucide:chevron-right" class="w-8 h-8" />
        </Button>
        
        <div class="absolute bottom-4 text-white text-sm">
          {{ currentImageIndex + 1 }} / {{ diary.images?.length }}
        </div>
      </div>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <div 
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        @click="showDeleteConfirm = false"
      >
        <Card class="w-full max-w-sm" @click.stop>
          <CardContent class="p-6 text-center space-y-4">
            <Icon name="lucide:alert-triangle" class="w-12 h-12 text-destructive mx-auto" />
            <h3 class="text-lg font-semibold">确定删除这篇日记吗？</h3>
            <p class="text-sm text-muted-foreground">删除后将无法恢复，相关的评论和点赞也会被删除。</p>
            <div class="flex gap-3">
              <Button 
                variant="outline" 
                class="flex-1"
                @click="showDeleteConfirm = false"
              >
                取消
              </Button>
              <Button 
                variant="destructive" 
                class="flex-1"
                :disabled="isDeleting"
                @click="handleDelete"
              >
                <Icon v-if="isDeleting" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                {{ isDeleting ? '删除中...' : '确定删除' }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Teleport>
  </div>
</template>
