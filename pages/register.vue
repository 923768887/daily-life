<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useUserStore } from '~/stores/user'

definePageMeta({
  layout: 'auth',
  middleware: 'auth',
})

const userStore = useUserStore()
const router = useRouter()

const phone = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickName = ref('')
const isLoading = ref(false)
const countdown = ref(0)
const errorMsg = ref('')

const canSendCode = computed(() => {
  return phone.value.length === 11 && countdown.value === 0
})

const sendCode = async () => {
  if (!canSendCode.value) return
  
  // 模拟发送验证码
  alert('验证码已发送，测试验证码：123456')
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleRegister = async () => {
  errorMsg.value = ''
  
  if (!phone.value || phone.value.length !== 11) {
    errorMsg.value = '请输入正确的手机号'
    return
  }
  
  if (!code.value) {
    errorMsg.value = '请输入验证码'
    return
  }
  
  if (!nickName.value.trim()) {
    errorMsg.value = '请输入昵称'
    return
  }
  
  if (password.value && password.value.length < 6) {
    errorMsg.value = '密码至少6位'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '两次密码不一致'
    return
  }

  isLoading.value = true
  
  try {
    // 调用注册 API
    const response = await $fetch<any>('/api/user/register', {
      method: 'POST',
      body: {
        phone: phone.value,
        code: code.value,
        nickName: nickName.value,
        password: password.value || undefined,
      },
    })
    
    if (response?.code === 0) {
      // 注册成功，自动登录
      userStore.setToken(response.data.token)
      userStore.setUserInfo(response.data.userInfo)
      await router.replace('/couple/pair')
    } else {
      errorMsg.value = response?.message || '注册失败'
    }
  } catch (error: any) {
    errorMsg.value = error.message || '注册失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <Card class="shadow-lg">
      <CardHeader class="text-center">
        <CardTitle class="text-xl">创建账号</CardTitle>
        <CardDescription>加入 Lovory，开始记录你们的美好时光</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 错误提示 -->
        <div v-if="errorMsg" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- 手机号 -->
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">手机号</label>
            <Input 
              v-model="phone"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
            />
          </div>

          <!-- 验证码 -->
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">验证码</label>
            <div class="flex gap-2">
              <Input 
                v-model="code"
                type="text"
                placeholder="请输入验证码"
                maxlength="6"
                class="flex-1"
              />
              <Button 
                type="button"
                variant="outline"
                :disabled="!canSendCode"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </Button>
            </div>
          </div>

          <!-- 昵称 -->
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">昵称</label>
            <Input 
              v-model="nickName"
              type="text"
              placeholder="给自己起个昵称吧"
              maxlength="20"
            />
          </div>

          <!-- 密码（可选） -->
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">
              密码 <span class="text-muted-foreground font-normal">(可选，用于密码登录)</span>
            </label>
            <Input 
              v-model="password"
              type="password"
              placeholder="请输入密码，至少6位"
            />
          </div>

          <!-- 确认密码 -->
          <div v-if="password">
            <label class="text-sm font-medium text-foreground mb-2 block">确认密码</label>
            <Input 
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
            />
          </div>

          <!-- 注册按钮 -->
          <Button 
            type="submit" 
            variant="love" 
            class="w-full"
            :disabled="isLoading"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ isLoading ? '注册中...' : '注册' }}
          </Button>
        </form>

        <!-- 用户协议 -->
        <p class="text-center text-xs text-muted-foreground">
          注册即表示同意
          <a href="#" class="text-romantic-pink hover:underline">用户协议</a>
          和
          <a href="#" class="text-romantic-pink hover:underline">隐私政策</a>
        </p>

        <!-- 登录链接 -->
        <p class="text-center text-sm text-muted-foreground">
          已有账号？
          <NuxtLink to="/login" class="text-romantic-pink hover:underline">
            立即登录
          </NuxtLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
