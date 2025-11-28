<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar'

interface Partner {
  id: number
  nickName: string
  avatarUrl?: string
  coupleNickname?: string
}

defineProps<{
  myInfo: Partner
  partnerInfo: Partner
}>()
</script>

<template>
  <div class="flex items-center justify-center gap-6 py-4">
    <!-- 我的头像 -->
    <div class="flex flex-col items-center gap-2">
      <Avatar class="w-16 h-16 ring-2 ring-romantic-pink ring-offset-2">
        <AvatarImage :src="myInfo.avatarUrl" :alt="myInfo.nickName" />
        <AvatarFallback class="bg-romantic-pink text-white text-lg">
          {{ myInfo.nickName?.charAt(0) }}
        </AvatarFallback>
      </Avatar>
      <span class="text-sm font-medium text-foreground">{{ myInfo.coupleNickname || myInfo.nickName }}</span>
    </div>

    <!-- 爱心连接 -->
    <div class="flex flex-col items-center">
      <div class="text-3xl animate-heart-beat">❤️</div>
      <div class="h-0.5 w-12 bg-gradient-to-r from-romantic-pink to-romantic-rose rounded-full" />
    </div>

    <!-- 对方头像 -->
    <div class="flex flex-col items-center gap-2">
      <Avatar class="w-16 h-16 ring-2 ring-romantic-rose ring-offset-2">
        <AvatarImage :src="partnerInfo.avatarUrl" :alt="partnerInfo.nickName" />
        <AvatarFallback class="bg-romantic-rose text-white text-lg">
          {{ partnerInfo.nickName?.charAt(0) }}
        </AvatarFallback>
      </Avatar>
      <span class="text-sm font-medium text-foreground">{{ partnerInfo.coupleNickname || partnerInfo.nickName }}</span>
    </div>
  </div>
</template>
