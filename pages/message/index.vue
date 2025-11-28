<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'

// 模拟消息数据
const messages = ref([
  { id: 1, type: 'text', content: '今天想你了', senderId: 2, createTime: '2024-01-15 20:30:00', isRead: true },
  { id: 2, type: 'text', content: '我也想你呀 ❤️', senderId: 1, createTime: '2024-01-15 20:31:00', isRead: true },
  { id: 3, type: 'special', specialType: 'hug', senderId: 2, createTime: '2024-01-15 20:32:00', isRead: true },
  { id: 4, type: 'text', content: '晚安宝贝，好梦', senderId: 1, createTime: '2024-01-15 23:00:00', isRead: true },
  { id: 5, type: 'special', specialType: 'kiss', senderId: 2, createTime: '2024-01-15 23:01:00', isRead: false },
])

const partnerInfo = ref({
  id: 2,
  nickName: '小宝贝',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
})

const currentUserId = 1
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const specialMessages: Record<string, { icon: string; text: string }> = {
  poke: { icon: '👆', text: '戳了戳你' },
  missyou: { icon: '💭', text: '想你了' },
  hug: { icon: '🤗', text: '给你一个拥抱' },
  kiss: { icon: '😘', text: '亲亲你' },
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  messages.value.push({
    id: Date.now(),
    type: 'text',
    content: newMessage.value,
    senderId: currentUserId,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    isRead: false,
  })
  
  newMessage.value = ''
  
  // 滚动到底部
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendSpecialMessage = (type: string) => {
  messages.value.push({
    id: Date.now(),
    type: 'special',
    specialType: type,
    senderId: currentUserId,
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    isRead: false,
  })
  
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const isMyMessage = (senderId: number) => senderId === currentUserId
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
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
    >
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
        class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-romantic-blush text-sm shrink-0 hover:bg-romantic-pink/20 transition-colors"
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
        @keyup.enter="sendMessage"
      />
      <Button 
        variant="love" 
        size="icon"
        :disabled="!newMessage.trim()"
        @click="sendMessage"
      >
        <Icon name="lucide:send" class="w-4 h-4" />
      </Button>
    </div>
  </div>
</template>
