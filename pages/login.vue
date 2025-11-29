<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useUserStore } from '~/stores/user'

definePageMeta({
  layout: 'auth',
})

const userStore = useUserStore()

const loginType = ref<'code' | 'password'>('code')
const phone = ref('')
const code = ref('')
const password = ref('')
const isLoading = ref(false)
const countdown = ref(0)
const errorMsg = ref('')

const canSendCode = computed(() => {
  return phone.value.length === 11 && countdown.value === 0
})

const sendCode = async () => {
  if (!canSendCode.value) return
  
  // 模拟发送验证码（实际项目中调用短信 API）
  alert('验证码已发送，测试验证码：123456')
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleLogin = async () => {
  errorMsg.value = ''
  
  if (!phone.value || phone.value.length !== 11) {
    errorMsg.value = '请输入正确的手机号'
    return
  }
  
  if (loginType.value === 'code' && !code.value) {
    errorMsg.value = '请输入验证码'
    return
  }
  
  if (loginType.value === 'password' && !password.value) {
    errorMsg.value = '请输入密码'
    return
  }

  isLoading.value = true
  
  try {
    console.log('开始登录...', { phone: phone.value, loginType: loginType.value })
    
    const result = await userStore.login(
      phone.value,
      code.value,
      loginType.value === 'code' ? 0 : 1,
      password.value
    )
    
    console.log('登录结果:', result)
    
    if (result.success) {
      console.log('登录成功，准备跳转...')
      // 登录成功，跳转到首页
      window.location.href = '/'
    } else {
      errorMsg.value = result.message || '登录失败'
    }
  } catch (error: any) {
    console.error('登录错误:', error)
    errorMsg.value = error.message || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <Card class="shadow-lg">
      <CardHeader class="text-center">
        <CardTitle class="text-xl">欢迎回来</CardTitle>
        <CardDescription>登录你的 Lovory 账号</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 登录方式切换 -->
        <div class="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <button
            class="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            :class="loginType === 'code' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
            @click="loginType = 'code'"
          >
            验证码登录
          </button>
          <button
            class="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            :class="loginType === 'password' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
            @click="loginType = 'password'"
          >
            密码登录
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMsg" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
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
          <div v-if="loginType === 'code'">
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

          <!-- 密码 -->
          <div v-else>
            <label class="text-sm font-medium text-foreground mb-2 block">密码</label>
            <Input 
              v-model="password"
              type="password"
              placeholder="请输入密码"
            />
          </div>

          <!-- 登录按钮 -->
          <Button 
            type="submit" 
            variant="love" 
            class="w-full"
            :disabled="isLoading"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ isLoading ? '登录中...' : '登录' }}
          </Button>
        </form>

        <!-- 其他登录方式 -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">或</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <Button variant="outline" class="w-full">
            <Icon name="lucide:message-circle" class="w-4 h-4 text-green-500" />
            微信登录
          </Button>
          <Button variant="outline" class="w-full">
            <Icon name="lucide:smartphone" class="w-4 h-4 text-blue-500" />
            一键登录
          </Button>
        </div>

        <!-- 注册链接 -->
        <p class="text-center text-sm text-muted-foreground">
          还没有账号？
          <NuxtLink to="/register" class="text-romantic-pink hover:underline">
            立即注册
          </NuxtLink>
        </p>
      </CardContent>
    </Card>
  </div>
</template>
