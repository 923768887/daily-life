<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'
import { useAuthFetch, authFetch } from '~/composables/useAuthFetch'

definePageMeta({
  layout: 'default',
})

interface CoupleInfo {
  coupleId: number
  loveStartDate: string
  loveDays: number
  relationshipType: number
  signature?: string
  myInfo: {
    id: number
    nickName: string
    coupleNickname?: string
    avatarUrl?: string
  }
  partnerInfo: {
    id: number
    nickName: string
    coupleNickname?: string
    avatarUrl?: string
  }
}

const { data: coupleData, refresh } = await useAuthFetch<{ code: number; data: CoupleInfo }>('/api/couple/info')

const coupleInfo = computed(() => coupleData.value?.data)
const isPaired = computed(() => coupleInfo.value?.loveDays && coupleInfo.value.loveDays > 0)

// 表单数据
const formData = ref({
  loveStartDate: '',
  relationshipType: 0,
  signature: '',
  coupleNickname: '',
})

// 初始化表单数据
watch(coupleInfo, (info) => {
  if (info) {
    formData.value = {
      loveStartDate: info.loveStartDate || '',
      relationshipType: info.relationshipType || 0,
      signature: info.signature || '',
      coupleNickname: info.myInfo?.coupleNickname || '',
    }
  }
}, { immediate: true })

const isLoading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const relationshipTypes = [
  { value: 0, label: '恋爱中 💕' },
  { value: 1, label: '已订婚 💍' },
  { value: 2, label: '已结婚 👰' },
]

const handleSubmit = async () => {
  isLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const response = await authFetch<any>('/api/couple/update', {
      method: 'PUT',
      body: formData.value,
    })

    if (response?.code === 0) {
      successMsg.value = '保存成功！'
      await refresh()
      setTimeout(() => {
        successMsg.value = ''
      }, 2000)
    } else {
      errorMsg.value = response?.message || '保存失败'
    }
  } catch (error: any) {
    errorMsg.value = error.message || '保存失败'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  navigateTo('/profile')
}
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 返回按钮 -->
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" @click="goBack">
        <Icon name="lucide:arrow-left" class="w-5 h-5" />
      </Button>
      <h1 class="text-xl font-bold">情侣档案</h1>
    </div>

    <!-- 未配对提示 -->
    <Card v-if="!isPaired" class="text-center py-8">
      <CardContent>
        <Icon name="lucide:heart" class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p class="text-muted-foreground mb-4">还没有配对，快去邀请你的另一半吧</p>
        <Button @click="navigateTo('/couple/pair')">
          <Icon name="lucide:user-plus" class="w-4 h-4 mr-2" />
          去配对
        </Button>
      </CardContent>
    </Card>

    <!-- 已配对 - 情侣信息展示 -->
    <template v-else>
      <!-- 情侣头像卡片 -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center justify-center gap-4">
            <div class="text-center">
              <Avatar class="w-20 h-20 mx-auto ring-2 ring-romantic-pink">
                <AvatarImage :src="coupleInfo?.myInfo?.avatarUrl" />
                <AvatarFallback class="bg-romantic-pink text-white text-xl">
                  {{ coupleInfo?.myInfo?.nickName?.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <p class="mt-2 font-medium">{{ coupleInfo?.myInfo?.coupleNickname || coupleInfo?.myInfo?.nickName }}</p>
              <p class="text-xs text-muted-foreground">我</p>
            </div>
            
            <div class="flex flex-col items-center">
              <Icon name="lucide:heart" class="w-8 h-8 text-romantic-pink animate-pulse" />
              <span class="text-sm text-romantic-pink font-bold mt-1">{{ coupleInfo?.loveDays }} 天</span>
            </div>
            
            <div class="text-center">
              <Avatar class="w-20 h-20 mx-auto ring-2 ring-romantic-rose">
                <AvatarImage :src="coupleInfo?.partnerInfo?.avatarUrl" />
                <AvatarFallback class="bg-romantic-rose text-white text-xl">
                  {{ coupleInfo?.partnerInfo?.nickName?.charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <p class="mt-2 font-medium">{{ coupleInfo?.partnerInfo?.coupleNickname || coupleInfo?.partnerInfo?.nickName }}</p>
              <p class="text-xs text-muted-foreground">TA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- 编辑表单 -->
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">编辑信息</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- 恋爱开始日期 -->
          <div class="space-y-2">
            <label for="loveStartDate" class="text-sm font-medium">
              <Icon name="lucide:calendar-heart" class="w-4 h-4 inline mr-1" />
              恋爱开始日期
            </label>
            <Input
              id="loveStartDate"
              v-model="formData.loveStartDate"
              type="date"
              :max="new Date().toISOString().split('T')[0]"
            />
            <p class="text-xs text-muted-foreground">修改后会重新计算相恋天数</p>
          </div>

          <!-- 关系状态 -->
          <div class="space-y-2">
            <label class="text-sm font-medium">
              <Icon name="lucide:heart-handshake" class="w-4 h-4 inline mr-1" />
              关系状态
            </label>
            <div class="flex gap-2 flex-wrap">
              <Button
                v-for="type in relationshipTypes"
                :key="type.value"
                :variant="formData.relationshipType === type.value ? 'default' : 'outline'"
                size="sm"
                @click="formData.relationshipType = type.value"
              >
                {{ type.label }}
              </Button>
            </div>
          </div>

          <!-- 情侣昵称 -->
          <div class="space-y-2">
            <label for="coupleNickname" class="text-sm font-medium">
              <Icon name="lucide:smile" class="w-4 h-4 inline mr-1" />
              我的情侣昵称
            </label>
            <Input
              id="coupleNickname"
              v-model="formData.coupleNickname"
              placeholder="给自己起个甜蜜的昵称"
              maxlength="10"
            />
          </div>

          <!-- 情侣签名 -->
          <div class="space-y-2">
            <label for="signature" class="text-sm font-medium">
              <Icon name="lucide:quote" class="w-4 h-4 inline mr-1" />
              情侣签名
            </label>
            <Input
              id="signature"
              v-model="formData.signature"
              placeholder="写下你们的爱情宣言"
              maxlength="50"
            />
          </div>

          <!-- 提示信息 -->
          <div v-if="successMsg" class="p-3 bg-green-50 text-green-600 rounded-lg text-sm">
            {{ successMsg }}
          </div>
          <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {{ errorMsg }}
          </div>

          <!-- 保存按钮 -->
          <Button 
            class="w-full" 
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
            <Icon v-else name="lucide:save" class="w-4 h-4 mr-2" />
            保存修改
          </Button>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
