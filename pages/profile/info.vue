<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { useUserStore } from '~/stores/user'
import type { ApiResponse } from '~/server/utils/response'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const userStore = useUserStore()

// 状态
const loading = ref(true)
const saving = ref(false)
const error = ref('')

// 表单数据
const form = ref({
  nickName: '',
  avatarUrl: '',
  gender: 0,
  birthday: '',
})

// 性别选项
const genderOptions = [
  { value: 0, label: '保密', icon: '🤫' },
  { value: 1, label: '男', icon: '👨' },
  { value: 2, label: '女', icon: '👩' },
]

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await useAuthFetch<ApiResponse<any>>('/api/user/info')
    
    if (data.value?.code === 0) {
      const user = data.value.data
      form.value = {
        nickName: user.nickName || '',
        avatarUrl: user.avatarUrl || '',
        gender: user.gender || 0,
        birthday: user.birthday || '',
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

await fetchUserInfo()

// 保存资料
const handleSave = async () => {
  if (!form.value.nickName.trim()) {
    alert('请输入昵称')
    return
  }

  saving.value = true
  
  try {
    const response = await authFetch<ApiResponse<any>>('/api/user/update', {
      method: 'PUT',
      body: {
        nickName: form.value.nickName,
        avatarUrl: form.value.avatarUrl,
        gender: form.value.gender,
        birthday: form.value.birthday,
      },
    })
    
    if (response?.code === 0) {
      // 更新本地用户信息
      userStore.userInfo = {
        ...userStore.userInfo,
        ...response.data,
      }
      router.back()
    } else {
      alert(response?.message || '保存失败')
    }
  } catch (e) {
    console.error('保存失败:', e)
    alert('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 选择头像（模拟，实际需要上传功能）
const avatarPresets = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
]

const showAvatarPicker = ref(false)

const selectAvatar = (url: string) => {
  form.value.avatarUrl = url
  showAvatarPicker.value = false
}
</script>

<template>
  <div class="max-w-lg mx-auto space-y-6 animate-fade-in">
    <!-- 页面标题 -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold text-foreground">个人资料</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin text-romantic-pink" />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="text-center py-12">
      <Icon name="lucide:alert-circle" class="w-12 h-12 text-destructive/60 mx-auto mb-4" />
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button variant="outline" @click="fetchUserInfo">重试</Button>
    </div>

    <template v-else>
      <!-- 头像 -->
      <Card>
        <CardContent class="p-6">
          <div class="flex flex-col items-center">
            <div class="relative">
              <Avatar class="w-24 h-24">
                <AvatarImage v-if="form.avatarUrl" :src="form.avatarUrl" />
                <AvatarFallback class="bg-romantic-pink text-white text-2xl">
                  {{ form.nickName?.charAt(0) || '?' }}
                </AvatarFallback>
              </Avatar>
              <button 
                class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-romantic-pink text-white flex items-center justify-center shadow-lg"
                @click="showAvatarPicker = true"
              >
                <Icon name="lucide:camera" class="w-4 h-4" />
              </button>
            </div>
            <p class="text-sm text-muted-foreground mt-2">点击更换头像</p>
          </div>
        </CardContent>
      </Card>

      <!-- 头像选择器 -->
      <Card v-if="showAvatarPicker">
        <CardContent class="p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium">选择头像</span>
            <button class="text-muted-foreground" @click="showAvatarPicker = false">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
          <div class="grid grid-cols-6 gap-2">
            <button
              v-for="(url, idx) in avatarPresets"
              :key="idx"
              class="aspect-square rounded-full overflow-hidden ring-2 transition-all"
              :class="form.avatarUrl === url ? 'ring-romantic-pink' : 'ring-transparent hover:ring-muted'"
              @click="selectAvatar(url)"
            >
              <img :src="url" class="w-full h-full" />
            </button>
          </div>
        </CardContent>
      </Card>

      <!-- 基本信息 -->
      <Card>
        <CardContent class="p-6 space-y-4">
          <!-- 昵称 -->
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">昵称</label>
            <Input 
              v-model="form.nickName"
              placeholder="请输入昵称"
              maxlength="20"
            />
          </div>

          <!-- 性别 -->
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">性别</label>
            <div class="flex gap-2">
              <button
                v-for="option in genderOptions"
                :key="option.value"
                class="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors"
                :class="form.gender === option.value 
                  ? 'bg-romantic-pink/10 border-romantic-pink text-romantic-pink' 
                  : 'border-border hover:border-romantic-pink/50'"
                @click="form.gender = option.value"
              >
                <span>{{ option.icon }}</span>
                <span class="text-sm">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <!-- 生日 -->
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">生日</label>
            <Input 
              v-model="form.birthday"
              type="date"
            />
          </div>
        </CardContent>
      </Card>

      <!-- 保存按钮 -->
      <Button 
        variant="love" 
        class="w-full"
        :disabled="saving"
        @click="handleSave"
      >
        <Icon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
        {{ saving ? '保存中...' : '保存修改' }}
      </Button>
    </template>
  </div>
</template>
