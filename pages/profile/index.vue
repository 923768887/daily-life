<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import type { ApiResponse, PaginatedData } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

// 从 API 获取用户数据
const { data: userData } = await useAuthFetch<ApiResponse<PaginatedData<any>>>('/api/user/info')
const userInfo = computed(() => {
  if (userData.value?.code === 0 && userData.value?.data) {
    return userData.value.data
  }
  return { id: 0, nickName: '用户', avatarUrl: '', phone: '', birthday: '', constellation: '' }
})

// 从 API 获取情侣数据
const { data: coupleData } = await useAuthFetch<ApiResponse<PaginatedData<any>>>('/api/couple/info')
const coupleInfo = computed(() => {
  if (coupleData.value?.code === 0 && coupleData.value?.data) {
    return coupleData.value.data
  }
  return { loveDays: 0, loveStartDate: '', partnerInfo: { nickName: '' } }
})

// 统计数据（暂时使用模拟数据，后续可添加统计 API）
const statistics = ref({
  diaryCount: 0,
  photoCount: 0,
  anniversaryCount: 0,
  checkInDays: 0,
  totalPoints: 0,
})

const badges = ref([
  { id: 1, name: '初恋甜蜜', icon: '💕', description: '完成配对' },
])

const menuItems = [
  { icon: 'lucide:heart', label: '情侣档案', path: '/profile/couple' },
  { icon: 'lucide:user', label: '个人资料', path: '/profile/info' },
  { icon: 'lucide:bell', label: '消息通知', path: '/profile/notifications' },
  { icon: 'lucide:shield', label: '隐私设置', path: '/profile/privacy' },
  { icon: 'lucide:palette', label: '主题设置', path: '/profile/theme' },
  { icon: 'lucide:download', label: '数据备份', path: '/profile/backup' },
  { icon: 'lucide:help-circle', label: '帮助与反馈', path: '/profile/help' },
  { icon: 'lucide:info', label: '关于我们', path: '/profile/about' },
]
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 用户信息卡片 -->
    <Card class="overflow-hidden">
      <div class="love-gradient h-24" />
      <CardContent class="relative pt-0 pb-6">
        <div class="flex flex-col items-center -mt-12">
          <Avatar class="w-24 h-24 ring-4 ring-white">
            <AvatarImage :src="userInfo.avatarUrl" :alt="userInfo.nickName" />
            <AvatarFallback class="bg-romantic-pink text-white text-2xl">
              {{ userInfo.nickName?.charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <h2 class="text-xl font-bold text-foreground mt-3">{{ userInfo.nickName }}</h2>
          <p class="text-sm text-muted-foreground">{{ userInfo.constellation }} · {{ userInfo.phone }}</p>
          
          <!-- 情侣信息 - 已配对 -->
          <div v-if="coupleInfo.loveDays > 0" class="flex items-center gap-3 mt-4 px-4 py-2 bg-romantic-blush rounded-full">
            <Avatar class="w-8 h-8">
              <AvatarImage :src="coupleInfo.partnerInfo?.avatarUrl" />
              <AvatarFallback class="bg-romantic-rose text-white text-sm">
                {{ coupleInfo.partnerInfo?.nickName?.charAt(0) || '?' }}
              </AvatarFallback>
            </Avatar>
            <span class="text-sm text-foreground">
              与 <span class="font-medium">{{ coupleInfo.partnerInfo?.nickName }}</span> 相恋 
              <span class="text-romantic-pink font-bold">{{ coupleInfo.loveDays }}</span> 天
            </span>
            <span class="text-lg">❤️</span>
          </div>
          
          <!-- 未配对 - 显示配对入口 -->
          <NuxtLink v-else to="/couple/pair" class="mt-4">
            <Button variant="love" class="gap-2">
              <Icon name="lucide:heart-handshake" class="w-4 h-4" />
              去配对另一半
            </Button>
          </NuxtLink>
        </div>
      </CardContent>
    </Card>

    <!-- 数据统计 -->
    <Card>
      <CardContent class="p-4">
        <div class="grid grid-cols-5 gap-2 text-center">
          <div>
            <div class="text-xl font-bold text-romantic-pink">{{ statistics.diaryCount }}</div>
            <div class="text-xs text-muted-foreground">日记</div>
          </div>
          <div>
            <div class="text-xl font-bold text-romantic-pink">{{ statistics.photoCount }}</div>
            <div class="text-xs text-muted-foreground">照片</div>
          </div>
          <div>
            <div class="text-xl font-bold text-romantic-pink">{{ statistics.anniversaryCount }}</div>
            <div class="text-xs text-muted-foreground">纪念日</div>
          </div>
          <div>
            <div class="text-xl font-bold text-romantic-pink">{{ statistics.checkInDays }}</div>
            <div class="text-xs text-muted-foreground">签到</div>
          </div>
          <div>
            <div class="text-xl font-bold text-romantic-pink">{{ statistics.totalPoints }}</div>
            <div class="text-xs text-muted-foreground">积分</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 徽章展示 -->
    <Card>
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base flex items-center gap-2">
            <span>🏅</span>
            我的徽章
          </CardTitle>
          <NuxtLink to="/profile/badges" class="text-sm text-romantic-pink">
            查看全部
          </NuxtLink>
        </div>
      </CardHeader>
      <CardContent>
        <div class="flex items-center gap-4 overflow-x-auto pb-2">
          <div 
            v-for="badge in badges" 
            :key="badge.id"
            class="flex flex-col items-center gap-1 shrink-0"
          >
            <div class="w-12 h-12 rounded-full bg-romantic-blush flex items-center justify-center text-2xl">
              {{ badge.icon }}
            </div>
            <span class="text-xs text-muted-foreground">{{ badge.name }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 功能菜单 -->
    <Card>
      <CardContent class="p-2">
        <div class="divide-y">
          <NuxtLink 
            v-for="item in menuItems" 
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-4 px-4 py-3 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon :name="item.icon" class="w-5 h-5 text-muted-foreground" />
            <span class="flex-1 text-foreground">{{ item.label }}</span>
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-muted-foreground" />
          </NuxtLink>
        </div>
      </CardContent>
    </Card>

    <!-- 退出登录 -->
    <Button variant="outline" class="w-full text-destructive hover:text-destructive">
      <Icon name="lucide:log-out" class="w-4 h-4" />
      退出登录
    </Button>

    <!-- 版本信息 -->
    <p class="text-center text-xs text-muted-foreground">
      LoveDay v1.0.0 · Made with ldh
    </p>
  </div>
</template>
