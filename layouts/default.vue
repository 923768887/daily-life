<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { useUserStore } from '~/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const navItems = [
  { path: '/', icon: 'lucide:home', label: '首页' },
  { path: '/diary', icon: 'lucide:book-heart', label: '日记' },
  { path: '/album', icon: 'lucide:images', label: '相册' },
  { path: '/schedule', icon: 'lucide:calendar', label: '日程' },
  { path: '/profile', icon: 'lucide:user', label: '我的' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-romantic-blush">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-50 glass-effect border-b">
      <div class="container flex items-center justify-between h-16 px-4">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-2xl">💕</span>
          <span class="font-bold text-xl love-gradient-text">Lovory</span>
        </NuxtLink>
        
        <!-- 桌面端导航 -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink 
            v-for="item in navItems" 
            :key="item.path"
            :to="item.path"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.path) 
              ? 'bg-romantic-pink text-white' 
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <NuxtLink to="/message">
            <Button variant="ghost" size="icon">
              <Icon name="lucide:message-circle" class="w-5 h-5" />
            </Button>
          </NuxtLink>
          <Button variant="ghost" size="icon" @click="handleLogout" title="退出登录">
            <Icon name="lucide:log-out" class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="container px-4 py-6 pb-24 md:pb-6">
      <slot />
    </main>

    <!-- 移动端底部导航 -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-effect border-t">
      <div class="flex items-center justify-around h-16">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
          :class="isActive(item.path) 
            ? 'text-romantic-pink' 
            : 'text-muted-foreground'"
        >
          <Icon :name="item.icon" class="w-5 h-5" />
          <span class="text-xs">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
