<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Input } from '~/components/ui/input'
import { moodOptions, weatherOptions, getRelativeTime } from '~/lib/utils'

const route = useRoute()
const router = useRouter()

// 模拟日记详情数据
const diary = ref({
  id: Number(route.params.id),
  title: '今天的约会超开心',
  content: `今天我们一起去了外滩，看了夜景，吃了好吃的晚餐。

天气很好，微风轻拂，我们手牵手走在江边，看着对岸的灯火辉煌，感觉整个世界都是我们的。

晚餐在一家很有情调的餐厅，点了我们都爱吃的菜，边吃边聊，时间过得好快。

希望以后每一天都能这么幸福，和你在一起的每一刻都值得珍藏。❤️`,
  mood: 'happy',
  weather: 'sunny',
  location: '上海外滩',
  latitude: 31.2397,
  longitude: 121.4998,
  images: [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
  ],
  likeCount: 1,
  commentCount: 2,
  diaryDate: '2024-01-15',
  createTime: '2024-01-15 20:30:00',
  author: {
    id: 1,
    nickName: '小甜心',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  },
  isLiked: true,
})

const comments = ref([
  {
    id: 1,
    content: '好开心的一天！下次我们去迪士尼吧 🏰',
    user: {
      id: 2,
      nickName: '小宝贝',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    },
    createTime: '2024-01-15 21:00:00',
  },
  {
    id: 2,
    content: '好呀好呀！我也想去！',
    user: {
      id: 1,
      nickName: '小甜心',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    },
    createTime: '2024-01-15 21:05:00',
    parentId: 1,
  },
])

const newComment = ref('')
const currentImageIndex = ref(0)
const showImageViewer = ref(false)

const getMoodInfo = (mood?: string) => {
  return moodOptions.find(m => m.value === mood)
}

const getWeatherInfo = (weather?: string) => {
  return weatherOptions.find(w => w.value === weather)
}

const handleLike = () => {
  diary.value.isLiked = !diary.value.isLiked
  diary.value.likeCount += diary.value.isLiked ? 1 : -1
}

const submitComment = () => {
  if (!newComment.value.trim()) return
  
  comments.value.push({
    id: Date.now(),
    content: newComment.value,
    user: {
      id: 1,
      nickName: '小甜心',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    },
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  })
  
  diary.value.commentCount++
  newComment.value = ''
}

const openImageViewer = (index: number) => {
  currentImageIndex.value = index
  showImageViewer.value = true
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <!-- 返回按钮 -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">日记详情</h1>
    </div>

    <!-- 日记内容 -->
    <Card>
      <CardContent class="p-6 space-y-4">
        <!-- 作者信息 -->
        <div class="flex items-center gap-3">
          <Avatar class="w-12 h-12">
            <AvatarImage :src="diary.author.avatarUrl" :alt="diary.author.nickName" />
            <AvatarFallback class="bg-romantic-pink text-white">
              {{ diary.author.nickName?.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-1">
            <p class="font-medium text-foreground">{{ diary.author.nickName }}</p>
            <p class="text-sm text-muted-foreground">{{ diary.diaryDate }} · {{ getRelativeTime(diary.createTime) }}</p>
          </div>
          <div class="flex items-center gap-2">
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
  </div>
</template>
