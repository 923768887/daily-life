<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

definePageMeta({
  layout: 'auth',
})

const mode = ref<'generate' | 'input'>('generate')
const inputCode = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const generatedCode = ref<{ code: string; expireTime: string } | null>(null)
const checkingStatus = ref(false)
let statusCheckInterval: any = null

// 检查配对状态（发起方用）
const checkPairStatus = async () => {
  try {
    const response = await authFetch<any>('/api/couple/info')
    if (response?.code === 0 && response.data?.loveDays > 0) {
      // 配对成功！
      clearInterval(statusCheckInterval)
      alert('对方已完成配对！')
      window.location.href = '/'
    }
  } catch (error) {
    // 忽略错误，继续轮询
  }
}

// 开始轮询检查状态
const startStatusCheck = () => {
  checkingStatus.value = true
  // 每 3 秒检查一次
  statusCheckInterval = setInterval(checkPairStatus, 3000)
}

// 停止轮询
const stopStatusCheck = () => {
  checkingStatus.value = false
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
    statusCheckInterval = null
  }
}

// 组件卸载时清理
onUnmounted(() => {
  stopStatusCheck()
})

// 生成邀请码
const generateCode = async () => {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const response = await authFetch<any>('/api/couple/invite', {
      method: 'POST',
    })
    
    if (response?.code === 0) {
      generatedCode.value = {
        code: response.data.inviteCode,
        expireTime: new Date(response.data.expireTime).toLocaleString(),
      }
      // 生成邀请码后开始轮询检查配对状态
      startStatusCheck()
    } else {
      errorMsg.value = response?.message || '生成失败'
    }
  } catch (error: any) {
    errorMsg.value = error.message || '生成失败'
  } finally {
    isLoading.value = false
  }
}

// 提交邀请码配对
const submitCode = async () => {
  if (!inputCode.value.trim()) {
    errorMsg.value = '请输入邀请码'
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''
  try {
    const response = await authFetch<any>('/api/couple/pair', {
      method: 'POST',
      body: { inviteCode: inputCode.value.trim() },
    })
    
    if (response?.code === 0) {
      alert('配对成功！')
      window.location.href = '/'
    } else {
      errorMsg.value = response?.message || '配对失败'
    }
  } catch (error: any) {
    errorMsg.value = error.message || '配对失败'
  } finally {
    isLoading.value = false
  }
}

const copyCode = () => {
  if (generatedCode.value) {
    navigator.clipboard.writeText(generatedCode.value.code)
    alert('邀请码已复制')
  }
}

// 跳过配对，直接进入首页
const skipPair = () => {
  window.location.href = '/'
}
</script>

<template>
  <div class="max-w-md mx-auto space-y-6">
    <Card class="shadow-lg">
      <CardHeader class="text-center">
        <div class="text-5xl mb-4 animate-heart-beat">💕</div>
        <CardTitle class="text-xl">情侣配对</CardTitle>
        <CardDescription>和你的另一半建立专属连接</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <!-- 错误提示 -->
        <div v-if="errorMsg" class="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {{ errorMsg }}
        </div>

        <!-- 模式切换 -->
        <div class="flex items-center gap-2 p-1 bg-muted rounded-lg">
          <button
            class="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            :class="mode === 'generate' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
            @click="mode = 'generate'"
          >
            生成邀请码
          </button>
          <button
            class="flex-1 py-2 rounded-md text-sm font-medium transition-colors"
            :class="mode === 'input' ? 'bg-white shadow text-foreground' : 'text-muted-foreground'"
            @click="mode = 'input'"
          >
            输入邀请码
          </button>
        </div>

        <!-- 生成邀请码 -->
        <div v-if="mode === 'generate'" class="space-y-4">
          <p class="text-sm text-muted-foreground text-center">
            生成一个邀请码，发送给你的另一半
          </p>
          
          <div v-if="generatedCode" class="space-y-4">
            <div class="p-6 bg-romantic-blush rounded-xl text-center">
              <p class="text-sm text-muted-foreground mb-2">你的邀请码</p>
              <p class="text-3xl font-bold text-romantic-pink tracking-widest">
                {{ generatedCode.code }}
              </p>
              <p class="text-xs text-muted-foreground mt-2">
                有效期至 {{ generatedCode.expireTime }}
              </p>
            </div>

            <!-- 等待配对提示 -->
            <div v-if="checkingStatus" class="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-600 text-sm">
              <Icon name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              等待对方输入邀请码...
            </div>
            
            <div class="flex gap-2">
              <Button variant="outline" class="flex-1" @click="copyCode">
                <Icon name="lucide:copy" class="w-4 h-4" />
                复制
              </Button>
              <Button variant="outline" class="flex-1">
                <Icon name="lucide:share-2" class="w-4 h-4" />
                分享
              </Button>
            </div>
            
            <Button variant="ghost" class="w-full" @click="generateCode">
              重新生成
            </Button>
          </div>
          
          <Button 
            v-else
            variant="love" 
            class="w-full"
            :disabled="isLoading"
            @click="generateCode"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ isLoading ? '生成中...' : '生成邀请码' }}
          </Button>
        </div>

        <!-- 输入邀请码 -->
        <div v-else class="space-y-4">
          <p class="text-sm text-muted-foreground text-center">
            输入对方发送给你的邀请码
          </p>
          
          <Input 
            v-model="inputCode"
            placeholder="请输入8位邀请码"
            class="text-center text-lg tracking-widest"
            maxlength="8"
          />
          
          <Button 
            variant="love" 
            class="w-full"
            :disabled="isLoading || !inputCode.trim()"
            @click="submitCode"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            {{ isLoading ? '配对中...' : '确认配对' }}
          </Button>
        </div>

        <!-- 扫码配对 -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">或</span>
          </div>
        </div>

        <Button variant="outline" class="w-full">
          <Icon name="lucide:qr-code" class="w-4 h-4" />
          扫码配对
        </Button>
      </CardContent>
    </Card>

    <p class="text-center text-sm text-muted-foreground">
      配对后，你们将共享日记、相册、纪念日等内容
    </p>

    <!-- 跳过配对 -->
    <p class="text-center">
      <button 
        class="text-sm text-muted-foreground hover:text-foreground underline"
        @click="skipPair"
      >
        暂时跳过，稍后配对
      </button>
    </p>
  </div>
</template>
