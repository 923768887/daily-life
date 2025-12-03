<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { useUserStore } from '~/stores/user'
import { authFetch } from '~/composables/useAuthFetch'
import type { ApiResponse } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const userStore = useUserStore()
const currentUserId = computed(() => userStore.userInfo?.id)

// 状态
const loading = ref(true)
const sending = ref(false)
const loadingMore = ref(false)
const hasMore = ref(false)
const error = ref('')

// 数据
const messages = ref<any[]>([])
const partnerInfo = ref<any>(null)
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const specialMessages: Record<string, { icon: string; text: string }> = {
  poke: { icon: '👆', text: '戳了戳你' },
  missyou: { icon: '💭', text: '想你了' },
  hug: { icon: '🤗', text: '给你一个拥抱' },
  kiss: { icon: '😘', text: '亲亲你' },
}

const POLL_INTERVAL = 5000
let pollTimer: ReturnType<typeof setInterval> | null = null

// 获取消息列表
const fetchMessages = async (beforeId?: number, options: { silent?: boolean } = {}) => {
  const { silent = false } = options
  if (beforeId) {
    loadingMore.value = true
  } else if (!silent) {
    loading.value = true
  }
  error.value = ''

  try {
    const params = new URLSearchParams({ limit: '50' })
    if (beforeId) {
      params.set('beforeId', String(beforeId))
    }
    const response = await authFetch<ApiResponse<any>>(`/api/message/list?${params.toString()}`)
    
    if (response?.code === 0) {
      const prevLastId = messages.value[messages.value.length - 1]?.id
      if (beforeId) {
        messages.value = [...response.data.messages, ...messages.value]
      } else {
        messages.value = response.data.messages
        partnerInfo.value = response.data.partner
      }
      hasMore.value = response.data.hasMore

      const newLastId = messages.value[messages.value.length - 1]?.id
      return !beforeId && silent && newLastId && newLastId !== prevLastId
    } else {
      error.value = response?.message || '加载失败'
    }
  } catch (e: any) {
    error.value = e.message || '加载失败'
  } finally {
    if (beforeId) {
      loadingMore.value = false
    } else if (!silent) {
      loading.value = false
    }
  }

  return false
}

// 初始加载
await fetchMessages()

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const startPolling = () => {
  if (pollTimer) return
  pollTimer = setInterval(async () => {
    const updated = await fetchMessages(undefined, { silent: true })
    if (updated) {
      scrollToBottom()
    }
  }, POLL_INTERVAL)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 初始滚动到底部并开始轮询
onMounted(() => {
  scrollToBottom()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 发送文本消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || sending.value) return
  sending.value = true
  
  const content = newMessage.value.trim()
  newMessage.value = ''
  
  try {
    const response = await authFetch<ApiResponse<any>>('/api/message/send', {
      method: 'POST',
      body: { type: 'text', content },
    })
    
    if (response?.code === 0) {
      messages.value.push(response.data)
      scrollToBottom()
    } else {
      // 恢复输入
      newMessage.value = content
    }
  } catch (e) {
    console.error('发送失败:', e)
    newMessage.value = content
  } finally {
    sending.value = false
  }
}

// 发送特殊消息
const sendSpecialMessage = async (type: string) => {
  if (sending.value) return
  sending.value = true
  
  try {
    const response = await authFetch<ApiResponse<any>>('/api/message/send', {
      method: 'POST',
      body: { type: 'special', specialType: type },
    })
    
    if (response?.code === 0) {
      messages.value.push(response.data)
      scrollToBottom()
    }
  } catch (e) {
    console.error('发送失败:', e)
  } finally {
    sending.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (loadingMore.value || !hasMore.value || messages.value.length === 0) return
  const firstMessageId = messages.value[0]?.id
  if (firstMessageId) {
    fetchMessages(firstMessageId)
  }
}

const isMyMessage = (senderId: number) => senderId === currentUserId.value
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-romantic-pink" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center gap-4">
      <Icon name="lucide:alert-circle" class="w-12 h-12 text-destructive/60" />
      <p class="text-muted-foreground">{{ error }}</p>
      <Button variant="outline" @click="fetchMessages()">重试</Button>
    </div>

    <!-- 未配对状态 -->
    <div v-else-if="!partnerInfo" class="flex-1 flex flex-col items-center justify-center gap-4">
      <Icon name="lucide:heart" class="w-16 h-16 text-romantic-pink/40" />
      <p class="text-muted-foreground">请先完成情侣配对</p>
      <Button variant="love" @click="$router.push('/couple/pair')">去配对</Button>
    </div>

    <!-- 正常聊天界面 -->
    <template v-else>
      <!-- 聊天头部 -->
      <div class="flex items-center gap-3 pb-4 border-b">
        <Avatar class="w-12 h-12">
          <AvatarImage :src="partnerInfo.avatarUrl" :alt="partnerInfo.nickName" />
          <AvatarFallback class="bg-romantic-rose text-white">
            {{ partnerInfo.nickName?.charAt(0) }}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 class="font-bold text-foreground">{{ partnerInfo.nickName }}</h1>
          <p class="text-sm text-muted-foreground">在线</p>
        </div>
      </div>

    <!-- 消息列表 -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto py-4 space-y-4"
      @scroll="(e: Event) => {
        const target = e.target as HTMLElement
        if (target.scrollTop < 50 && hasMore && !loadingMore) {
          loadMore()
        }
      }"
    >
      <!-- 加载更多提示 -->
      <div v-if="loadingMore" class="text-center py-2">
        <Icon name="lucide:loader-2" class="w-5 h-5 animate-spin text-romantic-pink inline-block" />
      </div>
      <div v-else-if="hasMore" class="text-center py-2">
        <button class="text-sm text-muted-foreground hover:text-romantic-pink" @click="loadMore">
          加载更多消息
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="messages.length === 0" class="flex-1 flex flex-col items-center justify-center py-12">
        <Icon name="lucide:message-circle-heart" class="w-16 h-16 text-romantic-pink/30 mb-4" />
        <p class="text-muted-foreground">还没有消息</p>
        <p class="text-sm text-muted-foreground">发送一条消息开始聊天吧~</p>
      </div>

      <div 
        v-for="msg in messages" 
        :key="msg.id"
        class="flex"
        :class="isMyMessage(msg.senderId) ? 'justify-end' : 'justify-start'"
      >
        <!-- 对方消息 -->
        <div v-if="!isMyMessage(msg.senderId)" class="flex items-end gap-2 max-w-[75%]">
          <Avatar class="w-8 h-8 shrink-0">
            <AvatarImage :src="partnerInfo.avatarUrl" />
            <AvatarFallback class="bg-romantic-rose text-white text-xs">
              {{ partnerInfo.nickName?.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <div>
            <div 
              v-if="msg.type === 'text'"
              class="bg-white rounded-2xl rounded-bl-sm px-4 py-2 shadow-sm"
            >
              <p class="text-foreground">{{ msg.content }}</p>
            </div>
            <div 
              v-else-if="msg.type === 'special'"
              class="bg-romantic-blush rounded-2xl rounded-bl-sm px-4 py-3 text-center"
            >
              <div class="text-3xl mb-1">{{ specialMessages[msg.specialType!].icon }}</div>
              <p class="text-sm text-muted-foreground">{{ specialMessages[msg.specialType!].text }}</p>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ formatTime(msg.createTime) }}</p>
          </div>
        </div>

        <!-- 我的消息 -->
        <div v-else class="flex items-end gap-2 max-w-[75%]">
          <div class="text-right">
            <div 
              v-if="msg.type === 'text'"
              class="love-gradient text-white rounded-2xl rounded-br-sm px-4 py-2"
            >
              <p>{{ msg.content }}</p>
            </div>
            <div 
              v-else-if="msg.type === 'special'"
              class="bg-romantic-pink/20 rounded-2xl rounded-br-sm px-4 py-3 text-center"
            >
              <div class="text-3xl mb-1">{{ specialMessages[msg.specialType!].icon }}</div>
              <p class="text-sm text-romantic-pink">{{ specialMessages[msg.specialType!].text }}</p>
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ formatTime(msg.createTime) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 特殊消息快捷按钮 -->
    <div class="flex items-center gap-2 py-2 overflow-x-auto">
      <button
        v-for="(info, type) in specialMessages"
        :key="type"
        class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-romantic-blush text-sm shrink-0 hover:bg-romantic-pink/20 transition-colors disabled:opacity-50"
        :disabled="sending"
        @click="sendSpecialMessage(type)"
      >
        <span>{{ info.icon }}</span>
        <span class="text-muted-foreground">{{ info.text }}</span>
      </button>
    </div>

    <!-- 输入框 -->
    <div class="flex items-center gap-2 pt-2 border-t">
      <Button variant="ghost" size="icon">
        <Icon name="lucide:image" class="w-5 h-5 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon">
        <Icon name="lucide:mic" class="w-5 h-5 text-muted-foreground" />
      </Button>
      <Input 
        v-model="newMessage"
        placeholder="输入消息..."
        class="flex-1"
        :disabled="sending"
        @keyup.enter="sendMessage"
      />
      <Button 
        variant="love" 
        size="icon"
        :disabled="!newMessage.trim() || sending"
        @click="sendMessage"
      >
        <Icon v-if="sending" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
        <Icon v-else name="lucide:send" class="w-4 h-4" />
      </Button>
    </div>
    </template>
  </div>
</template>
